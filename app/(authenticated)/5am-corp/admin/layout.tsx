// app/(authenticated)/5am-corp/admin/layout.tsx

import { requireSuperAdmin } from "@/lib/auth-server";

// Only for role-specific logic, NO sidebar provider
export default async function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin(); // Auth checks only
  return <>{children}</>;
}