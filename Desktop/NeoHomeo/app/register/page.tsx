"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Stethoscope, GraduationCap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/authStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const roles: Array<{
  value: UserRole;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  perks: string[];
}> = [
  {
    value: "patient",
    label: "Patient",
    icon: User,
    color: "#4ECDC4",
    description: "Access healthcare from expert homeopaths",
    perks: ["Book appointments online", "AI pre-assessment", "Track your remedies"],
  },
  {
    value: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    color: "#2A5C8D",
    description: "Manage your practice with Clinic OS",
    perks: ["AI prescription assistant", "Patient management", "Revenue analytics"],
  },
  {
    value: "student",
    label: "Student",
    icon: GraduationCap,
    color: "#8A2BE2",
    description: "Master homeopathy with AI-powered learning",
    perks: ["50+ remedy Materia Medica", "Spaced repetition cards", "AI Socratic tutor"],
  },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const { login } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 500));
    login(data.email, data.password, selectedRole);
    toast.success("Account created! Welcome to NeoHomeo.");
    router.push(`/${selectedRole}`);
  }

  const selectedRoleData = roles.find((r) => r.value === selectedRole)!;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white font-bold font-poppins">
              N
            </div>
            <span className="font-semibold font-poppins">NeoHomeo</span>
          </Link>
          <h1 className="text-2xl font-bold font-poppins mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join 38,000+ users on NeoHomeo</p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                "flex flex-col items-start p-4 rounded-2xl border text-left transition-all",
                selectedRole === role.value ? "border-2 bg-card shadow-sm" : "bg-card hover:border-muted-foreground/30"
              )}
              style={selectedRole === role.value ? { borderColor: role.color } : {}}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: role.color + "20" }}
              >
                <role.icon className="h-4 w-4" style={{ color: role.color }} strokeWidth={1.75} />
              </div>
              <div className="font-semibold text-sm mb-0.5">{role.label}</div>
              <div className="text-xs text-muted-foreground leading-snug">{role.description}</div>
            </button>
          ))}
        </div>

        {/* Perks */}
        <div className="bg-card border rounded-xl p-3 mb-6 flex flex-wrap gap-3">
          {selectedRoleData.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-500" />
              {perk}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-card border rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" {...register("name")} className="mt-1" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className="mt-1" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min. 6 characters" {...register("password")} className="mt-1" />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-brand text-white border-0 h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : (
                <>
                  Create {selectedRoleData.label} Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
