// types/events.types.ts
export interface AuthEvent {
  type: string;
  userId?: string;
  organizationId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LoginEvent extends AuthEvent {
  type: 'LOGIN';
  method: 'email' | 'magic_link' | 'social';
  ipAddress?: string;
  userAgent?: string;
}

export interface LogoutEvent extends AuthEvent {
  type: 'LOGOUT';
  sessionId: string;
}

export interface OrganizationSwitchEvent extends AuthEvent {
  type: 'ORGANIZATION_SWITCH';
  fromOrganizationId?: string;
  toOrganizationId: string;
}

export interface PermissionCheckEvent extends AuthEvent {
  type: 'PERMISSION_CHECK';
  resource: string;
  action: string;
  result: 'granted' | 'denied';
  reason?: string;
}