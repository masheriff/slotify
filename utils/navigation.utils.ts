
/**
 * Enhanced utility to determine if a navigation item should be considered active
 * Based on current pathname and item URL
 */
export function isNavigationItemActive(itemUrl: string, currentPathname: string): boolean {
  // Handle empty or invalid URLs
  if (!itemUrl || !currentPathname) {
    return false;
  }

  // Normalize URLs (remove trailing slashes)
  const normalizedItemUrl = itemUrl.replace(/\/$/, '') || '/';
  const normalizedPathname = currentPathname.replace(/\/$/, '') || '/';

  // Exact match
  if (normalizedItemUrl === normalizedPathname) {
    return true;
  }

  // For nested routes, check if pathname starts with the item URL
  if (normalizedPathname.startsWith(normalizedItemUrl)) {
    const remainingPath = normalizedPathname.slice(normalizedItemUrl.length);
    // Ensure we match complete path segments, not partial ones
    return remainingPath === '' || remainingPath.startsWith('/');
  }

  return false;
}

/**
 * Enhanced utility to determine if a parent navigation item should be expanded
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
 * Enhanced to handle various URL patterns
 */
export function getOrgSlugFromPathname(pathname: string): string | null {
  if (!pathname) return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  // Check for org slug patterns like /[orgSlug]/... or /5am-corp/admin/...
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // Skip common non-org routes
    if (['api', 'login', 'auth', 'dashboard', '_next', 'public'].includes(firstSegment)) {
      return null;
    }
    
    return firstSegment;
  }
  
  return null;
}

/**
 * Build navigation URL with organization context
 * Enhanced error handling and validation
 */
export function buildOrgScopedUrl(baseUrl: string, orgSlug?: string): string {
  if (!baseUrl) return '/';
  if (!orgSlug) return baseUrl;
  
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

/**
 * Check if two paths are in the same navigation branch
 * Useful for maintaining expansion state during navigation
 */
export function arePathsInSameBranch(path1: string, path2: string): boolean {
  if (!path1 || !path2) return false;
  
  const segments1 = path1.split('/').filter(Boolean);
  const segments2 = path2.split('/').filter(Boolean);
  
  // Compare the first 3 segments (org/section/subsection)
  const compareLength = Math.min(3, segments1.length, segments2.length);
  
  for (let i = 0; i < compareLength; i++) {
    if (segments1[i] !== segments2[i]) {
      return false;
    }
  }
  
  return true;
}