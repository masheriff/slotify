// stores/list-state-store.ts - Optimized to reduce network calls
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'
import { ListState, ListStateStore, UseListStateProps } from '@/types'

// Create the store
const useListStateStore = create<ListStateStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
    sortBy: null,
    sortDirection: 'asc',
    filters: {},

    // Actions
    setSearchQuery: (query: string) => 
      set({ searchQuery: query, currentPage: 1 }),

    setCurrentPage: (page: number) => 
      set({ currentPage: page }),

    setPageSize: (size: number) => 
      set({ pageSize: size, currentPage: 1 }),

    setSorting: (column: string, direction: 'asc' | 'desc') => {
      if (column) {
        set({ sortBy: column, sortDirection: direction })
      } else {
        set({ sortBy: null, sortDirection: 'asc' })
      }
    },

    setFilters: (filters: Record<string, string>) => 
      set({ filters, currentPage: 1 }),

    setFilter: (key: string, value: string) => {
      const currentFilters = get().filters
      const newFilters = { ...currentFilters }
      
      if (value.trim()) {
        newFilters[key] = value.trim()
      } else {
        delete newFilters[key]
      }
      
      set({ filters: newFilters, currentPage: 1 })
    },

    resetFilters: (filterKeys: string[]) => {
      const currentFilters = get().filters
      const newFilters = { ...currentFilters }
      
      filterKeys.forEach(key => {
        delete newFilters[key]
      })
      
      set({ filters: newFilters, currentPage: 1 })
    },

    resetToDefaults: (defaults: Partial<ListState>) => 
      set({ 
        searchQuery: '',
        currentPage: 1,
        pageSize: 10,
        sortBy: null,
        sortDirection: 'asc',
        filters: {},
        ...defaults 
      }),

    // Computed
    hasActiveFilters: (filterKeys: string[]) => {
      const filters = get().filters
      return filterKeys.some(key => filters[key]?.trim())
    },

    getUrlParams: () => {
      const state = get()
      const params = new URLSearchParams()
      
      if (state.searchQuery.trim()) {
        params.set('search', state.searchQuery.trim())
      }
      
      if (state.currentPage > 1) {
        params.set('page', state.currentPage.toString())
      }
      
      if (state.pageSize !== 10) {
        params.set('pageSize', state.pageSize.toString())
      }
      
      if (state.sortBy) {
        params.set('sortBy', state.sortBy)
      }
      
      if (state.sortDirection !== 'asc') {
        params.set('sortDirection', state.sortDirection)
      }
      
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value.trim())
        }
      })
      
      return params
    }
  }))
)


export function useListState({
  defaultPageSize = 10,
  defaultSort,
  filterConfig = [],
  stateKey = 'default'
}: UseListStateProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const store = useListStateStore()
  
  // Track initialization to prevent multiple URL syncs
  const isInitialized = useRef(false)
  const lastUrlRef = useRef('')
  
  // Initialize state from URL on mount - ONLY ONCE
  useEffect(() => {
    if (isInitialized.current) return
    
    console.log('🔄 Initializing list state from URL')
    
    const urlSearchQuery = searchParams.get('search') || ''
    const urlCurrentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const urlPageSize = parseInt(searchParams.get('pageSize') || defaultPageSize.toString(), 10)
    const urlSortBy = searchParams.get('sortBy') || defaultSort?.column || null
    const urlSortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || defaultSort?.direction || 'asc'
    
    // Extract filters from URL
    const urlFilters: Record<string, string> = {}
    filterConfig.forEach(filter => {
      const value = searchParams.get(filter.key)
      if (value) {
        urlFilters[filter.key] = value
      }
    })
    
    // Set initial state from URL
    store.resetToDefaults({
      searchQuery: urlSearchQuery,
      currentPage: urlCurrentPage,
      pageSize: urlPageSize,
      sortBy: urlSortBy,
      sortDirection: urlSortDirection,
      filters: urlFilters
    })
    
    isInitialized.current = true
  }, []) // Empty dependency array - only run once
  
  // Sync URL when store state changes - DEBOUNCED AND OPTIMIZED
  useEffect(() => {
    if (!isInitialized.current) return
    
    // Debounce URL updates to prevent excessive calls
    const timeoutId = setTimeout(() => {
      const params = store.getUrlParams()
      const newUrl = `${pathname}?${params.toString()}`
      
      // Only update URL if it's actually different
      if (newUrl !== lastUrlRef.current) {
        console.log('🔗 Updating URL:', newUrl)
        router.replace(newUrl, { scroll: false }) // Use replace instead of push to prevent history pollution
        lastUrlRef.current = newUrl
      }
    }, 100) // 100ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [
    store.searchQuery,
    store.currentPage,
    store.pageSize,
    store.sortBy,
    store.sortDirection,
    store.filters,
    router,
    pathname
  ])
  
  // Enhanced setters that respect filter config
  const setFilter = useCallback((key: string, value: string) => {
    store.setFilter(key, value)
  }, [store])
  
  const resetFilters = useCallback(() => {
    const filterKeys = filterConfig.map(f => f.key)
    store.resetFilters(filterKeys)
  }, [store, filterConfig])
  
  const hasActiveFilters = useCallback(() => {
    const filterKeys = filterConfig.map(f => f.key)
    return store.hasActiveFilters(filterKeys)
  }, [store, filterConfig])
  
  return {
    // Current state
    searchQuery: store.searchQuery,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    sortBy: store.sortBy,
    sortDirection: store.sortDirection,
    filters: store.filters,
    
    // State setters
    setSearchQuery: store.setSearchQuery,
    setCurrentPage: store.setCurrentPage,
    setPageSize: store.setPageSize,
    setSorting: store.setSorting,
    setFilters: store.setFilters,
    setFilter,
    resetFilters,
    
    // Computed
    hasActiveFilters: hasActiveFilters(),
    urlSearchParams: store.getUrlParams()
  }
}

export default useListStateStore