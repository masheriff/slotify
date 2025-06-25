// components/admin/forms/organization-filters-form.tsx - FIXED VERSION
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

interface OrganizationFiltersFormProps {
  currentFilters: Record<string, string>
  onFilterUpdate: (key: string, value: string) => void
  triggerClassName?: string
}

export function OrganizationFiltersForm({
  currentFilters,
  onFilterUpdate,
  triggerClassName = "",
}: OrganizationFiltersFormProps) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      type: currentFilters.type || "",
      createdAfter: currentFilters.createdAfter || "",
    },
  })

  // Handle filter updates
  const handleFilterUpdate = (field: string, value: string) => {
    form.setValue(field as any, value)
    onFilterUpdate(field, value)
  }

  // Clear individual field
  const handleClearField = (field: string) => {
    form.setValue(field as any, "")
    onFilterUpdate(field, "")
  }

  // Clear all filters
  const handleClearAll = () => {
    form.reset({
      type: "",
      createdAfter: "",
    })
    onFilterUpdate("type", "")
    onFilterUpdate("createdAfter", "")
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

        <div className="py-6">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Created After Filter - FIXED: Using proper date input */}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>

        <SheetFooter className="flex justify-between">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearAll}>
              Clear All Filters
            </Button>
          )}
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}