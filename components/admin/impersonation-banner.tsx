"use client";
import { stopImpersonation } from "@/actions/impersonations";
import { useSession } from "@/lib/auth-client";
import { AlertTriangle, User, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState } from "react";
import { User as UserType } from "better-auth";

interface ImpersonationBannerProps {
  isImpersonating: boolean;
  user: UserType
}

export function ImpersonationBanner({ isImpersonating, user }: ImpersonationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ Use server-side prop instead of client-side check
  if (!isImpersonating) {
    return null;
  }
  
  const handleStopImpersonation = async () => {
    setIsLoading(true);
    
    try {
      const result = await stopImpersonation();

      if (result.success) {
        toast.success("Stopped impersonation");
        
        // ✅ Use window.location.href for full page reload to refresh all UI components
        window.location.href = "/5am-corp/admin/users";
      } else {
        toast.error("Failed to stop impersonation");
      }
    } catch (error) {
      console.error('Stop impersonation error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false); // Only set loading false on error since success redirects
    }
    // Note: Don't set isLoading(false) on success since we're doing a full page redirect
  };

  return (
    <div className="flex items-center px-2 h-[40px] bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-sm sm:text-base">
                IMPERSONATION ACTIVE
              </span>
              <span className="text-sm opacity-90">
                You are acting as{" "}
                <strong>{user.name || user.email}</strong>
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={handleStopImpersonation}
            disabled={isLoading}
            className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium shadow-sm border border-orange-200"
          >
            <X className="h-4 w-4 mr-2" />
            {isLoading ? "Stopping..." : "Stop Impersonation"}
          </Button>
        </div>
      </div>
    </div>
  );
}