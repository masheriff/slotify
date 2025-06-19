import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  organizationClient,
  magicLinkClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), organizationClient(), magicLinkClient()],
});

export const { signIn, signOut, useSession } = authClient;

export const signInWithMagicLink = async (email: string) => {
  return await signIn.magicLink(
    {
      email,
      callbackURL: "/admin/dashboard",
    },
    {
      onSuccess: (result) => {
        console.log("Magic link sent successfully:", result);
      },
      onError: (error) => {
        console.error("Error sending magic link:", error);
      },
    }
  );
};
