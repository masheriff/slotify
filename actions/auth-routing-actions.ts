// actions/auth-routing-actions.ts
'use server';

import { redirect } from "next/navigation";
import { db } from "@/db";
import { members, organizations, agentOrganizationAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";
import { OrganizationMetadata } from "@/types";
import { getServerSession } from "@/lib/auth-server";

/**
 * Server action to handle post-authentication routing
 * Called from the auth callback page to determine where user should go
 */
export async function handlePostAuthRouting() {
  console.log("🔄 Starting post-authentication routing...");

  // Get the current authenticated session
  const session = await getServerSession();
  
  if (!session?.user) {
    console.error("❌ No authenticated session found");
    redirect("/login?error=no_session");
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  try {
    console.log(`🏠 Determining home route for user: ${userEmail} (ID: ${userId})`);

    // Get user's organization membership (single org per user)
    const [membership] = await db
      .select({
        memberRole: members.role,
        organizationId: organizations.id,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        organizationMetadata: organizations.metadata,
      })
      .from(members)
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, userId))
      .limit(1);

    if (!membership) {
      console.error(`❌ No organization membership found for user: ${userEmail}`);
      redirect("/error?type=no_organization");
    }

    const role = membership.memberRole;
    const orgMetadata = membership.organizationMetadata as OrganizationMetadata;
    
    console.log(`📋 User membership details:`, {
      organization: membership.organizationName,
      role: role,
      orgType: orgMetadata?.type,
      slug: membership.organizationSlug
    });

    // Determine redirect URL based on role and organization type
    let redirectUrl: string;

    switch (role) {
      case HEALTHCARE_ROLES.SYSTEM_ADMIN:
      case HEALTHCARE_ROLES.FIVE_AM_ADMIN:
        redirectUrl = "/5am-corp/admin/dashboard";
        console.log(`🏢 Admin user redirecting to: ${redirectUrl}`);
        break;

      case HEALTHCARE_ROLES.FIVE_AM_AGENT:
        redirectUrl = "/5am-corp/agent/dashboard";
        console.log(`👥 Agent user redirecting to: ${redirectUrl}`);
        
        // Optional: Log agent assignments for debugging
        const agentAssignments = await db
          .select({ 
            clientOrgId: agentOrganizationAssignments.clientOrganizationId,
            clientOrgName: organizations.name 
          })
          .from(agentOrganizationAssignments)
          .leftJoin(organizations, eq(agentOrganizationAssignments.clientOrganizationId, organizations.id))
          .where(eq(agentOrganizationAssignments.agentUserId, userId));
        
        console.log(`📊 Agent has ${agentAssignments.length} client assignments:`, 
          agentAssignments.map(a => a.clientOrgName)
        );
        break;

      case HEALTHCARE_ROLES.CLIENT_ADMIN:
        redirectUrl = `/${membership.organizationSlug}/dashboard`;
        console.log(`👔 Client Admin redirecting to: ${redirectUrl}`);
        break;

      case HEALTHCARE_ROLES.FRONT_DESK:
        redirectUrl = `/${membership.organizationSlug}/front-desk/dashboard`;
        console.log(`🏥 Front Desk user redirecting to: ${redirectUrl}`);
        break;

      case HEALTHCARE_ROLES.TECHNICIAN:
        redirectUrl = `/${membership.organizationSlug}/technician/dashboard`;
        console.log(`🔧 Technician redirecting to: ${redirectUrl}`);
        break;

      case HEALTHCARE_ROLES.INTERPRETING_DOCTOR:
        redirectUrl = `/${membership.organizationSlug}/doctor/dashboard`;
        console.log(`👨‍⚕️ Doctor redirecting to: ${redirectUrl}`);
        break;

      default:
        console.warn(`⚠️ Unknown role: ${role}, using fallback routing`);
        
        // Fallback logic based on organization type
        if (orgMetadata?.type === "client" && membership.organizationSlug) {
          redirectUrl = `/${membership.organizationSlug}/dashboard`;
          console.log(`🏥 Unknown client role, redirecting to org dashboard: ${redirectUrl}`);
        } else {
          redirectUrl = "/dashboard";
          console.log(`❓ Unknown role and org type, redirecting to generic dashboard`);
        }
        break;
    }

    console.log(`✅ Final redirect for ${userEmail}: ${redirectUrl}`);
    redirect(redirectUrl);

  } catch (error) {
    console.error(`❌ Error during post-auth routing for ${userEmail}:`, error);
    
    // Redirect to error page with context
    const errorMessage = error instanceof Error ? error.message : "Unknown routing error";
    redirect(`/error?type=routing_failed&message=${encodeURIComponent(errorMessage)}`);
  }
}