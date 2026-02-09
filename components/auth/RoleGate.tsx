"use client";

import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { ReactNode } from "react";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGate allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface MemberOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MemberOnly({ children, fallback = null }: MemberOnlyProps) {
  return (
    <RoleGate allowedRoles={["member"]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
