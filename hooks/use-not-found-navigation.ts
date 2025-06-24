// hooks/use-not-found-navigation.ts
"use client";

import { useRouter } from "next/navigation";
import { useLoadingControl } from "@/lib/with-loading";

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
  const { withLoadingState } = useLoadingControl();

  const goBack = () => {
    withLoadingState(
      'not-found-back-navigation',
      async () => {
        router.push(listRoute);
      },
      'Going back...'
    );
  };

  const goHome = () => {
    withLoadingState(
      'not-found-home-navigation',
      async () => {
        router.push(homeRoute);
      },
      'Going home...'
    );
  };

  const refresh = onRefresh ? () => {
    withLoadingState(
      'not-found-refresh',
      async () => {
        onRefresh();
      },
      'Refreshing...'
    );
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