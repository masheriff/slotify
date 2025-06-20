import { requireSuperAdmin } from "@/lib/auth-server";
import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Better Auth server-side protection
  await requireSuperAdmin();

  return (
    <SidebarProvider>
      <AdminAppSidebar />
      <SidebarInset>
        {/* Better Auth impersonation banner */}
        <ImpersonationBanner />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
