import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  organizationClient,
  magicLinkClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), organizationClient(), magicLinkClient()],
});

export const { signOut, useSession, useActiveOrganization } = authClient;
export const admin = authClient.admin;
export const organization = authClient.organization;