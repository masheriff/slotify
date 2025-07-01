// components/common/filterable-page-header.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Search, Plus, RefreshCw, Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { FilterablePageHeaderProps, FilterConfig } from "@/types"

// Constants for better performance
const ALL_OPTION_VALUE = "__all__"

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// URL params utility hook
function useURLParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === ALL_OPTION_VALUE) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      
      // Always reset to page 1 when filters change
      params.set('page', '1')
      
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return { searchParams, updateParams }
}

// Filter state hook
function useFilterState(filterConfig: FilterConfig[], searchParams: URLSearchParams) {
  return React.useMemo(() => {
    return filterConfig.reduce((acc, filter) => {
      acc[filter.key] = searchParams.get(filter.key) || ""
      return acc
    }, {} as Record<string, string>)
  }, [filterConfig, searchParams])
}

// Date filter component
interface DateFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function DateFilter({ value, onChange, placeholder, className }: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder || "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Individual filter input component
interface FilterInputProps {
  filter: FilterConfig
  value: string
  onChange: (value: string) => void
}

const FilterInput = React.memo(function FilterInput({ filter, value, onChange }: FilterInputProps) {
  switch (filter.type) {
    case "select":
      return (
        <Select value={value || ALL_OPTION_VALUE} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>All {filter.label}</SelectItem>
            {filter.options?.map((option) => (
              option.value && option.value.trim() ? (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ) : null
            ))}
          </SelectContent>
        </Select>
      )

    case "date":
      return (
        <DateFilter
          value={value}
          onChange={onChange}
          placeholder={filter.placeholder || "Select date"}
        />
      )

    case "number":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
          className="w-full"
        />
      )

    case "boolean":
      return (
        <Select value={value || ALL_OPTION_VALUE} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_VALUE}>All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      )

    default: // "text"
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
          className="w-full"
        />
      )
  }
})

export function FilterablePageHeader({
  title,
  description,
  createButtonText,
  createHref,
  onCreateNew,
  filterConfig = [],
  error,
  customActions,
}: FilterablePageHeaderProps) {
  const { searchParams, updateParams } = useURLParams()
  const router = useRouter()
  
  // State
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '')
  
  // Derived state
  const currentFilters = useFilterState(filterConfig, searchParams)
  const activeFilterCount = Object.values(currentFilters).filter(value => value.trim()).length
  
  // Debounced search
  const debouncedSearch = useDebounce(searchValue, 300)
  
  // Effects
  React.useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    if (debouncedSearch !== currentSearch) {
      updateParams({ search: debouncedSearch })
    }
  }, [debouncedSearch, searchParams, updateParams])

  // Reset search input when URL changes (e.g., from clear all)
  React.useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (searchValue !== urlSearch) {
      setSearchValue(urlSearch)
    }
  }, [searchParams]) // Only depend on searchParams, not searchValue to avoid loops

  // Handlers
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }, [])

  const handleSearchClear = React.useCallback(() => {
    setSearchValue('')
    updateParams({ search: null })
  }, [updateParams])

  const handleFilterChange = React.useCallback((key: string, value: string) => {
    const normalizedValue = value === ALL_OPTION_VALUE ? "" : value
    updateParams({ [key]: normalizedValue })
  }, [updateParams])

  const handleApplyFilters = React.useCallback(() => {
    setFiltersOpen(false)
  }, [])

  const handleClearAll = React.useCallback(() => {
    setSearchValue('')
    // Clear search and all filters
    const clearedParams: Record<string, null> = { search: null }
    filterConfig.forEach(filter => {
      clearedParams[filter.key] = null
    })
    updateParams(clearedParams)
    setFiltersOpen(false)
  }, [filterConfig, updateParams])

  const handleRefresh = React.useCallback(() => {
    router.refresh()
  }, [router])

  const handleCreateNew = React.useCallback(() => {
    if (onCreateNew) {
      onCreateNew()
    } else if (createHref) {
      router.push(createHref)
    }
  }, [onCreateNew, createHref, router])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Title and description */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 pr-8"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-sm"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {filterConfig.length > 0 && (
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Filter the results by the criteria below
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 p-4">
                {filterConfig.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <Label htmlFor={filter.key} className="text-sm font-medium">
                      {filter.label}
                    </Label>
                    <FilterInput
                      filter={filter}
                      value={currentFilters[filter.key]}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearAll}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Refresh */}
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Custom actions */}
        {customActions}

        {/* Create button */}
        {(createButtonText || createHref || onCreateNew) && (
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            {createButtonText || "Create"}
          </Button>
        )}
      </div>
    </div>
  )
}