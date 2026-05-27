import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const MOCK_USERS: Record<UserRole, User> = {
  patient: {
    id: "u-p-001",
    email: "priya@example.com",
    name: "Priya Sharma",
    role: "patient",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=priya",
    createdAt: "2025-11-01",
  },
  doctor: {
    id: "u-dr-001",
    email: "rajan@example.com",
    name: "Dr. Rajan Krishnamurthy",
    role: "doctor",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=rajan",
    createdAt: "2024-03-15",
  },
  student: {
    id: "u-st-001",
    email: "student@example.com",
    name: "Ashraf Shaikh",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=ashraf",
    createdAt: "2025-06-01",
  },
  admin: {
    id: "u-admin-001",
    email: "admin@neohomeo.com",
    name: "Platform Admin",
    role: "admin",
    createdAt: "2024-01-01",
  },
  pharmacy: {
    id: "u-ph-001",
    email: "pharmacy@example.com",
    name: "MediHom Pharmacy",
    role: "pharmacy",
    createdAt: "2024-06-01",
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, _password: string, role: UserRole) => {
        const user = { ...MOCK_USERS[role], email };
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: "neohomeo-auth",
    }
  )
);
