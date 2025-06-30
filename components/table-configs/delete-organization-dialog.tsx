// components/table-configs/delete-organization-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteOrganization } from "@/actions/organization-actions";
import { DeleteOrganizationDialogProps, getErrorMessage } from "@/types";


export function DeleteOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteOrganization(organization.id);

      if (result.success) {
        toast.success(result.message || "Organization deleted successfully");
        onOpenChange(false);
        // Refresh the page to update the table
        router.refresh();
      } else {
        toast.error(getErrorMessage(result.error ?? "Failed to delete organization"));
      }
    } catch (error) {
      console.error("Delete organization error:", error);
      toast.error("An unexpected error occurred while deleting the organization");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete Organization
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">&quot;{organization.name}&quot;</span>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will permanently remove the organization and all associated data. 
            The organization must have no members before it can be deleted.
          </p>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="mt-0 sm:mt-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete Organization
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}