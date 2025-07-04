// app/(authenticated)/layout.tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServerSession, getServerOrganization } from "@/lib/auth-server";
import { OrganizationMetadata, UserRole } from "@/types";
import { redirect } from "next/navigation";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { headers } from "next/headers";
import { getNavItemsAccordingToUserRole } from "@/utils/nav-items.utils";
import { calculateServerNavState } from "@/utils/navigation-state.utils";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const organization = await getServerOrganization();

  if (!organization) {
    redirect("/select-organization");
  }

  // Get current pathname from headers
  const headersList = headers();
  const pathname = (await headersList).get("x-pathname") || "/";

  // Calculate navigation state on server
  const userRole = session.user.role as UserRole;
  const navItems = getNavItemsAccordingToUserRole(userRole, organization.slug || undefined);
  const initialNavState = await calculateServerNavState(pathname, navItems);

  // ✅ Server-side impersonation check to prevent flickering
  const isImpersonating = Boolean(session?.session?.impersonatedBy);



  return (
    <SidebarProvider>
      <AppSidebar 
        user={{
          ...session.user,
          image: session.user.image ?? undefined,
          role: session.user.role as UserRole ?? undefined,
          banned: session.user.banned === null ? undefined : session.user.banned,
          banReason: session.user.banReason === null ? undefined : session.user.banReason,
          banExpires: session.user.banExpires === null ? undefined : session.user.banExpires,
        }}
        organization={{
          ...organization,
          slug: organization.slug ?? undefined,
          logo: organization.logo === null ? undefined : organization.logo,
          metadata: organization.metadata as OrganizationMetadata,
        }}
        userRole={session.user.role as UserRole}
        initialNavState={initialNavState}

      />
      <SidebarInset>
        {/* ✅ Server-side rendered impersonation banner */}
        <ImpersonationBanner isImpersonating={isImpersonating} user={session?.user} />
        
        {/* ✅ Apply margin-top when impersonating to prevent layout shift */}
        <div className={isImpersonating ? "mt-[40px]" : ""}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}