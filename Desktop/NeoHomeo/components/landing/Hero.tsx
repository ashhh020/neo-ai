"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#8A2BE2" }} />
            <span className="text-xs font-medium">Powered by Dr. Neo AI · Gemini</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Now in early access</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-poppins leading-tight mb-6">
            <span className="text-gradient-brand">Patient-Centric.</span>
            <br />
            <span>Root-Cause Focused.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            NeoHomeo unifies patients, doctors, and students on one intelligent platform.
            Dr. Neo AI conducts classical case-taking, assists prescribers, and tutors the next generation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Button size="lg" asChild className="gradient-brand text-white border-0 h-12 px-8 text-base shadow-lg">
              <Link href="/register">
                Start as a Patient
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/register">
                I&apos;m a Doctor
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>HIPAA-compliant ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Classical homeopathy principles</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "#8A2BE2" }} />
              <span>Gemini AI streaming</span>
            </div>
          </div>
        </div>

        {/* Preview cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            {
              role: "Patient",
              color: "#4ECDC4",
              bg: "from-teal-500/10 to-teal-500/5",
              desc: "AI case-taking, remedy tracking, doctor discovery",
              badge: "Calm & Simple",
            },
            {
              role: "Doctor",
              color: "#2A5C8D",
              bg: "from-blue-700/10 to-blue-700/5",
              desc: "Clinic OS, AI prescription assist, patient management",
              badge: "Dense & Powerful",
              featured: true,
            },
            {
              role: "Student",
              color: "#8A2BE2",
              bg: "from-purple-600/10 to-purple-600/5",
              desc: "Materia Medica, flashcards, AI tutor, quiz engine",
              badge: "Learn & Master",
            },
          ].map((card) => (
            <div
              key={card.role}
              className={`relative rounded-2xl border bg-gradient-to-br ${card.bg} p-6 text-left card-hover ${card.featured ? "ring-2 ring-primary/30" : ""}`}
            >
              {card.featured && (
                <Badge className="absolute -top-3 left-4 text-xs" style={{ backgroundColor: "#2A5C8D" }}>
                  Most Popular
                </Badge>
              )}
              <div className="text-xs font-medium mb-1" style={{ color: card.color }}>
                {card.badge}
              </div>
              <h3 className="font-semibold font-poppins text-lg mb-2">{card.role}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <Button size="sm" variant="ghost" className="mt-4 p-0 h-auto text-xs" asChild>
                <Link href="/register">
                  Explore {card.role} →
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
