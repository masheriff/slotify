"use client";

/**
 * Utility to determine if a navigation item should be considered active
 * Based on current pathname and item URL
 */
export function isNavigationItemActive(itemUrl: string, currentPathname: string): boolean {
  // Exact match
  if (itemUrl === currentPathname) {
    return true;
  }

  // For nested routes, check if pathname starts with the item URL
  if (currentPathname.startsWith(itemUrl)) {
    const remainingPath = currentPathname.slice(itemUrl.length);
    // Ensure we match complete path segments, not partial ones
    return remainingPath === '' || remainingPath.startsWith('/');
  }

  return false;
}

/**
 * Utility to determine if a parent navigation item should be expanded
 * based on whether any of its children are active
 */
export function shouldNavigationItemBeExpanded(
  item: { items?: { url: string }[] },
  currentPathname: string
): boolean {
  if (!item.items || item.items.length === 0) {
    return false;
  }

  return item.items.some(subItem => 
    isNavigationItemActive(subItem.url, currentPathname)
  );
}

/**
 * Get the organization slug from the current pathname
 * Useful for organization-scoped navigation
 */
export function getOrgSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  
  // Check for org slug patterns like /[orgSlug]/... or /5am-corp/admin/...
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // Skip common non-org routes
    if (['api', 'login', 'dashboard', '_next'].includes(firstSegment)) {
      return null;
    }
    
    return firstSegment;
  }
  
  return null;
}

/**
 * Build navigation URL with organization context
 */
export function buildOrgScopedUrl(baseUrl: string, orgSlug?: string): string {
  if (!orgSlug) {
    return baseUrl;
  }
  
  // If baseUrl already includes org slug, return as is
  if (baseUrl.startsWith(`/${orgSlug}/`)) {
    return baseUrl;
  }
  
  // If baseUrl is absolute path without org, prepend org slug
  if (baseUrl.startsWith('/') && !baseUrl.startsWith(`/${orgSlug}`)) {
    return `/${orgSlug}${baseUrl}`;
  }
  
  return baseUrl;
}

// types/navigation.types.ts (Enhanced navigation types)
export interface NavigationItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string | number;
  items?: NavigationSubItem[];
}

export interface NavigationSubItem {
  title: string;
  url: string;
  badge?: string | number;
  isActive?: boolean;
}

export interface NavigationState {
  expandedItems: Set<string>;
  activeItems: Set<string>;
}

export interface NavigationConfig {
  groups: NavigationGroup[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}