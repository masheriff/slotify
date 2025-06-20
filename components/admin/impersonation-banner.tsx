"use client";
import { useSession } from "@/lib/auth-client";
import { stopImpersonation } from "@/actions/impersonations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, X } from "lucide-react";
import { toast } from "sonner";

type SessionWithImpersonation = {
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    banned?: boolean | null;
    role?: string;
    banReason?: string;
    banExpires?: Date;
    // ...add other user fields as needed
  };
  impersonatedBy?: string; // or the correct type if not string
  // ...add other session fields as needed
};

export function ImpersonationBanner() {
  const { data } = useSession();
  const session = data as SessionWithImpersonation | undefined;
  
  // Check if currently impersonating using Better Auth session
  if (!session?.impersonatedBy) {
    return null;
  }

  const handleStopImpersonation = async () => {
    const result = await stopImpersonation();
    if (result.success) {
      toast.success("Stopped impersonation");
      window.location.reload(); // Refresh to update session
    } else {
      toast.error("Failed to stop impersonation");
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <User className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You are impersonating <strong>{session.user.name}</strong> ({session.user.email})
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStopImpersonation}
          loadingKey="stop-impersonation"
        >
          <X className="h-4 w-4 mr-1" />
          Stop Impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
}
