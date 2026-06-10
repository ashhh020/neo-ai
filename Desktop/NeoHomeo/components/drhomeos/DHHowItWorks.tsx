const STEPS = [
  {
    step: "01",
    title: "Create your free account",
    desc: "Sign up in 30 seconds. No credit card. No role selection — you land straight on your student dashboard.",
    color: "#4e73df",
  },
  {
    step: "02",
    title: "Choose what to study",
    desc: "Start with the Remedy of the Day, jump into Repertory search, ask Hahnemann AI a question, or drill flashcards. Your dashboard shows exactly what's due.",
    color: "#8A2BE2",
  },
  {
    step: "03",
    title: "Track your mastery",
    desc: "Every quiz, every flashcard session, every AI conversation earns XP and updates your subject mastery. Watch your scores grow week by week.",
    color: "#16a34a",
  },
];

export function DHHowItWorks() {
  return (
    <section id="tools" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.15)" }}>
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
            From signup to mastery<br />in three steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative rounded-3xl p-7"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 w-6 h-0.5 z-10"
                  style={{ background: "linear-gradient(90deg,var(--glass-border),transparent)" }} />
              )}
              <div className="text-5xl font-black mb-4 font-mono"
                style={{ color: s.color, opacity: 0.15, fontFamily: "var(--font-mono)" }}>
                {s.step}
              </div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "var(--text-obsidian)" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{s.desc}</p>
              <div className="mt-5 w-8 h-1 rounded-full" style={{ background: s.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
