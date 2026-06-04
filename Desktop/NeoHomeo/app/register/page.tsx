"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Stethoscope, BookOpen, FlaskConical, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/authStore";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().optional(),
  // Student fields
  college: z.string().optional(),
  university: z.string().optional(),
  yearOfStudy: z.string().optional(),
  // Practitioner fields
  qualification: z.string().optional(),
  yearsExperience: z.string().optional(),
  specialty: z.string().optional(),
  // Educator/Researcher fields
  institution: z.string().optional(),
  department: z.string().optional(),
  researchArea: z.string().optional(),
  experience: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

type UserType = "student" | "practitioner" | "educator" | "researcher";

const userTypes: Array<{
  value: UserType;
  role: UserRole;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  perks: string[];
}> = [
  {
    value: "student",
    role: "student",
    label: "Student",
    icon: GraduationCap,
    color: "#8A2BE2",
    description: "Master homeopathy with AI-powered learning",
    perks: ["Materia Medica library", "Spaced repetition cards", "AI Organon tutor", "Quiz engine"],
  },
  {
    value: "practitioner",
    role: "doctor",
    label: "Practitioner",
    icon: Stethoscope,
    color: "#2A5C8D",
    description: "Manage cases with AI-assisted clinical tools",
    perks: ["Case workspace", "Repertorization tool", "AI prescription assist", "Clinical references"],
  },
  {
    value: "educator",
    role: "patient",
    label: "Educator",
    icon: BookOpen,
    color: "#4ECDC4",
    description: "Teach homeopathy with intelligent tools",
    perks: ["Curriculum tools", "Student progress tracking", "AI-generated quizzes", "Content library"],
  },
  {
    value: "researcher",
    role: "admin",
    label: "Researcher",
    icon: FlaskConical,
    color: "#F59E0B",
    description: "Explore journals and AI-assisted research",
    perks: ["Research library", "Journal access", "AI analysis tools", "Citation manager"],
  },
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

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Intern"];

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<UserType>("student");
  const { login } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
  });

  const selectedData = userTypes.find((t) => t.value === selectedType)!;

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 500));
    login(data.email, data.password, selectedData.role);
    toast.success("Account created! Welcome to NeoHomeo AI.");
    router.push(`/${selectedData.role}`);
  }

  function handleSocialLogin(provider: string) {
    toast.info(`${provider} login coming soon.`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white font-bold font-poppins">N</div>
            <span className="font-semibold font-poppins">NeoHomeo AI</span>
          </Link>
          <h1 className="text-2xl font-bold font-poppins mb-1">Join the Healing Community</h1>
          <p className="text-sm text-muted-foreground">Create your account and start your homeopathic journey</p>
        </div>

        {/* Social login */}
        <div className="bg-card border rounded-2xl p-4 mb-4">
          <p className="text-xs text-muted-foreground text-center mb-3">Sign up with</p>
          <div className="grid grid-cols-4 gap-2">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSocialLogin(provider.name)}
                className="flex items-center justify-center gap-2 h-10 rounded-xl border bg-muted/30 hover:bg-muted transition-colors text-sm font-medium"
                title={provider.name}
              >
                {provider.icon}
                <span className="text-xs hidden sm:inline">{provider.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-muted/20 px-2 text-xs text-muted-foreground">or register with email</span>
          </div>
        </div>

        {/* User type selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {userTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={cn(
                "flex flex-col items-start p-3 rounded-2xl border text-left transition-all",
                selectedType === type.value ? "border-2 bg-card shadow-sm" : "bg-card hover:border-muted-foreground/30"
              )}
              style={selectedType === type.value ? { borderColor: type.color } : {}}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: type.color + "20" }}>
                <type.icon className="h-3.5 w-3.5" style={{ color: type.color }} strokeWidth={1.75} />
              </div>
              <div className="font-semibold text-xs mb-0.5">{type.label}</div>
              <div className="text-[10px] text-muted-foreground leading-snug hidden sm:block">{type.description}</div>
            </button>
          ))}
        </div>

        {/* Perks */}
        <div className="bg-card border rounded-xl p-3 mb-4 flex flex-wrap gap-3">
          {selectedData.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-500" />
              {perk}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-card border rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Base fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" {...register("name")} className="mt-1" />
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

            {/* Student-specific fields */}
            {selectedType === "student" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Student Details</p>
                </div>
                <div>
                  <Label htmlFor="college">College Name</Label>
                  <Input id="college" placeholder="e.g. NHMC Mumbai" {...register("college")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input id="university" placeholder="e.g. Mumbai University" {...register("university")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <select
                    id="yearOfStudy"
                    {...register("yearOfStudy")}
                    className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select year</option>
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. India" {...register("country")} className="mt-1" />
                </div>
              </div>
            )}

            {/* Practitioner-specific fields */}
            {selectedType === "practitioner" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Practitioner Details</p>
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" placeholder="e.g. BHMS, MD (Hom)" {...register("qualification")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input id="yearsExperience" type="number" placeholder="e.g. 5" {...register("yearsExperience")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" placeholder="e.g. Classical, Pediatrics" {...register("specialty")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. India" {...register("country")} className="mt-1" />
                </div>
              </div>
            )}

            {/* Educator-specific fields */}
            {selectedType === "educator" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Educator Details</p>
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" placeholder="e.g. NHMC Mumbai" {...register("institution")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="e.g. Materia Medica" {...register("department")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" placeholder="e.g. 10" {...register("experience")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. India" {...register("country")} className="mt-1" />
                </div>
              </div>
            )}

            {/* Researcher-specific fields */}
            {selectedType === "researcher" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Researcher Details</p>
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" placeholder="e.g. CCRH New Delhi" {...register("institution")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="researchArea">Research Area</Label>
                  <Input id="researchArea" placeholder="e.g. Clinical Trials" {...register("researchArea")} className="mt-1" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full gradient-brand text-white border-0 h-11" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : (
                <>
                  Create {selectedData.label} Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
