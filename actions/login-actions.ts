// app/login/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { APIError } from "better-auth/api";

// Zod schema for server-side validation
const MagicLinkSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

export type MagicLinkSignInInput = z.infer<typeof MagicLinkSignInSchema>;

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
        callbackURL: "/dashboard", // Redirect to dashboard after successful login
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