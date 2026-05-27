"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { patients } from "@/lib/data/patients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Check, X, Minus, PlusCircle, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const doseLog: Record<string, "taken" | "missed" | "upcoming"> = {
  Mon: "taken", Tue: "taken", Wed: "missed", Thu: "taken", Fri: "taken", Sat: "taken", Sun: "upcoming",
};

const symptomTrend = [
  { day: "May 14", intensity: 7 }, { day: "May 15", intensity: 6 }, { day: "May 16", intensity: 7 },
  { day: "May 17", intensity: 5 }, { day: "May 18", intensity: 4 }, { day: "May 19", intensity: 4 },
  { day: "May 20", intensity: 3 },
];

const MODALITY_TAGS = [
  "Better warmth", "Worse cold", "Better motion", "Worse rest",
  "Worse morning", "Better evening", "Worse eating", "Better fasting",
  "Better open air", "Worse heat",
];

export default function TrackerPage() {
  const { user } = useAuthStore();
  const patient = patients.find((p) => p.userId === user?.id) || patients[0];

  const [intensity, setIntensity] = useState(3);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [aggravation, setAggravation] = useState(false);
  const [amelioration, setAmelioration] = useState(false);

  const adherence = Math.round((Object.values(doseLog).filter((v) => v === "taken").length / (WEEK_DAYS.length - 1)) * 100);

  function toggleModality(tag: string) {
    setSelectedModalities((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handleLogEntry() {
    toast.success("Symptom entry logged successfully!");
    setNotes("");
    setSelectedModalities([]);
    setIntensity(3);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-poppins">Remedy Tracker</h1>
        <p className="text-muted-foreground text-sm">Track doses and symptom progress</p>
      </div>

      {/* Active remedy */}
      <Card style={{ background: "linear-gradient(135deg, #4ECDC420, #2A5C8D10)" }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ACTIVE REMEDY</p>
              <h2 className="text-xl font-bold font-poppins">{patient.currentRemedy}</h2>
              <p className="text-muted-foreground text-sm">{patient.currentPotency} · Once daily at 8 PM</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-lg">{adherence}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Weekly adherence</p>
            </div>
          </div>
          <Progress value={adherence} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Weekly calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Dose Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day) => {
              const status = doseLog[day];
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    status === "taken" ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" :
                    status === "missed" ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {status === "taken" ? <Check className="h-4 w-4" /> :
                     status === "missed" ? <X className="h-4 w-4" /> :
                     <Minus className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{status}</span>
                </div>
              );
            })}
          </div>
          <Button size="sm" className="mt-4 gap-2" style={{ backgroundColor: "#4ECDC4", color: "white", border: "none" }}
            onClick={() => toast.success("Dose logged for today!")}>
            <Check className="h-4 w-4" />
            Log Today&apos;s Dose
          </Button>
        </CardContent>
      </Card>

      {/* Symptom trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Symptom Intensity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={symptomTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="intensity" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 3, fill: "#4ECDC4" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Symptom diary entry */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PlusCircle className="h-4 w-4" style={{ color: "#4ECDC4" }} />
            Log Symptom Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Symptom Intensity: <span className="font-bold">{intensity}/10</span></p>
            <Slider
              min={0} max={10} step={1}
              value={[intensity]}
              onValueChange={(v) => setIntensity(Array.isArray(v) ? v[0] : (v as number))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>None</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Modalities</p>
            <div className="flex flex-wrap gap-2">
              {MODALITY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleModality(tag)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-all",
                    selectedModalities.includes(tag)
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setAggravation(!aggravation)}
              className={cn(
                "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                aggravation ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" : "hover:bg-muted"
              )}
            >
              🌡️ Aggravation
            </button>
            <button
              onClick={() => setAmelioration(!amelioration)}
              className={cn(
                "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                amelioration ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "hover:bg-muted"
              )}
            >
              ✅ Amelioration
            </button>
          </div>

          <Textarea
            placeholder="Additional notes about how you're feeling today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Button onClick={handleLogEntry} className="w-full gradient-brand text-white border-0">
            Save Symptom Entry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
