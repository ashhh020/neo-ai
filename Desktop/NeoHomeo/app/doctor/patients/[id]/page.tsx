"use client";

import { use } from "react";
import { patients, patientCases } from "@/lib/data/patients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIBadge } from "@/components/shared/AIBadge";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { CheckCircle, Edit3, XCircle, FileText, Calendar, ChevronLeft } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const aiSuggestions = [
  {
    rank: 1,
    remedyName: "Natrum Muriaticum",
    confidence: 88,
    potency: "200C",
    rubrics: ["MIND > Grief > ailments from", "GENERALS > Salt > desire", "SKIN > Eruptions > herpetic"],
    rationale: "Constitutional remedy with grief never recovered from. Salt craving, introversion, and herpetic tendencies strongly suggest Natrum Mur as the simillimum.",
    materiaMedicaRef: "Kent's Lectures p. 234",
  },
  {
    rank: 2,
    remedyName: "Ignatia",
    confidence: 71,
    potency: "200C",
    rubrics: ["MIND > Grief > acute", "MIND > Consolation > aggravates", "GENERALS > Sighing"],
    rationale: "Acute grief presentation. Consider if Natrum Mur does not act — Ignatia often leads into Natrum Mur cases.",
    materiaMedicaRef: "Boericke p. 369",
  },
  {
    rank: 3,
    remedyName: "Sepia",
    confidence: 54,
    potency: "200C",
    rubrics: ["MIND > Indifference > loved ones", "GENERALS > Weeping > causeless"],
    rationale: "If indifference predominates over the grief. Women with hormonal component.",
    materiaMedicaRef: "Kent's Lectures p. 902",
  },
];

export default function PatientCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = patients.find((p) => p.id === id) || patients[0];
  const patientCase = patientCases.find((c) => c.patientId === patient.id);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/doctor/patients" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Back to Patients
      </Link>

      {/* Patient header */}
      <div className="flex items-center gap-4 p-4 bg-card border rounded-xl">
        <Avatar className="h-16 w-16">
          <AvatarImage src={patient.avatar} />
          <AvatarFallback className="text-lg">{getInitials(patient.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-poppins">{patient.name}</h1>
          <p className="text-muted-foreground text-sm">{patient.age}y · {patient.gender} · {patient.bloodGroup} · {patient.city}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {patient.allergies.map((a) => (
              <Badge key={a} variant="outline" className="text-xs text-red-600 border-red-200">⚠️ {a}</Badge>
            ))}
            {patient.currentMeds.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Constitution</p>
          <p className="text-sm font-medium">{patient.constitution}</p>
          <p className="text-xs text-muted-foreground mt-1">Adherence</p>
          <p className="text-sm font-bold" style={{ color: patient.adherencePercent >= 70 ? "#5BB85A" : "#F59E0B" }}>
            {patient.adherencePercent}%
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Case history */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Case History
              </CardTitle>
              {patientCase && (
                <p className="text-sm text-muted-foreground">{patientCase.chiefComplaint}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {patientCase?.history.map((entry) => (
                <div key={entry.id} className="border-l-2 pl-4 py-1"
                  style={{ borderColor: entry.type === "consultation" ? "#2A5C8D" : "#4ECDC4" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.date)}
                    </div>
                    {entry.remedy && (
                      <span className="text-xs font-medium ml-auto">{entry.remedy} {entry.potency}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI suggestion panel */}
        <div className="lg:col-span-2">
          <Card style={{ borderColor: "#8A2BE230", background: "linear-gradient(135deg, #8A2BE205, transparent)" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Dr. Neo Suggestions
                <AIBadge />
              </CardTitle>
              <p className="text-xs text-muted-foreground">Top 3 remedy recommendations based on case analysis</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((s) => (
                <div key={s.rank} className="p-3 rounded-xl border bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {s.rank}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: "#8A2BE2" }}>{s.remedyName}</span>
                      <span className="text-xs text-muted-foreground">{s.potency}</span>
                    </div>
                  </div>

                  <ConfidenceMeter score={s.confidence} className="mb-2" />

                  <p className="text-xs text-muted-foreground mb-2">{s.rationale}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.rubrics.map((r) => (
                      <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                      onClick={() => toast.success(`${s.remedyName} prescription approved!`)}>
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => toast.info("Opening prescription builder...")}>
                      <Edit3 className="h-3 w-3" /> Modify
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600"
                      onClick={() => toast.error(`Suggestion ${s.rank} rejected`)}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <p className="text-[10px] text-muted-foreground text-center pt-1">
                ✦ AI — Pending Doctor Approval. Not a prescription.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
