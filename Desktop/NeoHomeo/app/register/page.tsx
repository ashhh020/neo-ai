"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Stethoscope, BookOpen, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roles = [
  {
    value: "student" as UserRole,
    label: "Student",
    subtitle: "BHMS / MD Scholar",
    icon: GraduationCap,
    color: "#8A2BE2",
    blob: "rgba(138,43,226,0.15)",
    fields: ["college", "university", "year"],
  },
  {
    value: "doctor" as UserRole,
    label: "Practitioner",
    subtitle: "Licensed Homeopath",
    icon: Stethoscope,
    color: "#2A5C8D",
    blob: "rgba(42,92,141,0.15)",
    fields: ["qualification", "experience", "specialty"],
  },
  {
    value: "patient" as UserRole,
    label: "Educator",
    subtitle: "Teacher / Institute",
    icon: BookOpen,
    color: "#4ECDC4",
    blob: "rgba(78,205,196,0.15)",
    fields: ["institution", "department"],
  },
  {
    value: "admin" as UserRole,
    label: "Admin",
    subtitle: "Platform Admin",
    icon: Shield,
    color: "#F59E0B",
    blob: "rgba(245,158,11,0.15)",
    fields: ["adminCode"],
  },
];

const roleRedirects: Record<string, string> = {
  student: "/student", doctor: "/doctor", patient: "/patient", admin: "/admin",
};

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const activeRole = roles.find((r) => r.value === selectedRole)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("Fill in all required fields"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // Save role for login redirect
    localStorage.setItem("neo_signup_role", selectedRole);
    login(email, password, selectedRole);
    toast.success(`Welcome to NeoHomeo, ${name.split(" ")[0]}!`);
    router.push(roleRedirects[selectedRole] || "/student");
    setLoading(false);
  }

  function handleGoogle() {
    toast.info("Google signup coming soon — add Supabase keys to enable.");
  }

  const roleFields: Record<string, { label: string; placeholder: string }[]> = {
    student: [
      { label: "College / Institute", placeholder: "e.g. Govt. Homoeopathic Medical College" },
      { label: "University", placeholder: "e.g. Rajiv Gandhi University of Health Sciences" },
      { label: "Year of Study", placeholder: "e.g. 2nd Year BHMS" },
    ],
    doctor: [
      { label: "Qualification", placeholder: "e.g. BHMS, MD (Hom)" },
      { label: "Years of Experience", placeholder: "e.g. 5 years" },
      { label: "Specialty", placeholder: "e.g. Paediatrics, Chronic Diseases" },
    ],
    patient: [
      { label: "Institution", placeholder: "e.g. NMH College of Homoeopathy" },
      { label: "Department", placeholder: "e.g. Materia Medica" },
    ],
    admin: [
      { label: "Admin Access Code", placeholder: "Enter admin code" },
    ],
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${activeRole.blob} 0%, transparent 70%)`, filter: "blur(60px)", transition: "background 0.5s ease" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <div className="shard shard-reveal w-full max-w-lg p-10 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-2xl gradient-mineral flex items-center justify-center text-white font-bold text-lg">N</div>
          <div>
            <div className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>NeoHomeo AI</div>
            <div className="font-mono-neo text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Create Account</div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-1" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.04em" }}>
          Join NeoHomeo
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          Choose your role — you can&apos;t change it after signup
        </p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                "flex flex-col items-start gap-1 p-4 rounded-2xl border text-left transition-all",
                selectedRole === role.value ? "border-2" : "border hover:bg-white/30"
              )}
              style={{
                background: selectedRole === role.value ? `${role.blob}` : "rgba(255,255,255,0.4)",
                borderColor: selectedRole === role.value ? role.color : "var(--glass-border)",
              }}
            >
              <role.icon className="h-5 w-5 mb-1" style={{ color: role.color }} strokeWidth={1.75} />
              <span className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{role.label}</span>
              <span className="font-mono-neo text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>{role.subtitle}</span>
            </button>
          ))}
        </div>

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

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs font-mono-neo uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Base fields */}
          {[
            { label: "Full Name", value: name, set: setName, type: "text", placeholder: "Your full name" },
            { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="stat-label block mb-1.5">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
              />
            </div>
          ))}

          <div>
            <label className="stat-label block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 rounded-2xl px-4 pr-12 text-sm font-medium outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Role-specific fields */}
          {(roleFields[selectedRole] || []).map((field, i) => (
            <div key={i}>
              <label className="stat-label block mb-1.5">{field.label}</label>
              <input
                type="text"
                value={extra[field.label] || ""}
                onChange={(e) => setExtra({ ...extra, [field.label]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full h-11 rounded-2xl px-4 text-sm font-medium outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-white font-bold text-sm gradient-mineral flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-dim)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-bold" style={{ color: "var(--accent-mineral)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
