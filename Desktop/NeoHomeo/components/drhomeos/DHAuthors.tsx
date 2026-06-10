const AUTHORS = [
  { name: "Samuel Hahnemann", role: "Founder · Organon of Medicine", initials: "SH", color: "#4e73df" },
  { name: "William Boericke", role: "Materia Medica & Repertory", initials: "WB", color: "#8A2BE2" },
  { name: "James Tyler Kent", role: "Lectures on MM · Repertory", initials: "JK", color: "#16a34a" },
  { name: "John Henry Clarke", role: "Dictionary of MM (3 vols)", initials: "JC", color: "#f59e0b" },
  { name: "Timothy Field Allen", role: "Encyclopedia of MM", initials: "TF", color: "#ef4444" },
  { name: "S.R. Phatak", role: "Concise MM · Repertory", initials: "SP", color: "#06b6d4" },
  { name: "Robin Murphy", role: "Nature's MM · Lotus MM", initials: "RM", color: "#8A2BE2" },
  { name: "J.N. Patil", role: "Homeopathic MM", initials: "JP", color: "#4e73df" },
  { name: "N.M. Choudhuri", role: "Study on MM", initials: "NC", color: "#16a34a" },
  { name: "Cyrus Maxwell Boger", role: "Boenninghausen's Repertory", initials: "CB", color: "#f59e0b" },
];

export function DHAuthors() {
  return (
    <section id="authors" className="py-24" style={{ background: "rgba(78,115,223,0.02)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.15)" }}>
            Built on classical wisdom
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
            The masters, digitised.
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-dim)" }}>
            DrHomeos draws from 10 foundational classical authors — every remedy, every rubric, every aphorism — instantly searchable and AI-explained.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {AUTHORS.map((a) => (
            <div key={a.name}
              className="rounded-3xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm mx-auto mb-3"
                style={{ background: `linear-gradient(135deg,${a.color},${a.color}99)` }}>
                {a.initials}
              </div>
              <div className="text-xs font-bold mb-1" style={{ color: "var(--text-obsidian)" }}>{a.name}</div>
              <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>{a.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
