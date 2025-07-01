// lib/utils/user-utils.ts
import { USER_ROLES } from "@/types/user.types";

/**
 * Get color class for user status badge
 */
export function getUserStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "border-green-200 bg-green-50 text-green-700";
    case "banned":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

/**
 * Get display label for user status
 */
export function getUserStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "banned":
      return "Banned";
    default:
      return "Unknown";
  }
}

/**
 * Get color class for user role badge
 */
export function getRoleColor(role: string): string {
  switch (role) {
    case "system_admin":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "five_am_admin":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "five_am_agent":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "client_admin":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "front_desk":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "technician":
      return "border-green-200 bg-green-50 text-green-700";
    case "interpreting_doctor":
      return "border-pink-200 bg-pink-50 text-pink-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

/**
 * Get display label for user role
 */
export function getRoleLabel(role: string): string {
  const roleObj = USER_ROLES.find(r => r.value === role);
  return roleObj?.label || role;
}

/**
 * Get color class for organization type badge
 */
export function getOrganizationTypeColor(type: string): string {
  switch (type) {
    case "admin":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "client":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

/**
 * Get display label for organization type
 */
export function getOrganizationTypeLabel(type: string): string {
  switch (type) {
    case "admin":
      return "Admin";
    case "client":
      return "Client";
    default:
      return "Unknown";
  }
}

/**
 * Check if user is a healthcare professional
 */
export function isHealthcareProfessional(role: string): boolean {
  return role === "technician" || role === "interpreting_doctor";
}

/**
 * Check if user has admin privileges
 */
export function hasAdminPrivileges(role: string): boolean {
  return role === "system_admin" || role === "five_am_admin" || role === "client_admin";
}

/**
 * Check if user can impersonate other users
 */
export function canImpersonate(role: string): boolean {
  return role === "system_admin";
}

/**
 * Get organization access level for user role
 */
export function getOrganizationAccessLevel(role: string): "all" | "assigned" | "own" {
  switch (role) {
    case "system_admin":
    case "five_am_admin":
      return "all";
    case "five_am_agent":
      return "assigned";
    default:
      return "own";
  }
}