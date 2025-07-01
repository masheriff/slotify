import { requireSuperAdmin } from "@/lib/auth-server";
import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Better Auth server-side protection - only super admins can access
  await requireSuperAdmin();

  return (
    <SidebarProvider>
      <AdminAppSidebar />
      <SidebarInset>
        {/* Better Auth impersonation banner */}
        <ImpersonationBanner />
        
        {/* Main content - each page will have its own header */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}