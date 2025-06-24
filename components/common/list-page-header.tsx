// components/common/list-page-header.tsx - FIXED
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw } from "lucide-react";
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
import { ListPageHeaderProps } from "@/types";

export function ListPageHeader({
  title,
  searchPlaceholder = "Search...",
  onCreateClick,
  createButtonText = "Create",
  filterComponent, // This will be the actual filter component to render inline
  breadcrumbItems = [],
  searchQuery,
  onSearchChange,
  activeFiltersCount = 0,
  onRefresh,
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
      {/* Main header row */}
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
                    <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Controls - Search, Filter, Refresh, Create */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>

          {/* Filter Component - render the actual filter trigger */}
          {filterComponent}

          {/* Refresh button */}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {/* Create button */}
          {onCreateClick && (
            <Button onClick={onCreateClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}