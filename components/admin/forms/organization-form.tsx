// components/admin/forms/organization-form.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"
import { OrganizationPageHeader } from "@/components/admin/page-headers/organization-page-header"
import { 
  createOrganization, 
  updateOrganization, 
  getOrganizationById 
} from "@/actions/organization-actions"
import { 
  uploadOrganizationLogo, 
  deleteFile, 
  checkSlugAvailability 
} from "@/actions/file-upload-actions"

// Enhanced form schema with proper validation
const organizationFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  // Slug is auto-generated and not user-editable
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logo: z.string().optional(),
  // Type is always "client" for new organizations
  type: z.literal("client"),
  
  // Contact Information
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  // Address Information (3 rows as requested)
  addressLine1: z.string().min(5, "Please enter a valid address"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  postalCode: z.string().min(5, "Please enter a valid postal code"),
  country: z.string().min(2, "Please enter a valid country"),
  
  // Additional Settings
  timezone: z.string().min(1, "Please select a timezone"),
  hipaaOfficer: z.string().optional(),
  dataRetentionYears: z.string(),
  businessAssociateAgreement: z.boolean(),
})

type OrganizationFormData = z.infer<typeof organizationFormSchema>

// Default values
const defaultValues: OrganizationFormData = {
  name: "",
  slug: "",
  logo: undefined,
  type: "client",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA",
  timezone: "America/Los_Angeles",
  hipaaOfficer: "",
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
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | null>(null)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Auto-generate and validate slug from name
  const watchName = form.watch("name")
  const currentSlug = form.watch("slug")

  const generateSlugFromName = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) return

    setSlugStatus('checking')
    try {
      const result = await checkSlugAvailability(slug, mode === 'edit' ? organizationId : undefined)
      
      if (result.available) {
        setSlugStatus('available')
      } else {
        setSlugStatus('taken')
        if (result.suggestedSlug) {
          form.setValue('slug', result.suggestedSlug)
          toast.info(`Slug "${slug}" is taken. Using "${result.suggestedSlug}" instead.`)
        }
      }
    } catch (error) {
      setSlugStatus(null)
      console.error('Error checking slug:', error)
    }
  }, [form, mode, organizationId])

  // Auto-generate slug when name changes (only in create mode)
  useEffect(() => {
    if (mode === 'create' && watchName && watchName.trim()) {
      const newSlug = generateSlugFromName(watchName)
      if (newSlug !== currentSlug) {
        form.setValue("slug", newSlug)
      }
    }
  }, [watchName, mode, form, generateSlugFromName, currentSlug])

  // Check slug availability when it changes
  useEffect(() => {
    if (currentSlug && currentSlug.length >= 2) {
      const timeoutId = setTimeout(() => {
        checkSlug(currentSlug)
      }, 500) // Debounce

      return () => clearTimeout(timeoutId)
    } else {
      setSlugStatus(null)
    }
  }, [currentSlug, checkSlug])

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
          type: "client", // Always client for non-admin orgs
          contactEmail: metadata?.contactEmail || "",
          contactPhone: metadata?.contactPhone || "",
          addressLine1: metadata?.addressLine1 || "",
          addressLine2: metadata?.addressLine2 || "",
          city: metadata?.city || "",
          state: metadata?.state || "",
          postalCode: metadata?.postalCode || "",
          country: metadata?.country || "USA",
          timezone: metadata?.timezone || "America/Los_Angeles",
          hipaaOfficer: metadata?.hipaaOfficer || "",
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

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await uploadOrganizationLogo(formData)
    
    if (result.success && result.url) {
      // Delete old logo if exists
      const currentLogo = form.getValues('logo')
      if (currentLogo) {
        await deleteFile(currentLogo)
      }
      
      form.setValue('logo', result.url)
    }
    
    return result
  }

  // Handle logo delete
  const handleLogoDelete = async (url: string) => {
    const result = await deleteFile(url)
    
    if (result.success) {
      form.setValue('logo', undefined)
    }
    
    return result
  }

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    try {
      setIsLoading(true)

      // Final slug validation
      if (slugStatus === 'taken') {
        toast.error("Please resolve the slug conflict before submitting")
        return
      }

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
              multiTenant: false,
              advancedReporting: true,
              apiAccess: false,
              customBranding: true,
            },
            billing: {
              plan: "standard",
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

  // Handle form submit from header
  const handleSave = () => {
    form.handleSubmit(onSubmit)()
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col h-screen">
        <OrganizationPageHeader
          mode={mode}
          showBackButton={false}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading organization data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <OrganizationPageHeader
        mode={mode}
        organizationName={form.watch('name') || undefined}
        onSave={handleSave}
        isLoading={isLoading}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Information and Contact Information - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Basic details about the organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            <div className="relative">
                              <Input 
                                placeholder="organization-slug" 
                                {...field} 
                                disabled
                                className="pr-10"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {slugStatus === 'checking' && (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                {slugStatus === 'available' && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                                {slugStatus === 'taken' && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Auto-generated from organization name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Primary contact details for the organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              </div>

              {/* Logo Upload - Separate Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Logo</CardTitle>
                  <CardDescription>
                    Upload a logo for the organization (PNG, JPG, GIF up to 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onUpload={handleLogoUpload}
                    onDelete={handleLogoDelete}
                    currentFileUrl={form.watch('logo')}
                    accept="image/*"
                    placeholder="Click to upload logo or drag and drop"
                    className="max-w-md"
                  />
                </CardContent>
              </Card>

              {/* Address Information and Additional Settings - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Address Information - 3 rows as requested */}
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>
                      Physical address of the organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Row 1: Address Lines */}
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
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
                              <Input placeholder="Apartment, suite, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 2: City and State */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
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
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 3: Postal Code and Country */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USA">United States</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Mexico">Mexico</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
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
                      HIPAA compliance and operational settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                              <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hipaaOfficer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HIPAA Officer (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Name of HIPAA compliance officer" {...field} />
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
              </div>

              {/* Action Buttons - Only show in standalone form */}
              <div className="flex justify-end space-x-4 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || slugStatus === 'taken'}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Organization' : 'Update Organization'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}