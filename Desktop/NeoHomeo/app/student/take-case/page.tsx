"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authedFetch } from "@/lib/authed-fetch";
import { toast } from "sonner";
import {
  User, ClipboardList, Brain, Heart, Activity, Moon,
  Thermometer, Plus, Trash2, Save, ArrowLeft, Loader2,
  ChevronDown, ChevronUp, FolderOpen,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Symptom {
  id: string;
  location: string;
  sensation: string;
  modalities: string;
  concomitants: string;
  grade: 1 | 2 | 3;
}

interface CaseForm {
  // Patient
  patientName: string;
  age: string;
  sex: "male" | "female" | "other" | "";
  occupation: string;
  address: string;
  // Chief complaint
  chiefComplaint: string;
  duration: string;
  // History
  historyPresentIllness: string;
  pastHistory: string;
  familyHistory: string;
  // Generals
  thermals: "hot" | "chilly" | "ambithermal" | "";
  desires: string;
  aversions: string;
  thirst: string;
  appetite: string;
  sleep: string;
  dreams: string;
  perspiration: string;
  menstrualHistory: string;
  // Mind
  mind: string;
  fears: string;
  // Physical symptoms
  symptoms: Symptom[];
  // Miasm
  miasm: string;
  // Clinical notes
  clinicalNotes: string;
  // Case file
  caseFileName: string;
}

const EMPTY_FORM: CaseForm = {
  patientName: "", age: "", sex: "", occupation: "", address: "",
  chiefComplaint: "", duration: "",
  historyPresentIllness: "", pastHistory: "", familyHistory: "",
  thermals: "", desires: "", aversions: "", thirst: "", appetite: "",
  sleep: "", dreams: "", perspiration: "", menstrualHistory: "",
  mind: "", fears: "",
  symptoms: [],
  miasm: "",
  clinicalNotes: "",
  caseFileName: "",
};

function newSymptom(): Symptom {
  return { id: crypto.randomUUID(), location: "", sensation: "", modalities: "", concomitants: "", grade: 1 };
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon, title, color, children, defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.6)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4"
        style={{ borderBottom: open ? "1px solid var(--glass-border)" : "none" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
            {icon}
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-dim)" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-dim)" }} />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-xl text-sm outline-none transition-colors";
const inputStyle = {
  background: "rgba(255,255,255,0.8)",
  border: "1px solid var(--glass-border)",
  color: "var(--text-obsidian)",
};

