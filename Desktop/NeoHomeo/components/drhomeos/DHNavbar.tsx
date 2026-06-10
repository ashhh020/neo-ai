"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function DHNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(78,115,223,0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}
          >
            Rх
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-obsidian)" }}>
            Dr<span style={{ color: "var(--accent-mineral)" }}>Homeos</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--text-dim)" }}>
          <a href="#features" className="hover:text-[var(--text-obsidian)] transition-colors">Features</a>
          <a href="#tools" className="hover:text-[var(--text-obsidian)] transition-colors">Tools</a>
          <a href="#pricing" className="hover:text-[var(--text-obsidian)] transition-colors">Pricing</a>
          <a href="#authors" className="hover:text-[var(--text-obsidian)] transition-colors">Authors</a>
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ color: "var(--text-obsidian)" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold px-5 py-2.5 rounded-xl text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}
          >
            Get started free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 pt-2 space-y-3 text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.97)", borderTop: "1px solid var(--glass-border)" }}
        >
          {["#features", "#tools", "#pricing", "#authors"].map((href) => (
            <a
              key={href}
              href={href}
              className="block py-2"
              style={{ color: "var(--text-dim)" }}
              onClick={() => setOpen(false)}
            >
              {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
            </a>
          ))}
          <Link href="/register" className="block w-full text-center py-3 rounded-xl text-white font-bold" style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>
            Get started free
          </Link>
        </div>
      )}
    </nav>
  );
}
