import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message } = await request.json();

    // Always use fallback responses for now
    const responses = getHelpfulResponses(message);
    return NextResponse.json({ response: responses });

  } catch (error) {
    console.error("Chatbot API error:", error);
    
    // Fallback response for any error
    const fallbackResponse = "Thanks for your question! I'm here to help with budgeting, saving, expense tracking, and financial planning. What specific area interests you most?";
    
    return NextResponse.json({ response: fallbackResponse });
  }
}

// Predefined helpful responses for finance app
function getHelpfulResponses(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("budget") || lowerMessage.includes("budgeting")) {
    return "Great question about budgeting! Start with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. You can create and track budgets in your dashboard. Would you like tips on any specific category?";
  }
  
  if (lowerMessage.includes("save") || lowerMessage.includes("saving")) {
    return "Smart thinking about saving! Try automating your savings, start small with $25-50/week, and track your progress. Use our expense tracking to see where you can cut back. Every dollar saved is a step toward your goals!";
  }
  
  if (lowerMessage.includes("expense") || lowerMessage.includes("track")) {
    return "Expense tracking is key to financial success! Log every transaction, categorize your spending, and review weekly. Our app helps you scan receipts and automatically categorize expenses. What type of expenses are you tracking?";
  }
  
  if (lowerMessage.includes("goal") || lowerMessage.includes("target")) {
    return "Setting financial goals is excellent! Use the SMART method: Specific, Measurable, Achievable, Relevant, Time-bound. Start with small goals like saving $500 in 3 months, then work toward bigger ones. What's your main financial goal?";
  }
  
  if (lowerMessage.includes("debt") || lowerMessage.includes("loan")) {
    return "Managing debt is important for financial health. Consider the debt snowball (smallest first) or avalanche (highest interest first) methods. Always pay more than the minimum when possible. Track all debts in your accounts section.";
  }
  
  if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
    return "I'm here to help with your personal finance questions! I can assist with budgeting, saving strategies, expense tracking, goal setting, and general money management. What would you like to know more about?";
  }
  
  if (lowerMessage.includes("category") || lowerMessage.includes("categories")) {
    return "Our app includes categories like Housing, Transportation, Groceries, Entertainment, and more. Proper categorization helps you see spending patterns and budget effectively. You can add transactions and assign categories easily!";
  }
  
  // Default response
  return "Thanks for your question! I'm here to help with budgeting, saving, expense tracking, and financial planning. Feel free to ask about any aspect of personal finance, and I'll do my best to provide helpful guidance. What specific area interests you most?";
}
