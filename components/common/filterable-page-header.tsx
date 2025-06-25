// components/common/filterable-page-header.tsx - Fresh implementation with proper search handling
"use client"

import { useCallback, useTransition, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  X, 
  Calendar as CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "use-debounce"

interface FilterablePageHeaderProps {
  title: string;
  description?: string;
  createButtonText?: string;
  createHref?: string;
  onCreateNew?: () => void;
  filterConfig: Array<{
    label: string;
    key: string;
    type: 'text' | 'select' | 'date' | 'number' | 'boolean';
    options?: Array<{ value: string; label: string; disabled?: boolean }>;
    placeholder?: string;
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: RegExp;
    };
  }>;
  error?: string;
  customActions?: React.ReactNode;
}

export function FilterablePageHeader({
  title,
  description,
  createButtonText,
  createHref,
  onCreateNew,
  filterConfig,
  error,
  customActions,
}: FilterablePageHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Local search state for immediate UI response
  const [searchValue, setSearchValue] = useState('')

  // Read current URL parameters
  const currentSearch = searchParams.get('search') || ''
  const currentFilters = filterConfig.reduce((acc, filter) => {
    acc[filter.key] = searchParams.get(filter.key) || ''
    return acc
  }, {} as Record<string, string>)

  // Sync local search state with URL
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

  // Count active filters
  const activeFilterCount = Object.values(currentFilters).filter(value => value.trim()).length

  // URL update utility
  const updateURL = useCallback((newParams: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value.trim()) {
        newSearchParams.set(key, value.trim())
      } else {
        newSearchParams.delete(key)
      }
    })

    // Reset page to 1 when search or filters change
    if ('search' in newParams || filterConfig.some(f => f.key in newParams)) {
      newSearchParams.set('page', '1')
    }

    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`
    const currentURL = `${window.location.pathname}?${searchParams.toString()}`
    
    if (newURL !== currentURL) {
      startTransition(() => {
        router.push(newURL, { scroll: false })
      })
    }
  }, [router, searchParams, filterConfig])

  // Debounced search update to URL
  const debouncedSearchUpdate = useDebouncedCallback((query: string) => {
    updateURL({ search: query })
  }, 300)

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearchUpdate(value)
  }, [debouncedSearchUpdate])

  const clearSearch = useCallback(() => {
    setSearchValue('')
    updateURL({ search: '' })
  }, [updateURL])

  // Filter handlers
  const handleFilterChange = useCallback((key: string, value: string) => {
    updateURL({ [key]: value })
  }, [updateURL])

  const handleClearFilters = useCallback(() => {
    const clearParams: Record<string, string> = { search: '' }
    filterConfig.forEach(filter => {
      clearParams[filter.key] = ''
    })
    setSearchValue('')
    updateURL(clearParams)
    setFiltersOpen(false)
  }, [updateURL, filterConfig])

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh()
    })
  }, [router])

  const handleCreateNew = useCallback(() => {
    if (onCreateNew) {
      onCreateNew()
    } else if (createHref) {
      router.push(createHref)
    }
  }, [onCreateNew, createHref, router])

  // Render filter input based on type
  const renderFilterInput = useCallback((filter: any) => {
    const currentValue = currentFilters[filter.key] || ''

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option: any) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !currentValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentValue ? format(new Date(currentValue), "PPP") : filter.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentValue ? new Date(currentValue) : undefined}
                onSelect={(date) => {
                  const value = date ? format(date, "yyyy-MM-dd") : ''
                  handleFilterChange(filter.key, value)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={currentValue}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            min={filter.validation?.min}
            max={filter.validation?.max}
            className="w-full"
          />
        )

      case 'boolean':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={currentValue}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        )
    }
  }, [currentFilters, handleFilterChange])

  return (
    <div className="space-y-4">
      {/* Header with title and description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {/* Action buttons - ordered as requested: search, filters, refresh, add */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10 pr-8"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-sm"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filters button */}
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
                  Apply filters to narrow down your results
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 p-4">
                {/* Filter Controls */}
                <div className="space-y-4">
                  {filterConfig.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <label className="text-sm font-medium">
                        {filter.label}
                        {filter.validation?.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Filters ({activeFilterCount})</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-8 px-3"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(currentFilters).map(([key, value]) => {
                        if (!value.trim()) return null
                        const filter = filterConfig.find(f => f.key === key)
                        return (
                          <Badge key={key} variant="secondary" className="gap-1">
                            {filter?.label}: {value}
                            <button
                              type="button"
                              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleFilterChange(key, '')
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          {/* Create button */}
          {(createButtonText || createHref) && (
            <Button 
              onClick={handleCreateNew} 
              disabled={isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText || "Create New"}
            </Button>
          )}

          {/* Custom actions */}
          {customActions}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}