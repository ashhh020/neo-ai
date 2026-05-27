"use client";

import { useState } from "react";
import { appointments } from "@/lib/data/patients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Video, Building2, PlusCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

const WEEK_DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(offset = 0) {
  const today = new Date("2026-05-20");
  today.setDate(today.getDate() + offset * 7);
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const weekDates = getWeekDates(weekOffset);

  const aptsForWeek = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= weekDates[0] && d <= weekDates[6];
  });

  const getAptsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((a) => a.date === dateStr);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Schedule</h1>
          <p className="text-muted-foreground text-sm">{aptsForWeek.length} appointments this week</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={viewMode === "week" ? "default" : "outline"} onClick={() => setViewMode("week")}>Week</Button>
          <Button size="sm" variant={viewMode === "day" ? "default" : "outline"} onClick={() => setViewMode("day")}>Day</Button>
          <Button size="sm" className="gap-1 gradient-brand text-white border-0" onClick={() => toast.success("Slot added!")}>
            <PlusCircle className="h-4 w-4" /> Add Slot
          </Button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {weekDates[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
          {weekDates[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(w => w + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">Today</Button>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          {/* Day headers */}
          <div className="grid border-b" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div className="p-2" />
            {weekDates.map((date, i) => {
              const isToday = date.toISOString().split("T")[0] === "2026-05-20";
              return (
                <div key={i} className={cn("p-3 text-center border-l", isToday && "bg-primary/5")}>
                  <p className="text-xs text-muted-foreground">{WEEK_DAYS_FULL[date.getDay()]}</p>
                  <p className={cn("text-sm font-semibold mt-0.5", isToday && "text-primary")}>{date.getDate()}</p>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin">
            {HOURS.map((hour) => (
              <div key={hour} className="grid border-b" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", minHeight: "60px" }}>
                <div className="p-2 text-xs text-muted-foreground text-right pr-3 pt-1">
                  {hour > 12 ? `${hour - 12}PM` : hour === 12 ? "12PM" : `${hour}AM`}
                </div>
                {weekDates.map((date, di) => {
                  const dayApts = getAptsForDay(date).filter((a) => {
                    const aptHour = parseInt(a.time.split(":")[0]);
                    const isPM = a.time.includes("PM") && aptHour !== 12;
                    const h24 = isPM ? aptHour + 12 : aptHour;
                    return h24 === hour;
                  });
                  return (
                    <div key={di} className="border-l p-1 relative min-h-[60px]">
                      {dayApts.map((apt) => (
                        <div
                          key={apt.id}
                          className="text-xs rounded p-1.5 mb-1 cursor-pointer"
                          style={{
                            backgroundColor: apt.type === "teleconsult" ? "#4ECDC420" : "#2A5C8D15",
                            borderLeft: `3px solid ${apt.type === "teleconsult" ? "#4ECDC4" : "#2A5C8D"}`,
                          }}
                        >
                          <p className="font-medium truncate">{apt.patientName}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                            {apt.type === "teleconsult"
                              ? <Video className="h-2.5 w-2.5" style={{ color: "#4ECDC4" }} />
                              : <Building2 className="h-2.5 w-2.5" style={{ color: "#2A5C8D" }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2A5C8D" }} />
          In-person
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#4ECDC4" }} />
          Teleconsult
        </div>
      </div>
    </div>
  );
}
