"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { isNavigationItemActive, shouldNavigationItemBeExpanded } from "@/utils/navigation.utils";
import { saveUserExpandedItems } from "@/utils/navigation-state.utils";
import type { ServerNavState, NavItem } from "@/utils/navigation-state.utils";

interface NavigationStateHookProps {
  initialState: ServerNavState;
  navItems: NavItem[];
}

export function useNavigationState({ initialState, navItems }: NavigationStateHookProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  // Initialize state from server-calculated values
  const [userExpandedItems, setUserExpandedItems] = useState<Set<string>>(
    initialState.userExpandedItems
  );
  
  // Calculate current auto-expanded items based on pathname
  const autoExpandedItems = calculateAutoExpandedItems(pathname, navItems);
  
  // Calculate current active items based on pathname
  const activeItems = calculateActiveItems(pathname, navItems);

  // Check if item is active
  const isItemActive = useCallback((url: string): boolean => {
    return isNavigationItemActive(url, pathname);
  }, [pathname]);

  // Check if item should be expanded (auto OR manually)
  const isExpanded = useCallback((itemTitle: string): boolean => {
    return autoExpandedItems.has(itemTitle) || userExpandedItems.has(itemTitle);
  }, [autoExpandedItems, userExpandedItems]);

  // Check if item should be auto-expanded (has active children)
  const shouldBeExpanded = useCallback((item: NavItem): boolean => {
    return shouldNavigationItemBeExpanded(item, pathname);
  }, [pathname]);

  // Toggle manual expansion state
  const toggleExpansion = useCallback((itemTitle: string) => {
    setUserExpandedItems(prev => {
      const newSet = new Set(prev);
      const isAutoExpanded = autoExpandedItems.has(itemTitle);
      
      if (newSet.has(itemTitle)) {
        // If manually expanded, remove it
        newSet.delete(itemTitle);
      } else if (!isAutoExpanded) {
        // If not auto-expanded and not manually expanded, add it
        newSet.add(itemTitle);
      } else {
        // If auto-expanded but user wants to collapse, add to manual set
        // This creates a "force collapsed" state that overrides auto-expansion
        // We'll handle this in the isExpanded logic
        newSet.add(`__collapsed__${itemTitle}`);
      }
      
      // Save to cookie (non-blocking)
      startTransition(() => {
        saveUserExpandedItems(Array.from(newSet));
      });
      
      return newSet;
    });
  }, [autoExpandedItems]);

  // Enhanced isExpanded that handles force-collapsed state
  const isExpandedEnhanced = useCallback((itemTitle: string): boolean => {
    const isForceCollapsed = userExpandedItems.has(`__collapsed__${itemTitle}`);
    if (isForceCollapsed) return false;
    
    return autoExpandedItems.has(itemTitle) || userExpandedItems.has(itemTitle);
  }, [autoExpandedItems, userExpandedItems]);

  return {
    isItemActive,
    shouldBeExpanded,
    isExpanded: isExpandedEnhanced,
    toggleExpansion,
    activeItems,
    expandedItems: new Set([...autoExpandedItems, ...userExpandedItems]),
    isPending, // For loading states during cookie updates
  };
}

// Helper functions
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