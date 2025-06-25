"use server";

import { cookies } from "next/headers";
import { db } from "./prisma";

const GUEST_SESSION_COOKIE = "guest-session";
const GUEST_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate a guest session ID
export async function generateGuestId() {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a guest session
export async function createGuestSession() {
  const guestId = await generateGuestId();
  const expiresAt = new Date(Date.now() + GUEST_SESSION_DURATION);
  
  // Set cookie
  cookies().set(GUEST_SESSION_COOKIE, guestId, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Create guest user in database
  try {
    const guestUser = await db.user.create({
      data: {
        clerkUserId: guestId,
        name: "Guest User",
        email: `${guestId}@guest.local`,
        imageUrl: null,
      },
    });

    // Create a default account for the guest
    await db.account.create({
      data: {
        name: "Guest Account",
        type: "CURRENT",
        balance: 1000, // Start with some demo balance
        isDefault: true,
        userId: guestUser.id,
      },
    });

    return guestUser;
  } catch (error) {
    console.error("Error creating guest user:", error);
    throw new Error("Failed to create guest session");
  }
}

// Get guest session
export async function getGuestSession() {
  const cookieStore = cookies();
  const guestId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  
  if (!guestId) {
    return null;
  }

  try {
    const guestUser = await db.user.findUnique({
      where: { clerkUserId: guestId },
    });

    return guestUser;
  } catch (error) {
    console.error("Error fetching guest user:", error);
    return null;
  }
}

// Clear guest session
export async function clearGuestSession() {
  const cookieStore = cookies();
  const guestId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  
  if (guestId) {
    // Delete guest data from database
    try {
      await db.user.delete({
        where: { clerkUserId: guestId },
      });
    } catch (error) {
      console.error("Error deleting guest user:", error);
    }
  }

  // Clear cookie
  cookies().delete(GUEST_SESSION_COOKIE);
}

// Check if user ID is a guest
export async function isGuestUser(userId) {
  return userId && userId.startsWith("guest_");
}
