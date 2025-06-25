import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { getGuestSession } from "./guest";

export const checkUser = async () => {
  const user = await currentUser();

  // If no Clerk user, check for guest session
  if (!user) {
    const guestUser = await getGuestSession();
    return guestUser;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
