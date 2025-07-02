// app/login/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { MagicLinkSignInInput, MagicLinkSignInSchema } from "@/schemas";

// Zod schema for server-side validation


export async function sendMagicLinkAction(formData: MagicLinkSignInInput) {
  const validatedFields = MagicLinkSignInSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, recaptchaToken } = validatedFields.data;

  try {
    // Call the Better Auth magic link API
    await auth.api.signInMagicLink({
      body: {
        email,
        callbackURL: "/auth/callback", // Redirect to dashboard after successful login
      },
      headers: {
        // Pass reCAPTCHA token to the server-side API call
        "x-captcha-response": recaptchaToken,
      },
    });

    return { 
      success: true, 
      message: "Magic link sent! Please check your email to complete the login." 
    };
  } catch (error) {
    console.error("Magic link error:", error);
    
    if (error instanceof APIError) {
      return { 
        success: false, 
        error: { general: error.message } 
      };
    }
    
    return { 
      success: false, 
      error: { general: "Failed to send magic link. Please try again." } 
    };
  }
}