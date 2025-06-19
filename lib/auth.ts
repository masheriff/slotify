// lib/auth.ts
import { betterAuth } from "better-auth";
import { magicLink, admin, organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verifications,
  organizations,
  members,
  invitations,
} from "@/db/schema/auth-schema";
import { sendMagicLinkEmail } from "@/app/actions/email-actions";

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
      invitation: invitations
    },
  }),
  plugins: [
    admin({
      defaultRole: 'super_admin'
    }),
    organization(),
    magicLink({
      async sendMagicLink({ email, url }) {
        try {
          const result = await sendMagicLinkEmail({
            email,
            url,
            expiresIn: '5 minutes'
          });

          if (!result.success) {
            console.error('Failed to send magic link email:', result.error);
            throw new Error(`Email sending failed: ${result.error}`);
          }

          console.log('Magic link email sent successfully:', result.messageId);
        } catch (error) {
          console.error('Magic link email error:', error);
          throw error;
        }
      },
    }),
  ],
});