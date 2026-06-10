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
    // Use getSession() (reads the persisted session, no mandatory network
    // round-trip) so a transient network failure does NOT log the user out
    // or bounce them back to /login — important over tunnels / mobile.
    let user: { id: string; email?: string; user_metadata?: { name?: string; full_name?: string; role?: string } } | null = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user ?? null;
    } catch {
      user = null;
    }

    if (!user) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    // Try to load profile from DB (never let this block auth)
    type ProfileRow = { name: string; role: string; avatar_url: string | null };
    let profile: ProfileRow | null = null;
    try {
      const res = await supabase
        .from("profiles" as never)
        .select("name, role, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      profile = (res.data as unknown as ProfileRow | null) ?? null;
    } catch {
      profile = null;
    }

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
