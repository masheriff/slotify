// types/component-detail.types.ts - Detail component prop interfaces

import { ReactNode } from 'react';
import { Organization } from '@/types/organization.types';
import { BreadcrumbItem } from './component.types';

// Member details component props
export interface MemberDetailsContentProps {
  member: MemberDetails;
  organization: Organization;
  organizationId: string;
  memberId: string;
}

// Member details data structure (from getMemberById)
export interface MemberDetails {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

// Organization details component props
export interface OrganizationDetailsContentProps {
  organization: Organization;
  organizationId: string;
  memberCount?: number;
  recentActivity?: ActivityItem[];
}

// Activity item for organization details
export interface ActivityItem {
  id: string;
  type: 'member_added' | 'member_removed' | 'settings_updated' | 'invitation_sent';
  description: string;
  timestamp: Date | string;
  userId?: string;
  userName?: string;
}

// User details component props
export interface UserDetailsContentProps {
  user: UserDetails;
  userId: string;
  organizationMemberships?: UserMembership[];
}

// User details data structure
export interface UserDetails {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | string | null;
  role?: string;
}

// User membership info
export interface UserMembership {
  organizationId: string;
  organizationName: string;
  role: string;
  joinedAt: Date | string;
  status: 'active' | 'inactive';
}

// Generic details layout props
export interface DetailsLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  loading?: boolean;
  error?: string;
}

// Navigation action props
export interface NavigationActionsProps {
  backUrl: string;
  editUrl?: string;
  deleteUrl?: string;
  additionalActions?: ReactNode;
}

// Status display props
export interface StatusDisplayProps {
  status: 'active' | 'inactive' | 'pending' | 'banned';
  label?: string;
  showIcon?: boolean;
  className?: string;
}

// Metadata display props
export interface MetadataDisplayProps {
  metadata: Record<string, any>;
  title?: string;
  editable?: boolean;
  onEdit?: () => void;
}