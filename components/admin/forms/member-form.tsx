// components/admin/forms/member-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MEMBER_ROLES } from "@/types/member.types";
import {
  getMemberById,
  updateMemberRole,
  inviteUserToOrganization,
} from "@/actions/member-actions";
import { getOrganizationById } from "@/actions/organization-actions";
import {
  getErrorMessage,
  ServerActionError,
  ServerActionResponse,
} from "@/types/server-actions.types";

// Form validation schema
const memberFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
  name: z.string().optional(),
});

type FormData = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  mode: "create" | "edit";
  organizationId: string;
  memberId?: string;
  onSuccess?: () => void;
}

export function MemberForm({
  mode,
  organizationId,
  memberId,
  onSuccess,
}: MemberFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<any>(null);

  // Form with validation
  const form = useForm<FormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: "",
      role: "",
      name: "",
    },
  });

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        const response = await getOrganizationById(organizationId);
        if (response.success && response.data) {
          setOrganization(response.data);
        }
      } catch (error) {
        console.error("Error loading organization:", error);
      }
    };

    loadOrganizationData();
  }, [organizationId]);

  // Load member data for edit mode
  useEffect(() => {
    if (mode !== "edit" || !memberId) return;

    const loadMemberData = async () => {
      try {
        setIsLoading(true);

        const response = await getMemberById(memberId);

        if (response.success && response.data) {
          const member = response.data;
          
          form.reset({
            email: member.user.email,
            role: member.role,
            name: member.user.name || "",
          });
        } else {
          toast.error(getErrorMessage(response.error || "Failed to load member data"));
        }
      } catch (error) {
        console.error("Error loading member data:", error);
        toast.error("Failed to load member data");
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberData();
  }, [mode, memberId, form]);

  // Get available roles based on organization type
  const getAvailableRoles = () => {
    if (!organization) return MEMBER_ROLES;

    const organizationType = organization.metadata?.type || "client";
    
    return MEMBER_ROLES.filter(role => {
      if (role.organizationType === "both") return true;
      return role.organizationType === organizationType;
    });
  };

  // Form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsLoading(true);

      let response: ServerActionResponse;

      if (mode === "create") {
        // Invite new user
        response = await inviteUserToOrganization(
          organizationId,
          data.email,
          data.role,
          data.name || undefined
        );
      } else if (mode === "edit" && memberId) {
        // Update existing member role
        response = await updateMemberRole(memberId, data.role);
      } else {
        throw new Error("Invalid form mode or missing member ID");
      }

      if (response.success) {
        toast.success(
          mode === "create" 
            ? "Invitation sent successfully" 
            : "Member updated successfully"
        );
        
        onSuccess?.();
      } else {
        toast.error(getErrorMessage(response.error || "Failed to save member"));
      }
    } catch (error) {
      console.error("Error submitting member form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Member Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {mode === "create" ? "User Information" : "Member Information"}
            </CardTitle>
            <CardDescription>
              {mode === "create" 
                ? "Enter the details of the user you want to invite"
                : "Update member role and information"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="user@example.com"
                      {...field}
                      disabled={mode === "edit" || isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === "create" 
                      ? "An invitation will be sent to this email address"
                      : "Email address cannot be changed"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Field (optional) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={mode === "edit" || isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === "create" 
                      ? "The user can update this later if not provided"
                      : "Name is managed through user profile settings"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Role and Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role and Permissions
            </CardTitle>
            <CardDescription>
              Select the appropriate role for this member in {organization?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            {role.description && (
                              <span className="text-sm text-muted-foreground">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the role that best matches the member's responsibilities
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Information Display */}
            {organization && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Organization Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2">{organization.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 capitalize">
                      {organization.metadata?.type || "client"} Organization
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Send Invitation" : "Update Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}