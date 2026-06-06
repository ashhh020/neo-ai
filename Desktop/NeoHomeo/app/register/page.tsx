"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "student" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) { setError(err.message); setLoading(false); return; }

    if (data.user) {
      router.push("/student");
      router.refresh();
    } else {
      setError("Check your email to confirm your account, then sign in.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--silica-bg)" }}>
      <div style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)", top: "5%", right: "10%", position: "fixed", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)", bottom: "10%", left: "10%", position: "fixed", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

      <div className="shard w-full max-w-md p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl gradient-mineral flex items-center justify-center text-white font-black text-lg">N</div>
          <div>
            <p className="font-extrabold text-sm" style={{ color: "var(--text-obsidian)" }}>NeoHomeo AI</p>
            <p className="text-[10px] font-mono-neo uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Create Account</p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Join NeoHomeo</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>Your AI-powered homeopathy learning platform</p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl text-sm font-medium" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-2xl font-semibold text-sm mb-4 transition-all hover:shadow-md disabled:opacity-60"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="stat-label block mb-1.5">Full Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Your name"
              className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
            />
          </div>
          <div>
            <label className="stat-label block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@example.com"
              className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
            />
          </div>
          <div>
            <label className="stat-label block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                minLength={6} placeholder="••••••••"
                className="w-full h-11 rounded-2xl px-4 pr-12 text-sm font-medium outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-2xl text-white font-bold text-sm gradient-mineral hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-dim)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent-mineral)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
