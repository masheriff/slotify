// components/common/data-table.tsx - SIMPLE FIX
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
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
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

// Updated interface to match your existing pattern
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalCount?: number;
  };
  sorting?: {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
  emptyMessage?: string;
  selectable?: boolean;
  bulkActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  sorting,
  emptyMessage = "No results found.",
  selectable,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Destructure pagination
  const { 
    currentPage, 
    pageSize, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage,
    totalCount 
  } = pagination;

  const [sorting_state, setSorting] = useState<SortingState>(() => {
    if (sorting?.sortBy && sorting?.sortDirection) {
      return [{ id: sorting.sortBy, desc: sorting.sortDirection === 'desc' }]
    }
    return []
  })

  // URL update helper
  const updateURL = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // Event handlers
  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateURL({ 
      pageSize: newPageSize,
      page: 1 // Reset to first page
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting_state) : updater
      setSorting(newSorting)
      
      // Update URL with new sorting
      if (newSorting.length > 0) {
        const sort = newSorting[0]
        updateURL({
          sortBy: sort.id,
          sortDirection: sort.desc ? 'desc' : 'asc',
          page: 1 // Reset to first page
        });
      } else {
        updateURL({
          sortBy: undefined,
          sortDirection: undefined,
          page: 1
        });
      }
    },
    state: {
      sorting: sorting_state,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  })

  // Update sorting state when props change
  useEffect(() => {
    if (sorting?.sortBy && sorting?.sortDirection) {
      setSorting([{ id: sorting.sortBy, desc: sorting.sortDirection === 'desc' }])
    } else {
      setSorting([])
    }
  }, [sorting?.sortBy, sorting?.sortDirection])

  // Calculate display values
  const startItem = data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + data.length)
  
  // Calculate total items display
  const totalItems = totalCount || (totalPages * pageSize)
  const displayEndItem = totalCount ? Math.min(endItem, totalCount) : endItem

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
                    <div className="text-lg">📭</div>
                    <p>{emptyMessage}</p>
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
            onValueChange={(value) => handlePageSizeChange(Number(value))}
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
            {data.length > 0 && totalCount ? (
              `${startItem}-${displayEndItem} of ${totalCount}`
            ) : data.length > 0 ? (
              `${startItem}-${displayEndItem}`
            ) : (
              "0 items"
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={!hasPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page info */}
            <div className="flex items-center justify-center text-sm font-medium min-w-[80px]">
              Page {currentPage} of {totalPages || 1}
            </div>
            
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(totalPages)}
              disabled={!hasNextPage}
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