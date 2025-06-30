// components/common/data-table.tsx - Simplified server-side version
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"

interface PaginationData {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

interface SortingData {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationData;
  sorting?: SortingData;
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
  selectable = false,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { 
    page, 
    pageSize, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage,
    totalCount 
  } = pagination;

  // Helper to update URL with new params
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

  // Navigation handlers
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    updateURL({ 
      pageSize: newPageSize,
      page: 1 // Reset to first page when changing page size
    });
  };

  const handleSort = (columnId: string) => {
    const currentSortBy = sorting?.sortBy;
    const currentDirection = sorting?.sortDirection;
    
    let newDirection: "asc" | "desc" = "asc";
    
    // If clicking the same column, toggle direction
    if (currentSortBy === columnId) {
      newDirection = currentDirection === "asc" ? "desc" : "asc";
    }
    
    updateURL({
      sortBy: columnId,
      sortDirection: newDirection,
      page: 1 // Reset to first page when sorting
    });
  };

  // Helper to get column ID from different column types
  const getColumnId = (column: ColumnDef<TData, TValue>): string | undefined => {
    // Handle different column definition types
    if ('accessorKey' in column && column.accessorKey) {
      return column.accessorKey as string;
    }
    if ('id' in column && column.id) {
      return column.id;
    }
    return undefined;
  };

  // Helper to check if column is sortable
  const isColumnSortable = (column: ColumnDef<TData, TValue>): boolean => {
    return column.enableSorting !== false && getColumnId(column) !== undefined;
  };

  // Helper to render sort button for header
  const renderSortableHeader = (originalHeader: React.ReactNode, columnId: string) => {
    const isSorted = sorting?.sortBy === columnId;
    const sortDirection = sorting?.sortDirection;

    return (
      <Button
        variant="ghost"
        onClick={() => handleSort(columnId)}
        className="h-auto p-0 font-medium hover:bg-transparent justify-start"
      >
        <span>{originalHeader}</span>
        {isSorted ? (
          sortDirection === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  const table = useReactTable({
    data,
    columns, // Use original columns without modification
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // We handle pagination server-side
    manualSorting: true,    // We handle sorting server-side
  });

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectable && bulkActions && (
        <div className="flex items-center gap-2">
          {bulkActions}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef;
                  const columnId = getColumnId(columnDef);
                  const isSortable = isColumnSortable(columnDef);

                  // Get the original header content
                  const originalHeader = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <TableHead key={header.id} className="font-medium">
                      {isSortable && columnId ? 
                        renderSortableHeader(originalHeader, columnId) : 
                        originalHeader
                      }
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCount > 0 ? (
              <>
                Showing {((page - 1) * pageSize) + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount} results
              </>
            ) : (
              "No results"
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={!hasPreviousPage}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPreviousPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page + 1)}
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