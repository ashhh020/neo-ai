"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const rotatingMessages = [
  "Knowledge. Wisdom. Healing.",
  "Learn from the Masters of Homeopathy.",
  "Explore Materia Medica with AI.",
  "Transform Symptoms into Understanding.",
  "Your Homeopathic Knowledge Assistant.",
];

export function Hero() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % rotatingMessages.length);
        setFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
            <span className="text-xs font-medium">Powered by Hahnemann AI · Qwen3</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Now in early access</span>
          </div>

          {/* Main greeting */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-poppins leading-tight mb-4">
            <span className="text-gradient-brand">Hello, True Practitioner</span>
            <br />
            <span>of the Healing Art!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Welcome to <span className="font-semibold text-foreground">NeoHomeo AI</span> — your intelligent companion for Materia Medica, Repertory, Organon, Clinical Learning, and Homeopathic Research.
          </p>

          {/* Rotating message */}
          <div className="h-8 flex items-center justify-center mb-10">
            <p
              className="text-base md:text-lg font-medium transition-opacity duration-400"
              style={{
                opacity: fading ? 0 : 1,
                color: "#4ECDC4",
                transition: "opacity 0.4s ease",
              }}
            >
              {rotatingMessages[msgIndex]}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Button size="lg" asChild className="gradient-brand text-white border-0 h-12 px-8 text-base shadow-lg">
              <Link href="/register">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/login">
                Sign In
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
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Classical homeopathy principles</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "#8A2BE2" }} />
              <span>Gemini AI streaming</span>
            </div>
          </div>
        </div>

        {/* Preview cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            {
              role: "Student",
              color: "#8A2BE2",
              bg: "from-purple-600/10 to-purple-600/5",
              desc: "Materia Medica, flashcards, AI tutor, quiz engine",
              badge: "Learn & Master",
            },
            {
              role: "Practitioner",
              color: "#2A5C8D",
              bg: "from-blue-700/10 to-blue-700/5",
              desc: "AI prescription assist, case management, repertory",
              badge: "Dense & Powerful",
              featured: true,
            },
            {
              role: "Educator",
              color: "#4ECDC4",
              bg: "from-teal-500/10 to-teal-500/5",
              desc: "Teach with AI tools, manage student progress",
              badge: "Inspire & Guide",
            },
            {
              role: "Researcher",
              color: "#F59E0B",
              bg: "from-yellow-500/10 to-yellow-500/5",
              desc: "Research library, journals, AI-assisted analysis",
              badge: "Discover & Publish",
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
              <h3 className="font-semibold font-poppins text-base mb-2">{card.role}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <Button size="sm" variant="ghost" className="mt-4 p-0 h-auto text-xs" asChild>
                <Link href="/register">
                  Explore {card.role} →
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Masters section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-3">Built on the wisdom of the masters</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Hahnemann", "Kent", "Boericke", "Allen", "Clarke", "Hering", "Boger", "Nash"].map((name) => (
              <span
                key={name}
                className="px-3 py-1 rounded-full text-xs border bg-card font-medium"
                style={{ color: "#2A5C8D" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
