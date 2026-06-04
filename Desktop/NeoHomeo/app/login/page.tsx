"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stethoscope, GraduationCap, BookOpen, FlaskConical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/authStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const roles: Array<{ value: UserRole; label: string; icon: React.ElementType; color: string }> = [
  { value: "student", label: "Student", icon: GraduationCap, color: "#8A2BE2" },
  { value: "doctor", label: "Practitioner", icon: Stethoscope, color: "#2A5C8D" },
  { value: "patient", label: "Educator", icon: BookOpen, color: "#4ECDC4" },
  { value: "admin", label: "Researcher", icon: FlaskConical, color: "#F59E0B" },
];

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    name: "Apple",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
  {
    name: "Microsoft",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#00A4EF" d="M13 1h10v10H13z"/>
        <path fill="#7FBA00" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>
    ),
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 400));
    login(data.email, data.password, selectedRole);
    toast.success(`Welcome back! Redirecting to your dashboard.`);
    router.push(`/${selectedRole}`);
  }

  function handleSocialLogin(provider: string) {
    toast.info(`${provider} login coming soon.`);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-brand text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold font-poppins">
            N
          </div>
          <span className="font-semibold font-poppins">NeoHomeo AI</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2 leading-snug">
              Hello, True Practitioner<br />of the Healing Art!
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              The wisdom of Hahnemann, Kent, Boericke, Allen, Clarke, Hering, Boger, and many other masters is now searchable through one intelligent platform.
            </p>
          </div>

          <div className="space-y-3">
            {["Materia Medica Expert", "Repertory Assistant", "Organon Expert", "Clinical Assistant"].map((mode) => (
              <div key={mode} className="flex items-center gap-2.5 text-sm text-white/90">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {mode}
              </div>
            ))}
          </div>
        </div>

        <blockquote className="text-sm text-white/70 italic">
          &ldquo;Similia similibus curentur — Let likes be cured by likes.&rdquo;
          <cite className="block not-italic mt-1 text-white/50">— Samuel Hahnemann</cite>
        </blockquote>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="mb-6">
            <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm font-poppins">N</div>
              <span className="font-semibold font-poppins text-sm">NeoHomeo AI</span>
            </Link>
            <h1 className="text-2xl font-bold font-poppins mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your NeoHomeo AI account</p>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSocialLogin(provider.name)}
                title={`Sign in with ${provider.name}`}
                className="flex items-center justify-center h-10 rounded-xl border bg-card hover:bg-muted transition-colors"
              >
                {provider.icon}
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">or sign in with email</span>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <Label className="text-xs text-muted-foreground mb-2 block">Sign in as</Label>
            <div className="grid grid-cols-4 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    selectedRole === role.value
                      ? "border-2 bg-muted"
                      : "hover:bg-muted/50"
                  )}
                  style={selectedRole === role.value ? { borderColor: role.color } : {}}
                >
                  <role.icon className="h-4 w-4" style={{ color: selectedRole === role.value ? role.color : undefined }} strokeWidth={1.75} />
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className="mt-1" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full gradient-brand text-white border-0" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4 bg-muted/50 rounded-lg p-2">
            Demo: Any email + any password works. Pick your role above.
          </p>
        </div>
      </div>
    </div>
  );
}
