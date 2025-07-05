// actions/profile-actions.ts
"use server";

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { deleteProfilePicture } from './file-upload.actions';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

interface ServerActionResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// Validation schemas
const nameUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
});

const emailUpdateSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim()
});

const otpVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

export async function updateUserProfilePicture(
  newImageUrl: string,
  oldImageUrl: string | null
): Promise<ServerActionResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const userId = session.user.id;

    // Delete old profile picture if it exists
    if (oldImageUrl) {
      await deleteProfilePicture(oldImageUrl);
    }

    // Update user's image in database
    await db
      .update(users)
      .set({
        image: newImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Revalidate pages that might show the profile picture
    revalidatePath('/');
    revalidatePath('/my/profile');

    return {
      success: true,
      message: 'Profile picture updated successfully'
    };

  } catch (error) {
    console.error('Profile picture update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile picture'
    };
  }
}

export async function updateUserName(formData: FormData): Promise<ServerActionResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const userId = session.user.id;

    // Get and validate name from form data
    const rawName = formData.get('name') as string;
    
    const validation = nameUpdateSchema.safeParse({ name: rawName });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      };
    }

    const { name } = validation.data;

    // Update user's name in database
    await db
      .update(users)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Revalidate pages that might show the user's name
    revalidatePath('/');
    revalidatePath('/my/profile');

    return {
      success: true,
      message: 'Name updated successfully'
    };

  } catch (error) {
    console.error('Name update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update name'
    };
  }
}