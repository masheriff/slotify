// components/common/filterable-page-header.tsx - Fixed version without onExport prop
"use client"

import { useCallback, useTransition, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "use-debounce"

// Updated interface without onExport function prop
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
  showExport?: boolean;
  // Remove onExport?: () => void; - this was causing the issue
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
  showExport = false,
  customActions,
}: FilterablePageHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Read current URL parameters
  const currentSearch = searchParams.get('search') || ''
  const currentFilters = filterConfig.reduce((acc, filter) => {
    acc[filter.key] = searchParams.get(filter.key) || ''
    return acc
  }, {} as Record<string, string>)

  // Check if there are active filters
  const hasActiveFilters = Object.values(currentFilters).some(value => value.trim()) || currentSearch.trim()
  const activeFilterCount = Object.values(currentFilters).filter(value => value.trim()).length + (currentSearch.trim() ? 1 : 0)

  // Auto-expand filters if there are active ones
  const shouldShowFilters = filtersExpanded || hasActiveFilters

  // URL update utility with improved UX
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

  // Debounced search handler with improved UX
  const handleSearch = useDebouncedCallback((query: string) => {
    updateURL({ search: query })
  }, 300)

  // Filter handlers
  const handleFilterChange = useCallback((key: string, value: string) => {
    updateURL({ [key]: value })
  }, [updateURL])

  const handleClearFilters = useCallback(() => {
    const clearParams: Record<string, string> = { search: '' }
    filterConfig.forEach(filter => {
      clearParams[filter.key] = ''
    })
    updateURL(clearParams)
    setFiltersExpanded(false)
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

  // Handle export functionality internally
  const handleExport = useCallback(async () => {
    try {
      console.log('Starting export...')
      
      // Get current page data and filters
      const currentPage = window.location.pathname
      const currentParams = new URLSearchParams(searchParams.toString())
      
      // Determine export type based on page
      let exportEndpoint = ''
      let filename = ''
      
      if (currentPage.includes('/organizations')) {
        exportEndpoint = '/api/export/organizations'
        filename = 'organizations'
      } else if (currentPage.includes('/users')) {
        exportEndpoint = '/api/export/users'
        filename = 'users'
      } else if (currentPage.includes('/patients')) {
        exportEndpoint = '/api/export/patients'
        filename = 'patients'
      } else {
        // Generic export
        exportEndpoint = '/api/export/data'
        filename = 'export'
      }
      
      // Add current filters to export request
      const exportUrl = `${exportEndpoint}?${currentParams.toString()}`
      
      // Fetch the export data
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      
      // Get the blob data
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('Export completed successfully')
    } catch (error) {
      console.error('Export failed:', error)
      // You could add toast notification here
      alert('Export failed. Please try again.')
    }
  }, [searchParams])

  // Render filter input based on type with improved validation
  const renderFilterInput = (filter: FilterablePageHeaderProps['filterConfig'][0]) => {
    const value = currentFilters[filter.key]
    const hasError = filter.validation?.required && !value

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className={cn("w-full", hasError && "border-destructive")}>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
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
                  !value && "text-muted-foreground",
                  hasError && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : filter.placeholder || `Select ${filter.label}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFilterChange(filter.key, date ? date.toISOString().split('T')[0] : '')}
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
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className={cn(hasError && "border-destructive")}
            min={filter.validation?.min}
            max={filter.validation?.max}
          />
        )
      
      case 'boolean':
        return (
          <Select
            value={value}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className={cn("w-full", hasError && "border-destructive")}>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )
      
      default: // 'text'
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className={cn(hasError && "border-destructive")}
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
          {error && (
            <p className="text-destructive mt-1 text-sm font-medium">{error}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Custom actions */}
          {customActions}
          
          {/* Export button */}
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
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
          
          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFiltersExpanded(!filtersExpanded)}>
                <Filter className="h-4 w-4 mr-2" />
                {shouldShowFilters ? 'Hide Filters' : 'Show Filters'}
              </DropdownMenuItem>
              {hasActiveFilters && (
                <DropdownMenuItem onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters Section */}
      {shouldShowFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={currentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Grid */}
              {filterConfig.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filterConfig.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {filter.label}
                        {filter.validation?.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              )}

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {currentSearch && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {currentSearch}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleSearch('')}
                      />
                    </Badge>
                  )}
                  {Object.entries(currentFilters).map(([key, value]) => {
                    if (!value.trim()) return null
                    const filter = filterConfig.find(f => f.key === key)
                    return (
                      <Badge key={key} variant="secondary" className="gap-1">
                        {filter?.label}: {value}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleFilterChange(key, '')}
                        />
                      </Badge>
                    )
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}