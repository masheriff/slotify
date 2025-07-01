import { handlePostAuthRouting } from "@/actions/auth-routing-actions";

export default async function AuthCallbackPage() {
  console.log("📍 Auth callback page accessed");

  // Since only onboarded users can login, directly handle routing
  // This will redirect the user based on their role and organization
  await handlePostAuthRouting();
}