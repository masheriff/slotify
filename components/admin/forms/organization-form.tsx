// components/admin/forms/organization-form.tsx
"use client"

import { useState, useCallback, useMemo, useRef } from "react"
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
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  createOrganization, 
  updateOrganization, 
  getOrganizationById 
} from "@/actions/organization-actions"
import { 
  uploadOrganizationLogo, 
  deleteFile 
} from "@/actions/file-upload-actions"

// Create a local slug checker to avoid import conflicts
const checkSlugAvailabilityAPI = async (slug: string, excludeOrgId?: string): Promise<{ available: boolean; suggestedSlug?: string }> => {
  try {
    const params = new URLSearchParams({ slug })
    if (excludeOrgId) {
      params.append('excludeOrgId', excludeOrgId)
    }
    
    const response = await fetch(`/api/organizations/check-slug?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Slug availability check failed:', error)
    return { available: false }
  }
}

// Enhanced form schema with proper validation
const organizationFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logo: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return val.startsWith('/') || val.startsWith('http');
  }, "Logo must be a valid URL or path"),
  type: z.literal("client"),
  
  // Contact Information
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  // Address Information
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  
  // HIPAA Compliance
  hipaaOfficer: z.string().min(1, "HIPAA Officer is required"),
  businessAssociateAgreement: z.boolean().refine(val => val === true, "Business Associate Agreement must be signed"),
  dataRetentionYears: z.string().min(1, "Data retention period is required"),
})

export type OrganizationFormData = z.infer<typeof organizationFormSchema>

type SlugStatus = 'checking' | 'available' | 'taken' | null

interface OrganizationFormProps {
  mode: 'create' | 'edit'
  organizationId?: string
  onSuccess?: () => void
}

export function OrganizationForm({ mode, organizationId, onSuccess }: OrganizationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(mode === 'edit')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(null)
  
  // Refs for managing debounced operations
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastCheckedSlugRef = useRef<string>('')

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
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
      country: "",
      timezone: "",
      hipaaOfficer: "",
      businessAssociateAgreement: false,
      dataRetentionYears: "",
    },
    mode: 'onChange',
  })

  // Memoized slug generation function
  const generateSlugFromName = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }, [])

  // Debounced slug availability checker
  const checkSlugAvailabilityFunc = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2 || slug === lastCheckedSlugRef.current) {
      return
    }

    lastCheckedSlugRef.current = slug
    setSlugStatus('checking')

    try {
      const result = await checkSlugAvailabilityAPI(slug, mode === 'edit' ? organizationId : undefined)
      
      // Handle case where result might be undefined or malformed
      if (!result) {
        console.error('checkSlugAvailability returned undefined')
        setSlugStatus(null)
        return
      }

      if (result.available) {
        setSlugStatus('available')
      } else {
        setSlugStatus('taken')
        if (result.suggestedSlug && mode === 'create') {
          // Set the suggested slug but don't immediately check it
          // Reset the lastCheckedSlugRef so the suggested slug can be checked
          lastCheckedSlugRef.current = ''
          form.setValue('slug', result.suggestedSlug)
          toast.info(`Slug "${slug}" is taken. Suggested: "${result.suggestedSlug}"`)
          
          // Check the suggested slug after a brief delay
          setTimeout(() => {
            checkSlugAvailabilityFunc(result.suggestedSlug!)
          }, 100)
        }
      }
    } catch (error) {
      console.error('Slug check failed:', error)
      setSlugStatus(null)
    }
  }, [mode, organizationId, form])

  // Handle name change with auto-slug generation
  const handleNameChange = useCallback((name: string) => {
    form.setValue('name', name)
    
    // Only auto-generate slug in create mode
    if (mode === 'create' && name.trim()) {
      const newSlug = generateSlugFromName(name)
      const currentSlug = form.getValues('slug')
      
      if (newSlug !== currentSlug) {
        form.setValue('slug', newSlug)
        // Trigger slug check after setting new slug
        if (slugCheckTimeoutRef.current) {
          clearTimeout(slugCheckTimeoutRef.current)
        }
        
        // Reset slug status and last checked ref for new auto-generated slug
        setSlugStatus(null)
        lastCheckedSlugRef.current = ''
        
        slugCheckTimeoutRef.current = setTimeout(() => {
          checkSlugAvailabilityFunc(newSlug)
        }, 300)
      }
    }
  }, [form, mode,     generateSlugFromName, checkSlugAvailabilityFunc])

  // Handle slug change with debounced availability check
  const handleSlugChange = useCallback((slug: string) => {
    form.setValue('slug', slug)
    
    // Reset the slug status immediately when user types
    setSlugStatus(null)
    
    // Cancel previous timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current)
    }

    if (slug && slug.length >= 2) {
      slugCheckTimeoutRef.current = setTimeout(() => {
        checkSlugAvailabilityFunc(slug)
      }, 500)
    } else {
      setSlugStatus(null)
    }
  }, [form, checkSlugAvailabilityFunc])

  // Load organization data (only runs once in edit mode)
  const loadOrganizationData = useCallback(async () => {
    if (mode !== 'edit' || !organizationId) return

    try {
      const result = await getOrganizationById(organizationId)
      if (result.success && result.data) {
        const org = result.data
        const metadata = org.metadata as any
        
        form.reset({
          name: org.name,
          slug: org.slug || '',
          logo: org.logo ?? undefined,
          type: 'client',
          contactEmail: metadata?.contactEmail || '',
          contactPhone: metadata?.contactPhone || '',
          addressLine1: metadata?.addressLine1 || '',
          addressLine2: metadata?.addressLine2 || '',
          city: metadata?.city || '',
          state: metadata?.state || '',
          postalCode: metadata?.postalCode || '',
          country: metadata?.country || '',
          timezone: metadata?.timezone || '',
          hipaaOfficer: metadata?.hipaaOfficer || '',
          businessAssociateAgreement: metadata?.businessAssociateAgreement || false,
          dataRetentionYears: metadata?.dataRetentionYears || '',
        })
      } else {
        toast.error('Failed to load organization data')
        router.back()
      }
    } catch (error) {
      console.error('Failed to load organization:', error)
      toast.error('Failed to load organization data')
      router.back()
    } finally {
      setInitialLoading(false)
    }
  }, [mode, organizationId, form, router])

  // Initialize data on mount
  useMemo(() => {
    if (mode === 'edit' && organizationId && initialLoading) {
      loadOrganizationData()
    } else if (mode === 'create') {
      setInitialLoading(false)
    }
  }, [mode, organizationId, initialLoading, loadOrganizationData])

  // Form submission handler
  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    setIsLoading(true)
    
    try {
      const cleanedLogo = data.logo?.trim() === '' ? undefined : data.logo

      const organizationData = {
        name: data.name,
        slug: data.slug,
        logo: cleanedLogo,
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

      let result
      
      if (mode === 'create') {
        result = await createOrganization(organizationData)
      } else if (organizationId) {
        result = await updateOrganization(organizationId, organizationData)
      }

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

  // Logo upload handler
  const handleLogoUpload = useCallback(async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadOrganizationLogo(formData)
      if (result.success && result.url) {
        form.setValue('logo', result.url)
        toast.success('Logo uploaded successfully!')
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
  }, [form])

  // Logo remove handler
  const handleLogoRemove = useCallback(async (url: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await deleteFile(url)
      if (result.success) {
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
  }, [form])

  // Cleanup timeouts on unmount
  useMemo(() => {
    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current)
      }
    }
  }, [])

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
                      <Input 
                        placeholder="Enter organization name" 
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
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
                          onChange={(e) => handleSlugChange(e.target.value)}
                          className={cn(
                            slugStatus === 'taken' ? 
                            'border-destructive focus:border-destructive' : 
                            slugStatus === 'available' ? 
                            'border-green-500 focus:border-green-500' : 
                            slugStatus === 'checking' ?
                            'border-blue-500 focus:border-blue-500' : ''
                          )}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {slugStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {slugStatus === 'available' && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {slugStatus === 'taken' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This will be used in the organization's URL
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
                      accept="image/*"
                      maxSize={2 * 1024 * 1024} // 2MB
                      onUpload={handleLogoUpload}
                      onRemove={handleLogoRemove}
                      value={field.value}
                      className="w-full"
                      placeholder="Upload organization logo"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a logo for the organization (max 2MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <Input placeholder="contact@organization.com" {...field} />
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
                      <Input placeholder="+1 (555) 123-4567" {...field} />
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
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
                        <Input placeholder="New York" {...field} />
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
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
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
                        <Input placeholder="10001" {...field} />
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
                      <FormControl>
                        <Input placeholder="United States" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>HIPAA Compliance</CardTitle>
            <CardDescription>
              HIPAA compliance information and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="hipaaOfficer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HIPAA Officer</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter HIPAA Officer name" {...field} />
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

        {/* Form Actions */}
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