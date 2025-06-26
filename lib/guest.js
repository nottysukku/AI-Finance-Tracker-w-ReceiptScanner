"use server";

import { cookies } from "next/headers";
import { db } from "./prisma";
import { seedUserData } from "@/actions/seed";

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
  const cookieStore = await cookies();
  cookieStore.set(GUEST_SESSION_COOKIE, guestId, {
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
    const guestAccount = await db.account.create({
      data: {
        name: "Guest Account",
        type: "CURRENT",
        balance: 1000, // Start with some demo balance
        isDefault: true,
        userId: guestUser.id,
      },
    });

    // Seed demo data for the guest user
    try {
      await seedUserData(guestUser.id, guestAccount.id);
    } catch (seedError) {
      console.error("Error seeding guest data:", seedError);
      // Continue without seeding if it fails
    }

    return guestUser;
  } catch (error) {
    console.error("Error creating guest user:", error);
    throw new Error("Failed to create guest session");
  }
}

// Get guest session
export async function getGuestSession() {
  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
    
    if (!guestId) {
      return null;
    }

    const guestUser = await db.user.findUnique({
      where: { clerkUserId: guestId },
    });

    return guestUser;
  } catch (error) {
    console.error("Error fetching guest user:", error);
    // During build time, cookies might not be available
    if (error.message?.includes('cookies') || error.message?.includes('headers')) {
      return null;
    }
    return null;
  }
}

// Clear guest session
export async function clearGuestSession() {
  const cookieStore = await cookies();
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
  cookieStore.delete(GUEST_SESSION_COOKIE);
}

// Check if user ID is a guest
export async function isGuestUser(userId) {
  return userId && userId.startsWith("guest_");
}
