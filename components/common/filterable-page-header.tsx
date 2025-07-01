// components/common/filterable-page-header.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  X
} from "lucide-react"
import { useState } from "react"
import * as React from "react"
import { FilterablePageHeaderProps, FilterConfig } from "@/types"

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
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Read current values from URL
  const currentSearch = searchParams.get('search') || ''
  const currentFilters = filterConfig.reduce((acc, filter) => {
    acc[filter.key] = searchParams.get(filter.key) || ''
    return acc
  }, {} as Record<string, string>)

  // Local state for filter form values
  const [localFilters, setLocalFilters] = useState(currentFilters)

  // Update local state when URL changes
  React.useEffect(() => {
    setLocalFilters(currentFilters)
  }, [searchParams])

  // Count active filters (excluding search)
  const activeFilterCount = Object.values(currentFilters).filter(value => value.trim()).length

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchValue = formData.get('search')?.toString().trim() || ''
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }
    
    // Reset to page 1 when searching
    params.set('page', '1')
    
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  // Handle filter application
  const handleFilterSubmit = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update all filter values from local state
    filterConfig.forEach(filter => {
      const value = localFilters[filter.key]?.trim() || ''
      if (value && value !== '__all__') { // Don't include the "All" placeholder value
        params.set(filter.key, value)
      } else {
        params.delete(filter.key)
      }
    })
    
    // Reset to page 1 when filtering
    params.set('page', '1')
    
    router.push(`${window.location.pathname}?${params.toString()}`)
    setFiltersOpen(false)
  }

  // Handle individual filter change
  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '__all__' ? '' : value
    }))
  }

  // Clear all filters and search
  const handleClearAll = () => {
    const params = new URLSearchParams()
    // Keep non-filter params like page, pageSize if you want
    router.push(`${window.location.pathname}`)
    setFiltersOpen(false)
  }

  // Handle refresh
  const handleRefresh = () => {
    router.refresh()
  }

  // Handle create new
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else if (createHref) {
      router.push(createHref)
    }
  }

  // Render individual filter input
  const renderFilterInput = (filter: FilterConfig, currentValue: string) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select 
            value={localFilters[filter.key] || '__all__'} 
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {/* Use a special value instead of empty string for "All" option */}
              <SelectItem value="__all__">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                // Only render SelectItem if value is not empty
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

      case 'date':
        return (
          <Input
            type="date"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            className="w-full"
          />
        )

      case 'boolean':
        return (
          <Select 
            value={localFilters[filter.key] || '__all__'} 
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )

      default: // 'text'
        return (
          <Input
            type="text"
            value={localFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            className="w-full"
          />
        )
    }
  }

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
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search..."
            defaultValue={currentSearch}
            className="pl-10 pr-8"
          />
          {currentSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete('search')
                params.set('page', '1')
                router.push(`${window.location.pathname}?${params.toString()}`)
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-sm"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </form>

        {/* Filters sheet */}
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
                    <label htmlFor={filter.key} className="text-sm font-medium">
                      {filter.label}
                    </label>
                    {renderFilterInput(filter, currentFilters[filter.key])}
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={handleFilterSubmit} 
                    className="flex-1"
                  >
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

        {/* Refresh button */}
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