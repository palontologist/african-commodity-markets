import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function syncUserFromClerk(clerkUser: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}) {
  if (!db) {
    console.warn('Database not available for user sync');
    return null;
  }

  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new Error('No email address found for user');
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, clerkUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, clerkUser.id));
      
      return existingUser[0];
    } else {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          id: clerkUser.id,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        })
        .returning();
      
      return newUser[0];
    }
  } catch (error) {
    console.error('Error syncing user from Clerk:', error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  if (!db) {
    console.warn('Database not available for user deletion');
    return;
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}