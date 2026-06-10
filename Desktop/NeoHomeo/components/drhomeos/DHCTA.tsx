import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DHCTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="rounded-3xl p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(78,115,223,0.1),rgba(138,43,226,0.08))", border: "1px solid rgba(78,115,223,0.2)" }}>
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-0"
            style={{ background: "radial-gradient(circle,rgba(138,43,226,0.15),transparent)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl -z-0"
            style={{ background: "radial-gradient(circle,rgba(78,115,223,0.12),transparent)" }} />

          <div className="relative z-10">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight"
              style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
              Ready to master<br />homeopathy with AI?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--text-dim)" }}>
              Join BHMS students and practitioners who are studying smarter with DrHomeos.
              Free forever. No credit card.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register"
                className="flex items-center justify-center gap-2 h-12 px-8 rounded-2xl text-white font-bold text-sm shadow-xl transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="flex items-center justify-center h-12 px-8 rounded-2xl font-bold text-sm border transition-colors"
                style={{ color: "var(--text-obsidian)", borderColor: "rgba(78,115,223,0.3)", background: "rgba(255,255,255,0.6)" }}>
                Already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
