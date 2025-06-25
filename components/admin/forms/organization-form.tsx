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
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  // FIXED: Allow empty string, undefined, or valid paths/URLs
  logo: z.string().optional().refine((val) => {
    // Allow undefined, null, or empty string (no logo)
    if (!val || val.trim() === '') return true;
    // Allow relative paths starting with / or absolute URLs
    return val.startsWith('/') || val.startsWith('http');
  }, "Logo must be a valid URL or path"),
  type: z.literal("client"),
  
  // Contact Information
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  // Address Information
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
          toast.info(`Slug "${slug}" is taken. Suggested: "${result.suggestedSlug}"`)
        }
      }
    } catch (error) {
      console.error('Slug check failed:', error)
      setSlugStatus(null)
    }
  }, [mode, organizationId, form])

  // Auto-generate slug when name changes
  useEffect(() => {
    if (watchName && mode === 'create') {
      const newSlug = generateSlugFromName(watchName)
      if (newSlug !== currentSlug) {
        form.setValue('slug', newSlug)
      }
    }
  }, [watchName, mode, currentSlug, form, generateSlugFromName])

  // Check slug availability with debouncing
  useEffect(() => {
    if (currentSlug && currentSlug.length >= 2) {
      const timeoutId = setTimeout(() => {
        checkSlug(currentSlug)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setSlugStatus(null)
    }
  }, [currentSlug, checkSlug])

  // Load existing organization data for edit mode
  useEffect(() => {
    if (mode === 'edit' && organizationId) {
      const loadOrganization = async () => {
        try {
          const result = await getOrganizationById(organizationId)
          if (result.success && result.data) {
            const org = result.data
            const metadata = org.metadata as any
            
            form.reset({
              name: org.name,
              slug: org.slug || '',
              logo: org.logo ?? undefined,
              type: metadata.type,
              contactEmail: metadata.contactEmail,
              contactPhone: metadata.contactPhone,
              addressLine1: metadata.addressLine1,
              addressLine2: metadata.addressLine2 || '',
              city: metadata.city,
              state: metadata.state,
              postalCode: metadata.postalCode,
              country: metadata.country,
              timezone: metadata.timezone,
              hipaaOfficer: metadata.hipaaOfficer || '',
              dataRetentionYears: metadata.dataRetentionYears || '7',
              businessAssociateAgreement: metadata.businessAssociateAgreement || false,
            })
          } else {
            toast.error('Failed to load organization data')
            router.push('/admin/organizations')
          }
        } catch (error) {
          console.error('Failed to load organization:', error)
          toast.error('Failed to load organization data')
          router.push('/admin/organizations')
        } finally {
          setInitialLoading(false)
        }
      }

      loadOrganization()
    } else {
      setInitialLoading(false)
    }
  }, [mode, organizationId, form, router])

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    setIsLoading(true)
    
    try {
      console.log('Form submission data:', data) // Debug log
      
      // Clean up logo field - convert empty strings to undefined
      const cleanedLogo = data.logo && data.logo.trim() !== '' ? data.logo : undefined;
      
      // Prepare organization data with proper structure
      const organizationData = {
        name: data.name,
        slug: data.slug,
        logo: cleanedLogo, // Use cleaned logo value
        createdAt: new Date().toISOString(),
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

      console.log('Organization data to be sent:', organizationData) // Debug log

      let result
      
      if (mode === 'create') {
        result = await createOrganization(organizationData)
      } else if (organizationId) {
        result = await updateOrganization(organizationId, organizationData)
      }

      console.log('API result:', result) // Debug log

      if (result?.success) {
        toast.success(mode === 'create' ? 'Organization created successfully!' : 'Organization updated successfully!')
        onSuccess?.()
      } else {
        toast.error(result?.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadOrganizationLogo(formData)
      if (result.success && result.url) {
        // Use the relative path directly - no need to convert to absolute URL
        form.setValue('logo', result.url)
        toast.success('Logo uploaded successfully!')
        
        console.log('Logo uploaded and form updated:', result.url) // Debug log
        return result
      } else {
        toast.error(result.error || 'Failed to upload logo')
        return result
      }
    } catch (error) {
      console.error('Logo upload error:', error)
      const errorMessage = 'Failed to upload logo'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const handleLogoRemove = async (url: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await deleteFile(url)
      if (result.success) {
        // Clear the form field by setting it to undefined
        form.setValue('logo', undefined)
        toast.success('Logo removed successfully!')
      } else {
        toast.error(result.error || 'Failed to remove logo')
      }
      return result
    } catch (error) {
      console.error('Logo removal error:', error)
      const errorMessage = 'Failed to remove logo'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading organization data...</span>
      </div>
    )
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core details about the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="organization-slug" 
                            {...field} 
                            className={slugStatus === 'taken' ? 'border-destructive' : ''}
                          />
                          {slugStatus === 'checking' && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {slugStatus === 'available' && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                          )}
                          {slugStatus === 'taken' && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for the organization's URL. Will be auto-generated from the name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        currentFileUrl={field.value}
                        onUpload={handleLogoUpload}
                        onDelete={handleLogoRemove}
                        accept="image/*"
                        maxSize={2 * 1024 * 1024} // 2MB
                        placeholder="Upload organization logo"
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended size: 200x200px. Max file size: 2MB.
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
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
                Physical location of the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <Input placeholder="Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Input placeholder="94102" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="CAN">Canada</SelectItem>
                          <SelectItem value="GBR">United Kingdom</SelectItem>
                          <SelectItem value="AUS">Australia</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Toronto">Toronto</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* HIPAA & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>HIPAA & Compliance</CardTitle>
              <CardDescription>
                Healthcare compliance and data retention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hipaaOfficer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HIPAA Officer (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of the designated HIPAA compliance officer
                      </FormDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 years</SelectItem>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="7">7 years</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
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
                        Business Associate Agreement (BAA) Signed
                      </FormLabel>
                      <FormDescription>
                        Check this box to confirm that a Business Associate Agreement has been signed with this organization.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions - Button positioned at the bottom for better UX */}
          <div className="flex items-center justify-end space-x-4 pt-4">
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
              {mode === 'create' ? 'Create Organization' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
  )
}