"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Stethoscope, GraduationCap, Shield, Eye, EyeOff } from "lucide-react";
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
  { value: "patient", label: "Patient", icon: User, color: "#4ECDC4" },
  { value: "doctor", label: "Doctor", icon: Stethoscope, color: "#2A5C8D" },
  { value: "student", label: "Student", icon: GraduationCap, color: "#8A2BE2" },
  { value: "admin", label: "Admin", icon: Shield, color: "#F59E0B" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 400));
    login(data.email, data.password, selectedRole);
    toast.success(`Welcome back! Redirecting to ${selectedRole} dashboard.`);
    router.push(`/${selectedRole}`);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-brand text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold font-poppins">
            N
          </div>
          <span className="font-semibold font-poppins">NeoHomeo</span>
        </div>
        <div>
          <blockquote className="text-lg font-medium leading-relaxed mb-3">
            &ldquo;NeoHomeo transformed how I manage my clinic. The AI suggestions save me 30 minutes per case.&rdquo;
          </blockquote>
          <cite className="text-sm text-white/70">— Dr. Rajan Krishnamurthy, Homeopathic Physician, Chennai</cite>
        </div>
        <div className="flex gap-4 text-sm text-white/80">
          <span>500M+ users served globally</span>
          <span>·</span>
          <span>HIPAA-compliant</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-poppins mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your NeoHomeo account</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
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
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full gradient-brand text-white border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4 bg-muted/50 rounded-lg p-2">
            Demo: Any email + any password works. Just pick your role above.
          </p>
        </div>
      </div>
    </div>
  );
}
