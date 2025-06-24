// hooks/use-organization-details.ts

import { useState, useEffect } from "react";
import { useLoadingControl } from "@/lib/with-loading";
import { getOrganizationById } from "@/actions/organization-actions";
import { toast } from "sonner";

export function useOrganizationDetails(organizationId: string) {
  const [organization, setOrganization] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { withLoadingState, isLoading } = useLoadingControl();

  useEffect(() => {
    if (organizationId) {
      loadOrganizationDetails();
    }
  }, [organizationId]);

  const loadOrganizationDetails = async () => {
    if (!organizationId) {
      console.log("⚠️ No organization ID provided");
      return;
    }

    console.log("🔍 Loading organization details for ID:", organizationId);

    try {
      await withLoadingState(
        'organization-details-fetch',
        async () => {
          const result = await getOrganizationById(organizationId);
          
          console.log("📊 Organization fetch result:", result);
          
          if (result.success && result.data) {
            console.log("✅ Organization loaded successfully:", result.data.name);
            setOrganization(result.data);
            setError(null);
          } else {
            const errorMessage = result.error || "Organization not found";
            console.error("❌ Organization fetch failed:", errorMessage);
            setError(errorMessage);
            toast.error(errorMessage);
          }
        },
        'Loading organization details...'
      );
    } catch (error) {
      const errorMessage = "Failed to load organization details";
      console.error("❌ Organization fetch error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const refreshOrganization = () => {
    console.log("🔄 Refreshing organization details");
    loadOrganizationDetails();
  };

  return {
    organization,
    error,
    isLoading: isLoading('organization-details-fetch'),
    refreshOrganization,
  };
}