const textareaCls = "w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-colors";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TakeCasePage() {
  const router = useRouter();
  const [form, setForm] = useState<CaseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CaseForm>(key: K, value: CaseForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSymptom() {
    setForm((prev) => ({ ...prev, symptoms: [...prev.symptoms, newSymptom()] }));
  }

  function updateSymptom(id: string, patch: Partial<Symptom>) {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function removeSymptom(id: string) {
    setForm((prev) => ({ ...prev, symptoms: prev.symptoms.filter((s) => s.id !== id) }));
  }

  async function handleSave() {
    if (!form.chiefComplaint.trim()) {
      toast.error("Chief complaint is required");
      return;
    }
    setSaving(true);
    try {
      // 1. Create or get case file
      const fileName = form.caseFileName.trim() || (form.patientName.trim() ? `${form.patientName}'s Cases` : "My Cases");
      const fileRes = await authedFetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "file", name: fileName, description: "" }),
      });
      if (!fileRes.ok) throw new Error("Failed to create case file");
      const { file } = await fileRes.json();

      // 2. Build case description from form
      const descParts: string[] = [];
      if (form.patientName) descParts.push(`Patient: ${form.patientName}`);
      if (form.age) descParts.push(`Age: ${form.age}`);
      if (form.sex) descParts.push(`Sex: ${form.sex}`);
      if (form.occupation) descParts.push(`Occupation: ${form.occupation}`);
      if (form.duration) descParts.push(`Duration: ${form.duration}`);
      if (form.thermals) descParts.push(`Thermals: ${form.thermals}`);
      if (form.miasm) descParts.push(`Miasm: ${form.miasm}`);
      if (form.historyPresentIllness) descParts.push(`HPI: ${form.historyPresentIllness.slice(0, 200)}`);
      if (form.clinicalNotes) descParts.push(`Notes: ${form.clinicalNotes.slice(0, 200)}`);

      // 3. Create case
      const caseName = form.chiefComplaint.slice(0, 80) + (form.patientName ? ` — ${form.patientName}` : "");
      const caseRes = await authedFetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "case", fileId: file.id, name: caseName, description: descParts.join(" | ") }),
      });
      if (!caseRes.ok) throw new Error("Failed to create case");
      const { case: savedCase } = await caseRes.json();

      toast.success("Case saved successfully! Redirecting…");
      setTimeout(() => router.push(`/student/saved-cases`), 1200);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save case");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/student/saved-cases"
            className="p-2 rounded-xl hover:bg-white/50 transition-colors flex-shrink-0"
            style={{ color: "var(--text-dim)" }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold truncate" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
              Take Case
            </h1>
            <p className="text-xs font-mono-neo mt-0.5 hidden sm:block" style={{ color: "var(--text-dim)" }}>
              Classical homeopathic case format
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-60 disabled:scale-100 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="hidden sm:inline">Save Case</span>
          <span className="sm:hidden">Save</span>
        </button>
      </div>

      <div className="space-y-4">

        {/* Case File Name */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(78,115,223,0.06)", border: "1px solid rgba(78,115,223,0.15)" }}>
          <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: "#4e73df" }} />
          <div className="flex-1 min-w-0">
            <label className="text-xs font-semibold block mb-1" style={{ color: "#4e73df" }}>Case File Name</label>
            <input
              type="text"
              value={form.caseFileName}
              onChange={(e) => set("caseFileName", e.target.value)}
              placeholder="e.g. Acute Cases 2024 (leave blank for auto)"
              className={inputCls}
              style={{ ...inputStyle, background: "rgba(255,255,255,0.9)" }}
            />
          </div>
        </div>

        {/* Patient Details */}
        <Section icon={<User className="h-3.5 w-3.5" />} title="Patient Details" color="#4e73df">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Patient Name / Initials">
              <input type="text" value={form.patientName} onChange={(e) => set("patientName", e.target.value)}
                placeholder="A.K. / Anonymous" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Age">
              <input type="text" value={form.age} onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 35 years" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Sex">
              <select value={form.sex} onChange={(e) => set("sex", e.target.value as CaseForm["sex"])}
                className={inputCls} style={inputStyle}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Occupation">
              <input type="text" value={form.occupation} onChange={(e) => set("occupation", e.target.value)}
                placeholder="e.g. Teacher, Farmer" className={inputCls} style={inputStyle} />
            </Field>
          </div>
          <Field label="Address / Region">
            <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
              placeholder="City, State" className={inputCls} style={inputStyle} />
          </Field>
        </Section>

        {/* Chief Complaint */}
        <Section icon={<ClipboardList className="h-3.5 w-3.5" />} title="Chief Complaint *" color="#ef4444">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="Chief Complaint">
                <textarea value={form.chiefComplaint} onChange={(e) => set("chiefComplaint", e.target.value)}
                  placeholder="Main presenting complaint with its characteristics…"
                  rows={3} className={textareaCls} style={inputStyle} />
              </Field>
            </div>
            <Field label="Duration">
              <input type="text" value={form.duration} onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 3 months, since childhood" className={inputCls} style={inputStyle} />
            </Field>
          </div>
        </Section>

        {/* History */}
        <Section icon={<Activity className="h-3.5 w-3.5" />} title="History" color="#f97316" defaultOpen={false}>
          <Field label="History of Present Illness">
            <textarea value={form.historyPresentIllness} onChange={(e) => set("historyPresentIllness", e.target.value)}
              placeholder="Onset, course, aggravating and ameliorating factors, previous treatments…"
              rows={4} className={textareaCls} style={inputStyle} />
          </Field>
          <Field label="Past History (Medical / Surgical)">
            <textarea value={form.pastHistory} onChange={(e) => set("pastHistory", e.target.value)}
              placeholder="Previous illnesses, injuries, operations, vaccinations…"
              rows={3} className={textareaCls} style={inputStyle} />
          </Field>
          <Field label="Family History">
            <textarea value={form.familyHistory} onChange={(e) => set("familyHistory", e.target.value)}
              placeholder="Hereditary diseases in parents/siblings: TB, cancer, diabetes, heart disease…"
              rows={2} className={textareaCls} style={inputStyle} />
          </Field>
        </Section>

        {/* Mind */}
        <Section icon={<Brain className="h-3.5 w-3.5" />} title="Mind & Mental Generals" color="#8A2BE2">
          <Field label="Mental State / Character">
            <textarea value={form.mind} onChange={(e) => set("mind", e.target.value)}
              placeholder="Temperament, emotions, memory, concentration, irritability, weeping, consolation, company…"
              rows={4} className={textareaCls} style={inputStyle} />
          </Field>
          <Field label="Fears / Phobias">
            <input type="text" value={form.fears} onChange={(e) => set("fears", e.target.value)}
              placeholder="e.g. Fear of dark, death, robbers, heights, being alone…" className={inputCls} style={inputStyle} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dreams (Recurring)">
              <input type="text" value={form.dreams} onChange={(e) => set("dreams", e.target.value)}
                placeholder="e.g. falling, dead people, fire…" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Sleep">
              <input type="text" value={form.sleep} onChange={(e) => set("sleep", e.target.value)}
                placeholder="e.g. position, time, sleeplessness, sleepy…" className={inputCls} style={inputStyle} />
            </Field>
          </div>
        </Section>

        {/* Physical Generals */}
        <Section icon={<Thermometer className="h-3.5 w-3.5" />} title="Physical Generals" color="#10b981">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Thermals">
              <select value={form.thermals} onChange={(e) => set("thermals", e.target.value as CaseForm["thermals"])}
                className={inputCls} style={inputStyle}>
                <option value="">Select</option>
                <option value="hot">Hot patient (Warm-blooded)</option>
                <option value="chilly">Chilly patient (Cold-blooded)</option>
                <option value="ambithermal">Ambithermal</option>
              </select>
            </Field>
            <Field label="Thirst">
              <input type="text" value={form.thirst} onChange={(e) => set("thirst", e.target.value)}
                placeholder="quantity, frequency, cold/warm water…" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Appetite">
              <input type="text" value={form.appetite} onChange={(e) => set("appetite", e.target.value)}
                placeholder="increased, decreased, no appetite…" className={inputCls} style={inputStyle} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Desires (strong cravings)">
              <input type="text" value={form.desires} onChange={(e) => set("desires", e.target.value)}
                placeholder="e.g. sweets, salt, spicy, cold food/drinks, meat…" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Aversions (strong dislikes)">
              <input type="text" value={form.aversions} onChange={(e) => set("aversions", e.target.value)}
                placeholder="e.g. fat, milk, eggs, onion…" className={inputCls} style={inputStyle} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Perspiration">
              <input type="text" value={form.perspiration} onChange={(e) => set("perspiration", e.target.value)}
                placeholder="location, time, staining, odour…" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Menstrual History (if applicable)">
              <input type="text" value={form.menstrualHistory} onChange={(e) => set("menstrualHistory", e.target.value)}
                placeholder="cycle, flow, pain, discharge…" className={inputCls} style={inputStyle} />
            </Field>
          </div>
        </Section>

        {/* Particular Symptoms */}
        <Section icon={<Heart className="h-3.5 w-3.5" />} title="Particular Symptoms" color="#ef4444" defaultOpen={false}>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Add each symptom individually. Grade: 1 = slight, 2 = moderate, 3 = intense/peculiar
          </p>
          <div className="space-y-3">
            {form.symptoms.map((s, i) => (
              <div key={s.id} className="rounded-xl p-4 relative" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color: "#ef4444" }}>Symptom {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((g) => (
                        <button
                          key={g}
                          onClick={() => updateSymptom(s.id, { grade: g as 1|2|3 })}
                          className="w-6 h-6 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: s.grade === g ? "#ef4444" : "rgba(255,255,255,0.8)",
                            color: s.grade === g ? "white" : "var(--text-dim)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeSymptom(s.id)} className="p-1 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Location">
                    <input type="text" value={s.location} onChange={(e) => updateSymptom(s.id, { location: e.target.value })}
                      placeholder="e.g. Head, right temple, stomach…" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Sensation / Character">
                    <input type="text" value={s.sensation} onChange={(e) => updateSymptom(s.id, { sensation: e.target.value })}
                      placeholder="e.g. burning, pressing, stitching, throbbing…" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Modalities (Agg / Amel)">
                    <input type="text" value={s.modalities} onChange={(e) => updateSymptom(s.id, { modalities: e.target.value })}
                      placeholder="e.g. Agg: cold, night / Amel: heat, pressure…" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Concomitants">
                    <input type="text" value={s.concomitants} onChange={(e) => updateSymptom(s.id, { concomitants: e.target.value })}
                      placeholder="Accompanying symptoms at same time…" className={inputCls} style={inputStyle} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addSymptom}
            className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01]"
            style={{ background: "rgba(239,68,68,0.07)", color: "#ef4444", border: "1px dashed rgba(239,68,68,0.3)" }}
          >
            <Plus className="h-4 w-4" /> Add Symptom
          </button>
        </Section>

        {/* Miasm + Notes */}
        <Section icon={<Moon className="h-3.5 w-3.5" />} title="Miasm & Clinical Notes" color="#0891b2" defaultOpen={false}>
          <Field label="Probable Miasm">
            <select value={form.miasm} onChange={(e) => set("miasm", e.target.value)}
              className={inputCls} style={inputStyle}>
              <option value="">Select</option>
              <option value="Psora">Psora (functional)</option>
              <option value="Sycosis">Sycosis (excess / over-production)</option>
              <option value="Syphilis">Syphilis (destructive)</option>
              <option value="Tuberculosis">Tuberculosis (mixed)</option>
              <option value="Cancer">Cancer miasm</option>
              <option value="Mixed">Mixed miasm</option>
            </select>
          </Field>
          <Field label="Clinical Notes / Observations">
            <textarea value={form.clinicalNotes} onChange={(e) => set("clinicalNotes", e.target.value)}
              placeholder="Totality summary, prescribing notes, remedy hints, follow-up plan…"
              rows={5} className={textareaCls} style={inputStyle} />
          </Field>
        </Section>

        {/* Save button (bottom) */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-60 disabled:scale-100"
            style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Case
          </button>
        </div>
      </div>
    </div>
  );
}
