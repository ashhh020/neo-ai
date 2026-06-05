"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { User, Lock, Bell, Palette, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [notifications, setNotifications] = useState({ daily: true, streakReminder: true, newContent: false });

  function handleSave() {
    updateUser({ name });
    toast.success("Profile updated!");
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const sections = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "password", icon: Lock, label: "Password" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "appearance", icon: Palette, label: "Appearance" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Settings</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="shard p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,115,223,0.1)" }}>
            <User className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
          </div>
          <h2 className="font-bold" style={{ color: "var(--text-obsidian)" }}>Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-mineral flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>{name || "Student"}</p>
            <p className="text-sm font-mono-neo" style={{ color: "var(--text-dim)" }}>{email}</p>
            <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold mt-1 inline-block"
              style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>Student</span>
          </div>
        </div>

        <div>
          <label className="stat-label block mb-1.5">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
        </div>
        <div>
          <label className="stat-label block mb-1.5">Email</label>
          <input value={email} disabled
            className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none opacity-50"
            style={{ background: "rgba(255,255,255,0.4)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm gradient-mineral hover:opacity-90">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div className="shard p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,205,196,0.1)" }}>
            <Bell className="h-4 w-4" style={{ color: "#4ECDC4" }} />
          </div>
          <h2 className="font-bold" style={{ color: "var(--text-obsidian)" }}>Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "daily" as const, label: "Daily study reminder", sub: "Get reminded at 8 AM every day" },
            { key: "streakReminder" as const, label: "Streak reminder", sub: "Alert before your streak resets" },
            { key: "newContent" as const, label: "New content updates", sub: "When new remedies or aphorisms are added" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-obsidian)" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>{item.sub}</p>
              </div>
              <button onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                className="w-11 h-6 rounded-full transition-all flex items-center px-0.5"
                style={{ background: notifications[item.key] ? "var(--accent-mineral)" : "rgba(0,0,0,0.1)" }}>
                <div className="w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: notifications[item.key] ? "translateX(20px)" : "translateX(0)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="shard p-5">
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out of NeoHomeo
        </button>
        <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>You will be redirected to the login page</p>
      </div>
    </div>
  );
}
