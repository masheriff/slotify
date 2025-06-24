// components/admin/forms/organization-form.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createOrganization, updateOrganization, getOrganizationById } from "@/actions/organization-actions"

// Form Schema - Using consistent string types for all fields
const organizationFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logo: z.string().optional().transform(val => val === "" ? undefined : val),
  type: z.enum(["admin", "client"]),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  addressLine1: z.string().min(5, "Please enter a valid address"),
  addressLine2: z.string().optional().transform(val => val === "" ? undefined : val),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  postalCode: z.string().min(5, "Please enter a valid postal code"),
  country: z.string().min(2, "Please enter a valid country"),
  timezone: z.string().min(1, "Please select a timezone"),
  hipaaOfficer: z.string().optional().transform(val => val === "" ? undefined : val),
  dataRetentionYears: z.string(),
  businessAssociateAgreement: z.boolean(),
})

// Type definition
type OrganizationFormData = z.infer<typeof organizationFormSchema>

// Default values that match the schema exactly
const defaultValues: OrganizationFormData = {
  name: "",
  slug: "",
  logo: undefined,
  type: "client",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: undefined,
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
  timezone: "America/Los_Angeles",
  hipaaOfficer: undefined,
  dataRetentionYears: "7",
  businessAssociateAgreement: false,
}

interface OrganizationFormProps {
  mode: 'create' | 'edit'
  organizationId?: string
  onSuccess?: () => void
}

export function OrganizationForm({ mode, organizationId, onSuccess }: OrganizationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(mode === 'edit')

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Auto-generate slug from name
  const watchName = form.watch("name")
  useEffect(() => {
    if (mode === 'create' && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setValue("slug", slug)
    }
  }, [watchName, mode, form])

  // Load existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && organizationId) {
      loadOrganizationData()
    }
  }, [mode, organizationId])

  const loadOrganizationData = async () => {
    try {
      setInitialLoading(true)
      const result = await getOrganizationById(organizationId!)
      
      if (result.success && result.data) {
        const org = result.data
        const metadata = org.metadata as any
        
        const formData: OrganizationFormData = {
          name: org.name,
          slug: org.slug || "",
          logo: org.logo || undefined,
          type: (metadata?.type || "client") as "admin" | "client",
          contactEmail: metadata?.contactEmail || "",
          contactPhone: metadata?.contactPhone || "",
          addressLine1: metadata?.addressLine1 || "",
          addressLine2: metadata?.addressLine2 || undefined,
          city: metadata?.city || "",
          state: metadata?.state || "",
          postalCode: metadata?.postalCode || "",
          country: metadata?.country || "USA",
          timezone: metadata?.timezone || "America/Los_Angeles",
          hipaaOfficer: metadata?.hipaaOfficer || undefined,
          dataRetentionYears: metadata?.dataRetentionYears || "7",
          businessAssociateAgreement: metadata?.businessAssociateAgreement || false,
        }
        
        form.reset(formData)
      } else {
        toast.error("Failed to load organization data")
        router.push("/admin/organizations")
      }
    } catch (error) {
      console.error("Error loading organization:", error)
      toast.error("Failed to load organization data")
      router.push("/admin/organizations")
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    try {
      setIsLoading(true)

      // Prepare organization data
      const organizationData = {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        metadata: {
          type: data.type,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          timezone: data.timezone,
          isActive: true,
          settings: {
            features: {
              multiTenant: data.type === "admin",
              advancedReporting: true,
              apiAccess: data.type === "admin",
              customBranding: true,
            },
            billing: {
              plan: data.type === "admin" ? "enterprise" : "standard",
              status: "active",
            },
          },
          hipaaOfficer: data.hipaaOfficer,
          businessAssociateAgreement: data.businessAssociateAgreement,
          dataRetentionYears: data.dataRetentionYears,
        },
      }

      let result
      if (mode === 'create') {
        result = await createOrganization(organizationData)
      } else {
        result = await updateOrganization(organizationId!, organizationData)
      }

      if (result.success) {
        toast.success(`Organization ${mode === 'create' ? 'created' : 'updated'} successfully`)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/admin/organizations')
        }
      } else {
        toast.error(result.error || `Failed to ${mode} organization`)
      }
    } catch (error) {
      console.error(`Error ${mode}ing organization:`, error)
      toast.error(`Failed to ${mode} organization`)
    } finally {
      setIsLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading organization data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Basic details about the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="organization-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier (auto-generated from name)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin Organization</SelectItem>
                          <SelectItem value="client">Client Organization</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/logo.png" 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional logo image URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Logo Preview */}
              {form.watch("logo") && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={form.watch("logo")} alt="Logo preview" />
                    <AvatarFallback>
                      {form.watch("name").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Logo Preview</p>
                    <p className="text-xs text-muted-foreground">
                      This is how your logo will appear
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Contact details for the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@organization.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1-555-0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                Physical address of the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Suite 100" 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94105" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                HIPAA compliance and data retention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hipaaOfficer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HIPAA Officer (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Smith" 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataRetentionYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Retention (Years)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                          <SelectItem value="7">7 Years</SelectItem>
                          <SelectItem value="10">10 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessAssociateAgreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Business Associate Agreement
                      </FormLabel>
                      <FormDescription>
                        I confirm that a Business Associate Agreement has been signed
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Organization' : 'Update Organization'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}