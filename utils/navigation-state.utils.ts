"use server";

import { cookies } from "next/headers";
import { isNavigationItemActive, shouldNavigationItemBeExpanded } from "./navigation.utils";

const NAV_STATE_COOKIE = "nav_expanded_items";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export interface ServerNavState {
  autoExpandedItems: Set<string>;
  userExpandedItems: Set<string>;
  activeItems: Set<string>;
}

export interface NavItem {
  title: string;
  url: string;
  items?: { title: string; url: string }[];
}

/**
 * Calculate initial navigation state on the server
 * This prevents hydration mismatches and provides immediate correct state
 */
export async function calculateServerNavState(
  pathname: string, 
  navItems: NavItem[]
): Promise<ServerNavState> {
  const autoExpandedItems = new Set<string>();
  const activeItems = new Set<string>();
  
  // Calculate which items should be auto-expanded based on current pathname
  navItems.forEach(item => {
    // Check if this item is active
    if (isNavigationItemActive(item.url, pathname)) {
      activeItems.add(item.url);
    }
    
    // Check if this item should be auto-expanded (has active children)
    if (shouldNavigationItemBeExpanded(item, pathname)) {
      autoExpandedItems.add(item.title);
    }
    
    // Check sub-items for active state
    item.items?.forEach(subItem => {
      if (isNavigationItemActive(subItem.url, pathname)) {
        activeItems.add(subItem.url);
        // Parent should be auto-expanded if child is active
        autoExpandedItems.add(item.title);
      }
    });
  });
  
  // Get user's saved expansion preferences from cookie
  const userExpandedItems = await getUserExpandedItems();
  
  return {
    autoExpandedItems,
    userExpandedItems,
    activeItems,
  };
}

/**
 * Get user's manually expanded items from cookie (SSR-safe)
 */
export async function getUserExpandedItems(): Promise<Set<string>> {
  try {
    const cookieStore = cookies();
    const navCookie = (await cookieStore).get(NAV_STATE_COOKIE);
    
    if (navCookie?.value) {
      const items = JSON.parse(navCookie.value) as string[];
      return new Set(items);
    }
  } catch (error) {
    console.error("Failed to parse navigation cookie:", error);
  }
  
  return new Set();
}

/**
 * Save user's expanded items to cookie (server action)
 */
export async function saveUserExpandedItems(expandedItems: string[]) {
  try {
    const cookieStore = cookies();
    (await cookieStore).set(NAV_STATE_COOKIE, JSON.stringify(expandedItems), {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Failed to save navigation cookie:", error);
  }
}
