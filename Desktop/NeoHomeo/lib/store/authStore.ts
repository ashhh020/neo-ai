import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  init: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    // Try to load profile from DB
    const { data: profile } = await supabase
      .from("profiles" as never)
      .select("name, role, avatar_url")
      .eq("id", user.id)
      .single() as { data: { name: string; role: string; avatar_url: string | null } | null };

    const name =
      profile?.name ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User";

    set({
      user: {
        id: user.id,
        email: user.email ?? "",
        name,
        role: profile?.role ?? user.user_metadata?.role ?? "student",
        avatar: profile?.avatar_url ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      },
      isAuthenticated: true,
      loading: false,
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        set({ user: null, isAuthenticated: false, loading: false });
      } else if (event === "SIGNED_IN" && session.user) {
        // Re-init on sign in
        get().init();
      }
    });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
