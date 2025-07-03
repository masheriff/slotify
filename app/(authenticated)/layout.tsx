import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServerSession, getServerOrganization } from "@/lib/auth-server";
import { OrganizationMetadata, UserRole } from "@/types";
import { redirect } from "next/navigation";

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
    redirect("/select-organization"); // or handle as appropriate for your app
  }

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
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}