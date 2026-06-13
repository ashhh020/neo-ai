import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Everything you need to get started.",
    color: "#4e73df",
    cta: "Start for free",
    href: "/register",
    featured: false,
    features: [
      "Full Materia Medica access (9 authors)",
      "Repertory search (74K+ rubrics)",
      "Hahnemann AI Tutor (50 msgs/day)",
      "Quiz engine (all 161 questions)",
      "SM2 Flashcards",
      "Study notes",
      "5 saved cases",
      "10 saved remedies & rubrics",
    ],
  },
  {
    name: "Pro",
    price: "₹299",
    period: "per month",
    desc: "For serious students and practitioners.",
    color: "#8A2BE2",
    cta: "Coming soon",
    href: "/register",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited AI Tutor messages",
      "AI-generated quiz questions",
      "Unlimited saved cases & remedies",
      "Case export (PDF)",
      "Advanced progress analytics",
      "Priority support",
      "Early access to new features",
    ],
  },
];

export function DHPricing() {
  return (
    <section id="pricing" className="py-24" style={{ background: "rgba(78,115,223,0.02)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.15)" }}>
            Simple pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
            Free while we're in beta.
          </h2>
          <p className="text-base" style={{ color: "var(--text-dim)" }}>
            Full access, no credit card, no catch. Pro features coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((p) => (
            <div key={p.name}
              className="rounded-3xl p-7 relative"
              style={{
                background: p.featured ? `linear-gradient(135deg,${p.color}10,${p.color}06)` : "rgba(255,255,255,0.7)",
                border: p.featured ? `2px solid ${p.color}40` : "1px solid var(--glass-border)",
                backdropFilter: "blur(12px)",
              }}>
              {p.featured && (
                <div className="absolute -top-3 left-6 text-[10px] font-black px-3 py-1 rounded-full text-white"
                  style={{ background: `linear-gradient(135deg,${p.color},#4e73df)` }}>
                  Coming Soon
                </div>
              )}
              <div className="mb-5">
                <div className="text-xs font-bold mb-1" style={{ color: p.color }}>{p.name}</div>
                <div className="text-4xl font-black mb-1" style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-mono)" }}>
                  {p.price}
                  <span className="text-sm font-normal ml-1" style={{ color: "var(--text-dim)" }}>/ {p.period}</span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-dim)" }}>{p.desc}</div>
              </div>

              <ul className="space-y-2.5 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={p.href}
                className="block w-full text-center py-3 rounded-2xl text-sm font-bold transition-all"
                style={p.featured
                  ? { background: `linear-gradient(135deg,${p.color},#4e73df)`, color: "white" }
                  : { background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.2)" }
                }>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
