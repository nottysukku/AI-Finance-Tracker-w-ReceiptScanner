"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { getUser, isAuthenticated } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) throw new Error("Unauthorized");

    const user = await getUser();
    if (!user) throw new Error("User not found");

    // Skip ArcJet rate limiting for guest users
    const { userId } = await auth();
    if (userId) {
      // Get request data for ArcJet
      const req = await request();

      // Check rate limit
      const decision = await aj.protect(req, {
        userId,
        requested: 1, // Specify how many tokens to consume
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          const { remaining, reset } = decision.reason;
          console.error({
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              remaining,
              resetInSeconds: reset,
            },
          });

          throw new Error("Too many requests. Please try again later.");
        }

        throw new Error("Request blocked");
      }
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) return null;

    const user = await getUser();
    if (!user) return null;

    const transaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) return null;

    return serializeAmount(transaction);
  } catch (error) {
    console.error("Error in getTransaction:", error);
    return null;
  }
}

export async function updateTransaction(id, data) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) throw new Error("Unauthorized");

    const user = await getUser();
    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) throw new Error("Unauthorized");

    const user = await getUser();
    if (!user) throw new Error("User not found");

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(formData) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "AI receipt scanning is not configured. Please contact the administrator."
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Get the file from FormData
    const file = formData.get('file');
    
    if (!file) {
      return {
        success: false,
        error: "No file provided"
      };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image."
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Please upload an image smaller than 5MB."
      };
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number, no currency symbols)
      - Date (in ISO format YYYY-MM-DD)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If this is not a receipt or you cannot extract the information, return:
      {
        "amount": 0,
        "date": "${new Date().toISOString().split('T')[0]}",
        "description": "Could not parse receipt",
        "merchantName": "Unknown",
        "category": "other-expense"
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text
    let cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    
    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      console.error("Raw response:", text);
      // Return fallback data
      data = {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: "Could not parse receipt",
        merchantName: "Unknown",
        category: "other-expense"
      };
    }

    // Validate and sanitize the parsed data
    const amount = parseFloat(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();
    const description = data.description || "Receipt scan";
    const category = data.category || "other-expense";
    const merchantName = data.merchantName || "Unknown";

    return {
      success: true,
      data: {
        amount,
        date,
        description,
        category,
        merchantName,
      }
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return {
      success: false,
      error: error.message || "Failed to scan receipt. Please try again or enter the details manually."
    };
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
