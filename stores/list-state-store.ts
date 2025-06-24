// stores/list-state-store.ts - FIXED VERSION to prevent infinite loops
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useCallback, useRef, useMemo } from 'react'
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
  
  // FIXED: Use zustand selectors to get individual values instead of the whole store
  const searchQuery = useListStateStore(state => state.searchQuery)
  const currentPage = useListStateStore(state => state.currentPage)
  const pageSize = useListStateStore(state => state.pageSize)
  const sortBy = useListStateStore(state => state.sortBy)
  const sortDirection = useListStateStore(state => state.sortDirection)
  const filters = useListStateStore(state => state.filters)
  
  // Get store actions (these are stable)
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
  
  // FIXED: Sync URL when store state changes - DEBOUNCED AND OPTIMIZED
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
    }, 150) // Slightly higher debounce to reduce calls
    
    return () => clearTimeout(timeoutId)
  }, [
    searchQuery,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    filters,
    router,
    pathname,
    store
  ])
  
  // FIXED: Create stable callback functions with useCallback
  const setFilter = useCallback((key: string, value: string) => {
    store.setFilter(key, value)
  }, [store.setFilter]) // store.setFilter is stable from zustand
  
  const resetFilters = useCallback(() => {
    const filterKeys = filterConfig.map(f => f.key)
    store.resetFilters(filterKeys)
  }, [store.resetFilters, filterConfig]) // filterConfig should be stable if passed as constant
  
  // FIXED: Create stable computed values with useMemo
  const hasActiveFilters = useMemo(() => {
    const filterKeys = filterConfig.map(f => f.key)
    return store.hasActiveFilters(filterKeys)
  }, [store.hasActiveFilters, filterConfig, filters]) // Include filters to recalculate when they change
  
  const urlSearchParams = useMemo(() => {
    return store.getUrlParams()
  }, [searchQuery, currentPage, pageSize, sortBy, sortDirection, filters, store.getUrlParams])
  
  // FIXED: Return stable object with useMemo
  return useMemo(() => ({
    // Current state - these are stable from zustand selectors
    searchQuery,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    filters,
    
    // State setters - these are stable from zustand
    setSearchQuery: store.setSearchQuery,
    setCurrentPage: store.setCurrentPage,
    setPageSize: store.setPageSize,
    setSorting: store.setSorting,
    setFilters: store.setFilters,
    setFilter,
    resetFilters,
    
    // Computed - now stable
    hasActiveFilters,
    urlSearchParams
  }), [
    searchQuery,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    filters,
    store.setSearchQuery,
    store.setCurrentPage,
    store.setPageSize,
    store.setSorting,
    store.setFilters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    urlSearchParams
  ])
}

export default useListStateStore