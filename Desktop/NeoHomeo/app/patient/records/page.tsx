"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { patients, patientCases } from "@/lib/data/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, PillBottle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RecordsPage() {
  const { user } = useAuthStore();
  const patient = patients.find((p) => p.userId === user?.id) || patients[0];
  const cases = patientCases.filter((c) => c.patientId === patient.id);

  const allEntries = cases.flatMap((c) =>
    c.history.map((entry) => ({ ...entry, caseId: c.id, chiefComplaint: c.chiefComplaint }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeColors: Record<string, string> = {
    consultation: "#2A5C8D",
    "follow-up": "#4ECDC4",
    prescription: "#5BB85A",
    "ai-assessment": "#8A2BE2",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Medical Records</h1>
          <p className="text-muted-foreground text-sm">Your complete health timeline</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Visits", value: allEntries.filter((e) => e.type === "consultation").length },
          { label: "Follow-ups", value: allEntries.filter((e) => e.type === "follow-up").length },
          { label: "Active Cases", value: cases.filter((c) => c.status === "active").length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-poppins">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {allEntries.map((entry) => (
            <div key={entry.id} className="flex gap-4 relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-background"
                style={{ backgroundColor: typeColors[entry.type] + "20" }}
              >
                {entry.type === "prescription" ? (
                  <PillBottle className="h-4 w-4" style={{ color: typeColors[entry.type] }} />
                ) : (
                  <FileText className="h-4 w-4" style={{ color: typeColors[entry.type] }} />
                )}
              </div>

              <Card className="flex-1 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: typeColors[entry.type] + "20", color: typeColors[entry.type] }}
                        >
                          {entry.type.replace("-", " ")}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.date)}
                        </div>
                      </div>
                    </div>
                    {entry.remedy && (
                      <div className="text-right">
                        <span className="text-xs font-medium">{entry.remedy}</span>
                        <p className="text-xs text-muted-foreground">{entry.potency}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {allEntries.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No medical records yet</p>
          <p className="text-sm">Records will appear after your first consultation</p>
        </div>
      )}
    </div>
  );
}
