"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types";

export function useAuth(requiredRole?: UserRole) {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (requiredRole && (!isAuthenticated || user?.role !== requiredRole)) {
      router.push("/login");
    }
  }, [isAuthenticated, user, requiredRole, router]);

  return { user, isAuthenticated, login, logout };
}

export function useRequireAuth(role?: UserRole) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role && user?.role !== role) {
      router.push(`/${user?.role}`);
    }
  }, [isAuthenticated, user, role, router]);

  return { user, isAuthenticated };
}
