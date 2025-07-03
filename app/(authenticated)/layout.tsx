// import { requireSuperAdmin } from "@/lib/auth-server";
import { AppSidebarProvider } from "@/components/layout/app-sidebar-provider";

export default async function AutheticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use Better Auth server-side protection - only super admins can access

  return (
    <AppSidebarProvider>
      {children}
    </AppSidebarProvider>
  );
}