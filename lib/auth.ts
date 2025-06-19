// lib/auth.ts
import { betterAuth } from "better-auth";
import {
  magicLink,
  admin,
  organization as organisationPlugin,
  captcha,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendMagicLinkEmail } from "@/app/actions/email-actions";
import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  users,
  verifications,
} from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verification: verifications,
      organization: organizations,
      member: members,
      invitation: invitations,
    },
    debugLogs: true, // Set to true to enable debug logs for the adapter
  }),
  plugins: [
    admin({
      defaultRole: "super_admin",
    }),
    organisationPlugin(),
    magicLink({
      disableSignUp: true,
      expiresIn: 300,
      sendMagicLink: async ({ email, url }) => {
        try {
          const result = await sendMagicLinkEmail({
            email,
            url,
            expiresIn: "10 minutes",
          });

          if (!result.success) {
            console.error("Failed to send magic link email:", result.error);
            throw new Error(`Email sending failed: ${result.error}`);
          }

          console.log("Magic link email sent successfully:", result.messageId);
        } catch (error) {
          console.error("Magic link email error:", error);
          throw error;
        }
      },
    }),
    captcha({
      provider: "google-recaptcha",
      secretKey: process.env.RECAPTCHA_SECRET_KEY ?? "",
      minScore: 0.5, // Adjust the minimum score as needed
      endpoints: [
        "/sign-in/magic-link",
      ], // Specify the endpoints that require CAPTCHA verification
    }),
    nextCookies(),
  ],
  rateLimit: {
    enabled: process.env.NODE_ENV === "production", // Enable rate limiting
    max: 10, // Maximum requests per IP per minute
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests, please try again later.",
    customRules: {
      "/sign-in/magic-link": {
        max: 3, // Maximum requests for magic link endpoint
        window: 60 * 1000, // 1 minute
        message: "Too many requests, please try again later.",
      }
    }
  },
});
