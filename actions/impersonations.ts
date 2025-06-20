"use server";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function startImpersonation(targetUserId: string) {
  try {
    await requireSuperAdmin();
    
    // Use Better Auth's native impersonation
    const result = await auth.api.impersonateUser({
      body: { userId: targetUserId }
    });
    
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to start impersonation" 
    };
  }
}

export async function stopImpersonation() {
  try {
    // Use Better Auth's native impersonation stop
    await auth.api.stopImpersonating({});
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to stop impersonation" 
    };
  }
}

export async function getImpersonationStatus() {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    return { 
      success: true, 
      data: { 
        isImpersonating: !!session?.session?.impersonatedBy,
        originalUser: session?.session?.impersonatedBy 
      }
    };
  } catch (error) {
    return { success: false, error: "Failed to get impersonation status" };
  }
}