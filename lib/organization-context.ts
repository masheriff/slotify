import { authClient } from "@/lib/auth-client";

// Use Better Auth's native organization methods
export async function getCurrentUserOrganizations() {
  return await authClient.organization.list();
}

export async function setActiveOrganization(organizationId: string) {
    return await authClient.organization.setActive({
    organizationId
  });
}

// The getPermissions method does not exist on authClient.organization.
// Please implement this function according to your auth provider's documentation or remove it if not needed.

// export async function getOrganizationPermissions(organizationId: string) {
//     return await authClient.organization.getPermissions({
//         organizationId
//     });
    
  
// }
