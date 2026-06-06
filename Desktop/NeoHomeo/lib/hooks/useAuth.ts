"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth(_role?: string) {
  const { user, isAuthenticated, loading, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
    // All roles redirect to /student (other dashboards hidden)
  }, [loading, isAuthenticated]);

  return { user, isAuthenticated, loading };
}

export function useAuth() {
  const store = useAuthStore();
  useEffect(() => { store.init(); }, []);
  return store;
}
