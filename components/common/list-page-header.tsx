// components/common/list-page-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ListPageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  onCreateClick?: () => void;
  createButtonText?: string;
  filterComponent?: React.ReactNode;
  totalCount?: number;
  breadcrumbItems?: Array<{
    title: string;
    href?: string;
  }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFiltersCount?: number;
}

export function ListPageHeader({
  title,
  searchPlaceholder = "Search...",
  onCreateClick,
  createButtonText = "Create",
  filterComponent,
  totalCount,
  breadcrumbItems = [],
  searchQuery,
  onSearchChange,
  activeFiltersCount = 0,
}: ListPageHeaderProps) {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onSearchChange(searchValue.trim());
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchValue, onSearchChange]);

  // Update search value when external searchQuery changes
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Controls and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbSeparator
                  key={`sep-${index}`}
                  className="hidden md:block"
                />
              ))}
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={index} className="hidden md:block">
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Button */}
          {filterComponent && (
            <div className="relative">
              {filterComponent}
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
          )}

          {/* Create Button */}
          {onCreateClick && (
            <Button onClick={onCreateClick} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
