"use client";

import { useState } from "react";
import { patients } from "@/lib/data/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Search, Users, AlertCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const myPatients = patients.filter((p) => p.activeDoctorId === "dr-001");

  const filtered = myPatients.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "low-adherence" && p.adherencePercent >= 70) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Patients</h1>
          <p className="text-muted-foreground text-sm">{myPatients.length} active patients</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {["all", "low-adherence", "chronic", "new"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All" : f.replace("-", " ")}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((patient) => (
          <Card key={patient.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.age}y · {patient.gender} · {patient.city}</p>
                </div>
                {patient.adherencePercent < 70 && (
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current Remedy</span>
                  <span className="font-medium">{patient.currentRemedy} {patient.currentPotency}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Adherence</span>
                    <span className={patient.adherencePercent < 70 ? "text-amber-500 font-medium" : "font-medium"}>
                      {patient.adherencePercent}%
                    </span>
                  </div>
                  <Progress value={patient.adherencePercent} className="h-1.5" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {patient.allergies.slice(0, 2).map((a) => (
                  <Badge key={a} variant="outline" className="text-xs text-red-600 border-red-200">
                    {a}
                  </Badge>
                ))}
              </div>

              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href={`/doctor/patients/${patient.id}`}>Open Case</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No patients found</p>
        </div>
      )}
    </div>
  );
}
