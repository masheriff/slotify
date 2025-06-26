// hooks/use-not-found-navigation.ts
"use client";

import { useRouter } from "next/navigation";

export interface NotFoundNavigationOptions {
  /** The base list route to go back to (e.g., "/admin/organizations") */
  listRoute: string;
  
  /** The admin home route (defaults to "/admin") */
  homeRoute?: string;
  
  /** Custom refresh function */
  onRefresh?: () => void;
}

export function useNotFoundNavigation({
  listRoute,
  homeRoute = "/admin",
  onRefresh,
}: NotFoundNavigationOptions) {
  const router = useRouter();

  const goBack = () => {
    router.push(listRoute);
  };

  const goHome = () => {
    router.push(homeRoute);
  };

  const refresh = onRefresh ? () => {
    onRefresh();
  } : undefined;

  return {
    goBack,
    goHome,
    refresh,
  };
}

// Predefined navigation hooks for common entities
export function useOrganizationNotFoundNavigation(onRefresh?: () => void) {
  return useNotFoundNavigation({
    listRoute: "/admin/organizations",
    onRefresh,
  });
}

export function useUserNotFoundNavigation(onRefresh?: () => void) {
  return useNotFoundNavigation({
    listRoute: "/admin/users",
    onRefresh,
  });
}

export function usePatientNotFoundNavigation(onRefresh?: () => void) {
  return useNotFoundNavigation({
    listRoute: "/admin/patients",
    onRefresh,
  });
}

export function useBookingNotFoundNavigation(onRefresh?: () => void) {
  return useNotFoundNavigation({
    listRoute: "/admin/bookings",
    onRefresh,
  });
}