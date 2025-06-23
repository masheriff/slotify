// types/error.types.ts
export interface AuthError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface ValidationError extends Error {
  field: string;
  value: any;
  constraint: string;
}

export interface PermissionError extends Error {
  requiredRole?: string;
  requiredPermissions?: string[];
  currentRole?: string;
  resource?: string;
  action?: string;
}