// components/common/data-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Loader2
} from "lucide-react"
import { useLoadingStore } from "@/stores/loading-store"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  sortBy?: string | null
  sortDirection?: 'asc' | 'desc'
  onSortingChange?: (column: string, direction: 'asc' | 'desc') => void
  loadingKey?: string // Key to track loading state
  emptyMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentPage,
  pageSize,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSortingChange,
  loadingKey = 'data-table',
  emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (sortBy && sortDirection) {
      return [{ id: sortBy, desc: sortDirection === 'desc' }]
    }
    return []
  })

  // Subscribe to global loading state
  const isLoading = useLoadingStore((state) => 
    loadingKey ? state.isLoading(loadingKey) : false
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      
      // Update URL with new sorting
      if (onSortingChange && newSorting.length > 0) {
        const sort = newSorting[0]
        onSortingChange(sort.id, sort.desc ? 'desc' : 'asc')
      } else if (onSortingChange && newSorting.length === 0) {
        // Clear sorting
        onSortingChange('', 'asc')
      }
    },
    state: {
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  })

  // Update sorting state when props change
  useEffect(() => {
    if (sortBy && sortDirection) {
      setSorting([{ id: sortBy, desc: sortDirection === 'desc' }])
    } else {
      setSorting([])
    }
  }, [sortBy, sortDirection])

  // Calculate display values
  const startItem = data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + data.length)

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* REMOVED SKELETON LOADING - Just show data or empty state */}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p>Loading...</p>
                      </>
                    ) : (
                      <>
                        <div className="text-lg">📭</div>
                        <p>{emptyMessage}</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {data.length > 0 ? (
              <>
                {startItem}-{endItem}
              </>
            ) : (
              "0"
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={!hasPreviousPage || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPreviousPage || isLoading}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page info */}
            <div className="flex items-center justify-center text-sm font-medium min-w-[80px]">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Page ${currentPage} of ${totalPages || 1}`
              )}
            </div>
            
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage || isLoading}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNextPage || isLoading}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}