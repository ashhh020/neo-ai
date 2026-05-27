"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { patients, appointments } from "@/lib/data/patients";
import { doctors } from "@/lib/data/doctors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AIBadge } from "@/components/shared/AIBadge";
import { Calendar, Clock, PillBottle, MessageSquareText, Star, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const patient = patients.find((p) => p.userId === user?.id) || patients[0];
  const activeDoctor = doctors.find((d) => d.id === patient.activeDoctorId);
  const upcomingAppts = appointments.filter(
    (a) => a.patientId === patient.id && a.status === "upcoming"
  ).slice(0, 2);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Good morning, {patient.name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s your health overview for today</p>
        </div>
        <Button asChild size="sm" className="gap-2" style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)", color: "white", border: "none" }}>
          <Link href="/patient/dr-neo">
            <MessageSquareText className="h-4 w-4" />
            Talk to Dr. Neo
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Current Remedy", value: patient.currentRemedy || "None", sub: patient.currentPotency, color: "#4ECDC4", icon: PillBottle },
          { label: "Adherence", value: `${patient.adherencePercent}%`, sub: "this month", color: "#5BB85A", icon: Flame },
          { label: "Upcoming", value: String(upcomingAppts.length), sub: "appointments", color: "#2A5C8D", icon: Calendar },
          { label: "Active Doctor", value: activeDoctor?.name.replace("Dr. ", "Dr.") || "None", sub: activeDoctor?.city, color: "#F59E0B", icon: Star },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "20" }}>
                  <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="font-semibold text-sm truncate">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Remedy tracker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Current Remedy
              <Link href="/patient/tracker" className="text-xs text-primary flex items-center gap-1">
                Track doses <ChevronRight className="h-3 w-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: "#4ECDC420" }}>
                💊
              </div>
              <div>
                <p className="font-semibold">{patient.currentRemedy}</p>
                <p className="text-sm text-muted-foreground">{patient.currentPotency} · Once daily</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Adherence this month</span>
                <span className="font-medium">{patient.adherencePercent}%</span>
              </div>
              <Progress value={patient.adherencePercent} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Next dose: Today at 8:00 PM</p>
          </CardContent>
        </Card>

        {/* Active doctor */}
        {activeDoctor && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Your Doctor
                <Badge variant="secondary" className="text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                  Available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={activeDoctor.avatar} />
                  <AvatarFallback>{getInitials(activeDoctor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{activeDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">{activeDoctor.specialties[0]}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{activeDoctor.rating}</span>
                    <span className="text-xs text-muted-foreground">({activeDoctor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/patient/appointments">Book Follow-up</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Upcoming Appointments
            <Link href="/patient/appointments" className="text-xs text-primary flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingAppts.length > 0 ? upcomingAppts.map((apt) => (
            <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                style={{ backgroundColor: apt.type === "teleconsult" ? "#4ECDC420" : "#2A5C8D20" }}>
                {apt.type === "teleconsult" ? "📹" : "🏥"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{apt.doctorName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(apt.date)}
                  <Clock className="h-3 w-3" />
                  {apt.time}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {apt.type === "teleconsult" ? "Tele" : "In-person"}
              </Badge>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
          )}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/patient/doctors">Find a Doctor & Book</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Dr Neo CTA */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <AIBadge className="bg-white/20 border-white/30 text-white" />
              <span className="text-xs font-medium text-white/80">Always available</span>
            </div>
            <h3 className="font-semibold font-poppins text-lg mb-1">Talk to Dr. Neo</h3>
            <p className="text-sm text-white/80 max-w-xs">
              AI-powered case-taking. Describe your symptoms and Dr. Neo will prepare your case for your doctor.
            </p>
          </div>
          <Button size="sm" asChild className="bg-white text-purple-700 hover:bg-white/90 flex-shrink-0 mt-1">
            <Link href="/patient/dr-neo">Start Chat</Link>
          </Button>
        </div>
        <p className="text-xs text-white/60 mt-3">✦ AI pre-assessment only. Not a prescription. All output reviewed by your doctor.</p>
      </div>
    </div>
  );
}
