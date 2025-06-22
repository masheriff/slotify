"use client"

import { useState } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'text' | 'date'
  options?: Array<{
    value: string
    label: string
  }>
  placeholder?: string
}

interface FiltersSheetProps {
  filters: FilterConfig[]
  triggerClassName?: string
  currentFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearAllFilters: () => void
}

export function FiltersSheet({
  filters,
  triggerClassName,
  currentFilters,
  onFilterChange,
  onClearAllFilters
}: FiltersSheetProps) {
  const [open, setOpen] = useState(false)

  // Get current filter values
  const getFilterValue = (key: string) => currentFilters[key] || ''

  // Clear all filters
  const clearAllFilters = () => {
    onClearAllFilters()
    setOpen(false)
  }

  // Apply filters (close sheet)
  const applyFilters = () => {
    setOpen(false)
  }

  // Handle individual filter change
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange(key, value)
  }

  // Check if any filters are active
  const hasActiveFilters = filters.some(filter => getFilterValue(filter.key))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your results.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={filter.key}>{filter.label}</Label>
              
              {filter.type === 'select' && filter.options && (
                <Select
                  value={getFilterValue(filter.key)}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filter.type === 'text' && (
                <Input
                  id={filter.key}
                  value={getFilterValue(filter.key)}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
                />
              )}
              
              {filter.type === 'date' && (
                <Input
                  id={filter.key}
                  type="date"
                  value={getFilterValue(filter.key)}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
              
              {/* Clear individual filter */}
              {getFilterValue(filter.key) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange(filter.key, '')}
                  className="h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <SheetFooter className="flex-col gap-2 sm:flex-row">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters} className="w-full sm:w-auto">
              Clear All
            </Button>
          )}
          <Button onClick={applyFilters} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}