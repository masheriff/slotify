// import { requireAdmin } from "@/lib/auth-server";
import { AppSidebarProvider } from "@/components/layout/app-sidebar-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Better Auth server-side protection - only super admins can access
//   await requireAdmin();

  return (
    <AppSidebarProvider>
      {children}
    </AppSidebarProvider>
  );
}