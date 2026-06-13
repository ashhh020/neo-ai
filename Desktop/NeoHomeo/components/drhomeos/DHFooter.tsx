import Link from "next/link";

export function DHFooter() {
  return (
    <footer className="border-t py-12" style={{ borderColor: "var(--glass-border)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>
                Rх
              </div>
              <span className="font-bold text-lg" style={{ color: "var(--text-obsidian)" }}>
                Dr<span style={{ color: "var(--accent-mineral)" }}>Homeos</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
              AI-powered study platform for BHMS students and homeopathic practitioners.
              Built on the wisdom of classical homeopathy.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-bold mb-3 text-xs uppercase tracking-wider" style={{ color: "var(--text-obsidian)" }}>Platform</div>
              <ul className="space-y-2">
                {[["Materia Medica", "/student/materia-medica"],["Repertory", "/student/repertory"],["Organon Tutor", "/student/ai-tutor"],["Flashcards", "/student/flashcards"],["Quiz", "/student/quiz"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-xs hover:text-[var(--text-obsidian)] transition-colors" style={{ color: "var(--text-dim)" }}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold mb-3 text-xs uppercase tracking-wider" style={{ color: "var(--text-obsidian)" }}>Account</div>
              <ul className="space-y-2">
                {[["Sign Up", "/register"],["Sign In", "/login"],["Dashboard", "/student"],["Settings", "/student/settings"]].map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-xs hover:text-[var(--text-obsidian)] transition-colors" style={{ color: "var(--text-dim)" }}>{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold mb-3 text-xs uppercase tracking-wider" style={{ color: "var(--text-obsidian)" }}>Info</div>
              <ul className="space-y-2">
                {[["About", "/about"],["Privacy Policy", "/privacy"],["Terms", "/terms"]].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-xs hover:text-[var(--text-obsidian)] transition-colors" style={{ color: "var(--text-dim)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            © {new Date().getFullYear()} DrHomeos · Part of the NeoHomeo ecosystem
          </p>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Built on the wisdom of Hahnemann, Kent, Boericke &amp; the classical masters
          </p>
        </div>
      </div>
    </footer>
  );
}
