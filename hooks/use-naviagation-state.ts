"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState, useRef } from "react";
import { isNavigationItemActive, shouldNavigationItemBeExpanded } from "@/utils/navigation.utils";
import { saveUserExpandedItems } from "@/utils/navigation-state.utils";
import type { ServerNavState, NavItem } from "@/utils/navigation-state.utils";

interface NavigationStateHookProps {
  initialState: ServerNavState;
  navItems: NavItem[];
}

export function useNavigationState({ initialState, navItems }: NavigationStateHookProps) {
  const pathname = usePathname();
  
  // Initialize state from server-calculated values
  const [userExpandedItems, setUserExpandedItems] = useState<Set<string>>(
    initialState.userExpandedItems
  );
  
  // Use ref to track pending server syncs to avoid race conditions
  const pendingSyncRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate current auto-expanded items based on pathname (memoized)
  const autoExpandedItems = calculateAutoExpandedItems(pathname, navItems);
  
  // Calculate current active items based on pathname (memoized)
  const activeItems = calculateActiveItems(pathname, navItems);

  // Check if item is active - this is independent of expansion state
  const isItemActive = useCallback((url: string): boolean => {
    return isNavigationItemActive(url, pathname);
  }, [pathname]);

  // Check if item should be auto-expanded (has active children) - also independent
  const shouldBeExpanded = useCallback((item: NavItem): boolean => {
    return shouldNavigationItemBeExpanded(item, pathname);
  }, [pathname]);

  // Enhanced isExpanded that handles force-collapsed state properly
  const isExpanded = useCallback((itemTitle: string): boolean => {
    const isForceCollapsed = userExpandedItems.has(`__collapsed__${itemTitle}`);
    if (isForceCollapsed) return false;
    
    return autoExpandedItems.has(itemTitle) || userExpandedItems.has(itemTitle);
  }, [autoExpandedItems, userExpandedItems]);

  // Debounced server sync function
  const syncToServer = useCallback((newExpandedItems: Set<string>) => {
    // Clear any existing pending sync
    if (pendingSyncRef.current) {
      clearTimeout(pendingSyncRef.current);
    }
    
    // Debounce server calls by 300ms to avoid excessive requests
    pendingSyncRef.current = setTimeout(async () => {
      try {
        await saveUserExpandedItems(Array.from(newExpandedItems));
      } catch (error) {
        console.error("Failed to sync navigation state to server:", error);
        // Optionally, you could add retry logic here
      }
    }, 300);
  }, []);

  // Toggle manual expansion state - FIXED: Proper force-collapse handling
  const toggleExpansion = useCallback((itemTitle: string) => {
    setUserExpandedItems(prev => {
      const newSet = new Set(prev);
      const isAutoExpanded = autoExpandedItems.has(itemTitle);
      const isForceCollapsed = newSet.has(`__collapsed__${itemTitle}`);
      const isManuallyExpanded = newSet.has(itemTitle);
      
      if (isForceCollapsed) {
        // If force-collapsed, remove force-collapse (allow auto-expand to work)
        newSet.delete(`__collapsed__${itemTitle}`);
      } else if (isManuallyExpanded) {
        // If manually expanded, remove it
        newSet.delete(itemTitle);
        // If it's also auto-expanded, add force-collapse to keep it closed
        if (isAutoExpanded) {
          newSet.add(`__collapsed__${itemTitle}`);
        }
      } else if (isAutoExpanded) {
        // If auto-expanded but user wants to collapse, add force-collapse
        newSet.add(`__collapsed__${itemTitle}`);
      } else {
        // If not expanded at all, add manual expansion
        newSet.add(itemTitle);
      }
      
      // Schedule server sync (debounced, non-blocking)
      syncToServer(newSet);
      
      return newSet;
    });
  }, [autoExpandedItems, syncToServer]);

  return {
    isItemActive,
    shouldBeExpanded,
    isExpanded,
    toggleExpansion,
    activeItems,
    expandedItems: new Set([...autoExpandedItems, ...userExpandedItems]),
    isPending: false, // No longer needed since we're not using startTransition
  };
}

// Helper functions - kept separate for clarity and memoization
function calculateAutoExpandedItems(pathname: string, navItems: NavItem[]): Set<string> {
  const autoExpanded = new Set<string>();
  
  navItems.forEach(item => {
    if (shouldNavigationItemBeExpanded(item, pathname)) {
      autoExpanded.add(item.title);
    }
  });
  
  return autoExpanded;
}

function calculateActiveItems(pathname: string, navItems: NavItem[]): Set<string> {
  const active = new Set<string>();
  
  navItems.forEach(item => {
    if (isNavigationItemActive(item.url, pathname)) {
      active.add(item.url);
    }
    
    item.items?.forEach(subItem => {
      if (isNavigationItemActive(subItem.url, pathname)) {
        active.add(subItem.url);
      }
    });
  });
  
  return active;
}