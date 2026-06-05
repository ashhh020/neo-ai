"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { UserRole } from "@/types";
import { toast } from "sonner";

const roleRedirects: Record<string, string> = {
  student: "/student",
  doctor: "/doctor",
  patient: "/patient",
  admin: "/admin",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    // Mock auth — reads role from stored user or defaults to student
    const role = (typeof window !== "undefined"
      ? localStorage.getItem("neo_signup_role") || "student"
      : "student") as UserRole;
    login(email, password, role);
    toast.success("Welcome back!");
    router.push(roleRedirects[role] || "/student");
    setLoading(false);
  }

  function handleGoogle() {
    toast.info("Google login coming soon — add NEXT_PUBLIC_SUPABASE keys to enable.");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(78,115,223,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,126,179,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div className="shard shard-reveal w-full max-w-md p-10 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-2xl gradient-mineral flex items-center justify-center text-white font-bold text-lg">N</div>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>NeoHomeo AI</div>
            <div className="font-mono-neo text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Student Platform</div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-1" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.04em" }}>
          Welcome back
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-dim)" }}>
          Sign in to continue to your dashboard
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border font-medium text-sm mb-4 transition-all hover:shadow-md"
          style={{ background: "rgba(255,255,255,0.6)", borderColor: "var(--glass-border)", color: "var(--text-obsidian)" }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs font-mono-neo uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="stat-label block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-12 rounded-2xl px-4 text-sm font-medium outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-obsidian)",
              }}
            />
          </div>

          <div>
            <label className="stat-label block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 rounded-2xl px-4 pr-12 text-sm font-medium outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-obsidian)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-white font-bold text-sm gradient-mineral transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-dim)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold" style={{ color: "var(--accent-mineral)" }}>
            Create one
          </Link>
        </p>

        {/* Demo hint */}
        <div className="mt-5 rounded-2xl p-3 text-center text-xs font-mono-neo" style={{ background: "rgba(78,115,223,0.08)", color: "var(--text-dim)" }}>
          <Sparkles className="inline h-3 w-3 mr-1" />
          Demo: any email + any password · role set at signup
        </div>
      </div>
    </div>
  );
}
