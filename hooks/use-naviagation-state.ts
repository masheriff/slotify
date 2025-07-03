// hooks/use-navigation-state.ts
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAVIGATION_STATE_KEY = "sidebar_nav_state";

interface NavigationState {
  expandedItems: Set<string>;
  activeItems: Set<string>;
}

export function useNavigationState() {
  const pathname = usePathname();
  const [navState, setNavState] = useState<NavigationState>({
    expandedItems: new Set(),
    activeItems: new Set(),
  });

  // Load navigation state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAVIGATION_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNavState({
          expandedItems: new Set(parsed.expandedItems || []),
          activeItems: new Set(parsed.activeItems || []),
        });
      }
    } catch (error) {
      console.error("Failed to load navigation state:", error);
    }
  }, []);

  // Save navigation state to localStorage
  const saveNavState = (newState: NavigationState) => {
    try {
      localStorage.setItem(
        NAVIGATION_STATE_KEY,
        JSON.stringify({
          expandedItems: Array.from(newState.expandedItems),
          activeItems: Array.from(newState.activeItems),
        })
      );
    } catch (error) {
      console.error("Failed to save navigation state:", error);
    }
  };

  // Check if item is active based on current pathname
  const isItemActive = (url: string): boolean => {
    if (url === pathname) return true;
    
    // For nested routes, check if pathname starts with the item URL
    // but exclude exact matches to avoid false positives
    if (pathname.startsWith(url) && pathname !== url) {
      // Make sure we're not matching partial segments
      const remainingPath = pathname.slice(url.length);
      return remainingPath.startsWith('/') || remainingPath === '';
    }
    
    return false;
  };

  // Check if item should be expanded (has active children)
  const shouldBeExpanded = (item: any): boolean => {
    if (!item.items || item.items.length === 0) return false;
    
    return item.items.some((subItem: any) => isItemActive(subItem.url));
  };

  // Update active items based on current pathname
  useEffect(() => {
    const newActiveItems = new Set<string>();
    
    // Add current pathname to active items
    newActiveItems.add(pathname);
    
    setNavState(prevState => {
      const newState = {
        ...prevState,
        activeItems: newActiveItems,
      };
      saveNavState(newState);
      return newState;
    });
  }, [pathname]);

  // Toggle expansion state
  const toggleExpansion = (itemTitle: string) => {
    setNavState(prevState => {
      const newExpandedItems = new Set(prevState.expandedItems);
      
      if (newExpandedItems.has(itemTitle)) {
        newExpandedItems.delete(itemTitle);
      } else {
        newExpandedItems.add(itemTitle);
      }
      
      const newState = {
        ...prevState,
        expandedItems: newExpandedItems,
      };
      
      saveNavState(newState);
      return newState;
    });
  };

  // Check if item is expanded
  const isExpanded = (itemTitle: string): boolean => {
    // Item should be expanded if manually expanded OR has active children
    return navState.expandedItems.has(itemTitle);
  };

  return {
    isItemActive,
    shouldBeExpanded,
    isExpanded,
    toggleExpansion,
    navState,
  };
}