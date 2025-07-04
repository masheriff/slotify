// components/dialogs/impersonate-user-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { impersonateUser } from "@/actions/users.actions";
import { formatUserDisplayName } from "@/utils/users.utils";
import { getErrorMessage } from "@/types";
import { useRouter } from "next/navigation";
import { organization, useSession } from "@/lib/auth-client";
import type { UserListItem } from "@/types/users.types";

interface ImpersonateUserDialogProps {
  user: UserListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImpersonateUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ImpersonateUserDialogProps) {
  const router = useRouter();
  const { refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleImpersonate = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('id', user.id);
      
      const result = await impersonateUser(formData);
      
      if (result.success) {
        toast.success(`Now impersonating ${formatUserDisplayName(user)}`);
        onOpenChange(false);
        
        // Force session refresh to get updated impersonation data
        console.log("🔄 Refreshing session after impersonation start...");
        await refetch();
        console.log("✅ Session refreshed successfully");
        
        // Small delay to ensure session data propagates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await organization.setActive({ organizationId: user.organization?.id });
        
        // **SOLUTION: Use window.location.href for full page reload**
        // This ensures all components (navigation, sidebar, logo) are refreshed
        if (user.organization?.slug) {
          window.location.href = `/${user.organization.slug}/dashboard`;
        } else {
          window.location.href = '/dashboard';
        }
        
        onSuccess?.();
      } else {
        toast.error(getErrorMessage(result.error || 'Failed to start impersonation'));
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false); // Only set loading false on error since success redirects
    }
    // Note: Don't set isLoading(false) on success since we're doing a full page redirect
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-orange-600" />
            Impersonate User
          </DialogTitle>
          <DialogDescription>
            You are about to impersonate{" "}
            <span className="font-semibold">
              {formatUserDisplayName(user)}
            </span>
            . You will be logged in as this user and can perform actions on their behalf.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Important Security Notice
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>This action will be logged for security purposes</li>
                    <li>You will have full access to this user's account</li>
                    <li>Use this feature responsibly and only when necessary</li>
                    {user.organization && (
                      <li>
                        You will be redirected to <strong>{user.organization.name}</strong>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {user.organization && (
            <div className="rounded-lg border p-3">
              <div className="text-sm">
                <span className="font-medium">Target Organization:</span>{" "}
                {user.organization.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {user.organization.slug}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImpersonate}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Start Impersonation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}