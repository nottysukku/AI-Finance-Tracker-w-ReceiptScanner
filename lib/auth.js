import { auth } from "@clerk/nextjs/server";
import { getGuestSession, isGuestUser } from "./guest";
import { db } from "./prisma";

// Universal auth function that works for both Clerk and guest users
export async function getUser() {
  try {
    // First try Clerk authentication
    const { userId: clerkUserId } = await auth();
    
    if (clerkUserId) {
      const user = await db.user.findUnique({
        where: { clerkUserId },
      });
      return user;
    }

    // If no Clerk user, try guest session
    const guestUser = await getGuestSession();
    return guestUser;
  } catch (error) {
    console.error("Error in getUser:", error);
    return null;
  }
}

// Get user ID (works for both Clerk and guest)
export async function getUserId() {
  const user = await getUser();
  return user?.clerkUserId || null;
}

// Check if current user is authenticated (Clerk or guest)
export async function isAuthenticated() {
  const user = await getUser();
  return !!user;
}

// Check if current user is a guest
export async function isCurrentUserGuest() {
  const user = await getUser();
  return user ? await isGuestUser(user.clerkUserId) : false;
}
