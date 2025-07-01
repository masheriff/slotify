// components/admin/page-headers/organization-page-header.tsx
"use client"

import { ArrowLeft, Building2, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { OrganizationPageHeaderProps } from "@/types"


export function OrganizationPageHeader({
  mode,
  organizationName,
  onSave,
  isLoading = false,
  showBackButton = true,
  backUrl = "/5am-corp/admin/organizations"
}: OrganizationPageHeaderProps) {
  const router = useRouter()

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Organization"
      case "edit":
        return `Edit ${organizationName || "Organization"}`
      case "view":
        return organizationName || "Organization Details"
      default:
        return "Organization"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new client organization to the system"
      case "edit":
        return "Update organization information and settings"
      case "view":
        return "View organization details and configuration"
      default:
        return ""
    }
  }

  const getIcon = () => {
    switch (mode) {
      case "create":
        return <Plus className="w-6 h-6" />
      case "edit":
        return <Edit className="w-6 h-6" />
      default:
        return <Building2 className="w-6 h-6" />
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-6">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(backUrl)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {getTitle()}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {getDescription()}
            </p>
          </div>
        </div>

        {(mode === "create" || mode === "edit") && onSave && (
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {mode === "create" ? "Create Organization" : "Save Changes"}
          </Button>
        )}
      </div>
    </div>
  )
}