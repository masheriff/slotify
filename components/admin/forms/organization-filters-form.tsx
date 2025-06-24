// components/admin/forms/organization-filters-form.tsx - Updated with proper padding and simplified filters
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, X } from "lucide-react"
import { OrganizationFiltersFormProps } from "@/types"

// Simplified filter form schema - only type and createdAfter as requested
const organizationFiltersSchema = z.object({
  type: z.string().optional(),
  createdAfter: z.string().optional(),
})

type OrganizationFiltersFormData = z.infer<typeof organizationFiltersSchema>

export function OrganizationFiltersForm({
  currentFilters,
  onFilterChange,
  onClearAllFilters,
  triggerClassName,
}: OrganizationFiltersFormProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<OrganizationFiltersFormData>({
    resolver: zodResolver(organizationFiltersSchema),
    defaultValues: {
      type: currentFilters.type || "",
      createdAfter: currentFilters.createdAfter || "",
    },
  })

  // Update filters when form values change
  const handleFilterUpdate = (field: keyof OrganizationFiltersFormData, value: string) => {
    onFilterChange(field, value)
    form.setValue(field, value)
  }

  // Clear all filters
  const handleClearAll = () => {
    onClearAllFilters()
    form.reset({
      type: "",
      createdAfter: "",
    })
  }

  // Clear individual filter
  const handleClearField = (field: keyof OrganizationFiltersFormData) => {
    handleFilterUpdate(field, "")
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(currentFilters).some(value => value?.trim())

  // Apply filters and close sheet
  const handleApply = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {Object.values(currentFilters).filter(Boolean).length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Organizations</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your organization results.
          </SheetDescription>
        </SheetHeader>

        {/* FIXED: Added proper padding to the form */}
        <div className="px-1 py-6">
          <Form {...form}>
            <div className="space-y-6">
              {/* Organization Type Filter */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleFilterUpdate("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin Organization</SelectItem>
                          <SelectItem value="client">Client Organization</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearField("type")}
                        className="h-6 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear
                      </Button>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Created After Filter - FIXED implementation */}
              <FormField
                control={form.control}
                name="createdAfter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created After</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          console.log('Date filter changed:', e.target.value)
                          handleFilterUpdate("createdAfter", e.target.value)
                        }}
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      />
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearField("createdAfter")}
                        className="h-6 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear
                      </Button>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row px-1">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearAll} className="w-full sm:w-auto">
              Clear All Filters
            </Button>
          )}
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}