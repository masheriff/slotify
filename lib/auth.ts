// lib/auth.ts
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";

import {
  magicLink,
  admin,
  organization,
  captcha,
  createAuthMiddleware,
} from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  sendMagicLinkEmail,
  sendOrganizationInvitationEmail,
} from "@/actions/email.actions";
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
import { ac, healthcareRoles } from "./permissions/healthcare-access-control";
import {
  checkUserHasActiveOrganization,
  getUserOrganizationInfo,
} from "../utils/auth-middleware.utils";

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
  user: {
    changeEmail: {
      enabled: true,
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Intercept magic link verification attempts
      if (ctx.path === "/sign-in/magic-link/verify") {
        const email = ctx.body?.email;

        if (email) {
          console.log(`🔐 Magic link verification attempt for: ${email}`);

          const hasActiveOrg = await checkUserHasActiveOrganization(email);

          if (!hasActiveOrg) {
            const orgInfo = await getUserOrganizationInfo(email);

            console.log(`❌ Login blocked for ${email}:`, {
              userId: orgInfo.userId,
              organizations: orgInfo.organizationNames,
              activeOrganizations: orgInfo.activeOrganizations,
            });

            throw new APIError("FORBIDDEN", {
              message:
                "Your organization is currently inactive. Please contact your administrator to reactivate your organization access.",
            });
          }

          console.log(
            `✅ Login allowed for ${email} - has active organization`
          );
        }
      }

      // Also check during regular magic link sign-in initiation
      if (ctx.path === "/sign-in/magic-link") {
        const email = ctx.body?.email;

        if (email) {
          console.log(`📧 Magic link request for: ${email}`);

          // Check if user exists and has active organization
          // We do this early to avoid sending magic links to users who can't login
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (user) {
            const hasActiveOrg = await checkUserHasActiveOrganization(email);

            if (!hasActiveOrg) {
              const orgInfo = await getUserOrganizationInfo(email);

              console.log(`❌ Magic link request blocked for ${email}:`, {
                userId: orgInfo.userId,
                organizations: orgInfo.organizationNames,
                activeOrganizations: orgInfo.activeOrganizations,
              });

              throw new APIError("FORBIDDEN", {
                message:
                  "Your organization is currently inactive. Please contact your administrator to reactivate your organization access.",
              });
            }
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      // Log successful logins with organization info
      if (ctx.path === "/sign-in/magic-link/verify" && ctx.context.newSession) {
        const session = ctx.context.newSession;
        const email = session.user.email;

        if (email) {
          const orgInfo = await getUserOrganizationInfo(email);

          console.log(`✅ Successful login for ${email}:`, {
            userId: session.user.id,
            sessionId: session.session.id,
            organizations: orgInfo.organizationNames,
            activeOrganizations: orgInfo.activeOrganizations,
          });
        }
      }
    }),
  },
  plugins: [
    admin({
      // Set default role for admin users
      defaultRole: "system_admin",
      roles: healthcareRoles,
    }),
    organization({
      ac: ac,
      roles: healthcareRoles,
      sendInvitationEmail: async (data) => {
        const { email, organization, invitation, inviter } = data;
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        try {
          const result = await sendOrganizationInvitationEmail({
            email: email,
            organizationName: organization.name || "Your Organization",
            inviterName: inviter.user.name || "Admin",
            invitationLink: `${baseUrl}/api/auth/organization/accept-invitation?token=${invitation.id}`,
            expiresIn: invitation.expiresAt
              ? `${Math.round((new Date(invitation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
              : "7 days",
          });

          if (!result.success) {
            console.error("Failed to send invitation email:", result.error);
            throw new Error(`Email sending failed: ${result.error}`);
          }

          console.log("Invitation email sent successfully:", result.messageId);
        } catch (error) {
          console.error("Invitation email error:", error);
          throw error;
        }
      },
      allowUserToCreateOrganization: async (user) => {
        // Example: Check if user is super_admin
        const foundUsers = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id));
        const foundUser = foundUsers[0];
        if (!foundUser) {
          throw new Error("User not found");
        }
        if (foundUser.role !== "system_admin") {
          throw new Error("Only System Admins can create organizations");
        }
        return true;
      },
      //does not exist in the organization plugin
      // allowMemberToLeaveOrganization: async (member) => {
      //   return member.role !== "super_admin";
      // },
    }),
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
      endpoints: ["/sign-in/magic-link"], // Specify the endpoints that require CAPTCHA verification
    }),
    nextCookies(),
  ],
  // Enhanced session management
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Security settings
  trustedOrigins: [process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"],
  rateLimit: {
    enabled: process.env.NODE_ENV === "production", // Enable rate limiting
    max: 10, // Maximum requests per IP per minute
    window: 60 * 1000, // 1 minute
    customRules: {
      "/sign-in/magic-link": {
        max: 3, // Maximum requests for magic link endpoint
        window: 60 * 1000, // 1 minute
      },
    },
  },
});

/**
 * Helper functions for healthcare-specific permission checks
 */
// async function checkHIPAACompliance(userId: string): Promise<boolean> {
//   // Implementation would check if user has completed HIPAA training
//   // This could query a separate training/certification table
//   return true; // Placeholder
// }

// async function checkBookingState(
//   bookingId: string,
//   requiredState: string
// ): Promise<boolean> {
//   // Implementation would check if booking is in the correct workflow state
//   return true; // Placeholder
// }

// async function checkInterpretationAssignment(
//   interpretationId: string,
//   userId: string
// ): Promise<boolean> {
//   // Implementation would verify the interpretation is assigned to this doctor
//   return true; // Placeholder
// }

// async function createDefaultHealthcareFacilitySetup(
//   organizationId: string
// ): Promise<void> {
//   // Implementation would create default procedure locations, device inventory, etc.
//   // This helps new healthcare facilities get started quickly
// }

// async function sendHealthcareFacilityWelcomeEmail(
//   organization: any,
//   user: any
// ): Promise<void> {
//   // Implementation would send compliance and setup information
// }
