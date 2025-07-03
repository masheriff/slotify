"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { impersonateUser } from "@/actions/users.actions";
import { UserListItem } from "@/types/users.types";
import { getErrorMessage } from "@/types";
import { useRouter } from "next/navigation";

interface ImpersonateUserButtonProps {
  user: UserListItem;
  currentUserRole: string;
  onSuccess?: () => void;
}

export function ImpersonateUserButton({ 
  user, 
  currentUserRole, 
  onSuccess 
}: ImpersonateUserButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for super admins and not for banned users
  const canImpersonate = currentUserRole === 'system_admin' && !user.banned;
  
  if (!canImpersonate) {
    return null;
  }

  const handleImpersonate = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('id', user.id);
      
      const result = await impersonateUser(formData);
      
      if (result.success) {
        toast.success(`Now impersonating ${user.name || user.email}`);
        setIsOpen(false);
        
        // Redirect to user's organization dashboard
        if (user.organization?.slug) {
          router.push(`/${user.organization.slug}/dashboard`);
        } else {
          router.push('/dashboard');
        }
        
        onSuccess?.();
      } else {
        toast.error(getErrorMessage(result.error || 'Failed to start impersonation'));
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={isLoading}
        >
          <UserCheck className="h-3 w-3" />
          Impersonate
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Impersonate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to impersonate{" "}
            <strong>{user.name || user.email}</strong>?
            <br />
            <br />
            You will be logged in as this user and can perform actions on their behalf. 
            This action will be logged for security purposes.
            {user.organization && (
              <>
                <br />
                <br />
                <strong>Organization:</strong> {user.organization.name}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
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
              'Start Impersonation'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}