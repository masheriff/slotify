export interface OrganizationFiltersFormProps {
  currentFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearAllFilters: () => void
  triggerClassName?: string
}