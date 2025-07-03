// stores/auth-store.ts - Alternative implementation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient } from '@/lib/auth-client';
import { Organization } from 'better-auth/plugins';
import { User, UserRole } from '@/types';

interface AuthState {
  // State
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  lastFetch: number;
  
  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Async actions
  fetchSession: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Define the async functions outside the store to avoid closure issues
const fetchSessionData = async (set: any) => {
  console.log("fetchSession called - starting execution");
  try {
    const sessionData = await authClient.getSession();
    console.log("Raw session data:", sessionData);
    
    set({ 
      user: sessionData?.data?.user
        ? {
            ...sessionData.data.user,
            role: (sessionData.data.user.role as UserRole),
            image: sessionData.data.user.image ?? undefined,
            banned: sessionData.data.user.banned === null ? undefined : sessionData.data.user.banned,
            banReason: sessionData.data.user.banReason === null ? undefined : sessionData.data.user.banReason,
            banExpires: sessionData.data.user.banExpires === null ? undefined : sessionData.data.user.banExpires
          }
        : null 
    });
    console.log("fetchSession completed successfully");
  } catch (error) {
    console.error('Failed to fetch session:', error);
    set({ user: null });
  }
};

const fetchOrganizationData = async (set: any) => {
  console.log("fetchOrganization called - starting execution");
  try {
    const organizationResponse = await authClient.organization.getFullOrganization();
    console.log("Raw organization data:", organizationResponse);
    
    let organizationData: Organization | null = null;
    if (
      organizationResponse &&
      'id' in organizationResponse &&
      'name' in organizationResponse &&
      'createdAt' in organizationResponse &&
      'slug' in organizationResponse
    ) {
      organizationData = organizationResponse as Organization;
    } else if (
      organizationResponse &&
      'data' in organizationResponse &&
      organizationResponse.data &&
      'id' in organizationResponse.data &&
      'name' in organizationResponse.data &&
      'createdAt' in organizationResponse.data &&
      'slug' in organizationResponse.data
    ) {
      organizationData = organizationResponse.data as Organization;
    }
    set({ organization: organizationData || null });
    console.log("fetchOrganization completed successfully");

  } catch (error) {
    console.error('Failed to fetch organization:', error);
    set({ organization: null });
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organization: null,
      isLoading: false,
      lastFetch: 0,

      // Synchronous actions
      setUser: (user) => set({ 
        user: user
          ? { 
              ...user, 
              role: user.role
            }
          : null 
      }),
      setOrganization: (org) => set({ organization: org }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Async actions using external functions
      fetchSession: () => fetchSessionData(set),
      fetchOrganization: () => fetchOrganizationData(set),

      // Initialize auth data (with caching)
      initializeAuth: async () => {
        console.log("initializeAuth called from store");
        const now = Date.now();
        const { lastFetch, isLoading } = get();
        
        console.log("Current state:", { 
          lastFetch, 
          isLoading, 
          timeSinceLastFetch: now - lastFetch,
          cacheExpired: now - lastFetch >= AUTH_CACHE_DURATION 
        });
        
        // Skip if recently fetched or already loading
        if (isLoading || (now - lastFetch < AUTH_CACHE_DURATION)) {
          console.log("Skipping initialization - recently fetched or already loading");
          return;
        }

        set({ isLoading: true });
        console.log("Starting parallel fetch operations");
        
        try {
          // Call external functions directly
          await Promise.all([
            fetchSessionData(set),
            fetchOrganizationData(set),
          ]);
          
          console.log("Parallel fetch operations completed");
          set({ lastFetch: now });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        } finally {
          set({ isLoading: false });
          console.log("initializeAuth completed");
        }
      },

      // Clear all auth data
      clearAuth: () => set({ 
        user: null, 
        organization: null, 
        isLoading: false, 
        lastFetch: 0 
      }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        // Only persist non-sensitive data
        user: state.user,
        organization: state.organization,
        lastFetch: state.lastFetch,
      }),
    }
  )
);