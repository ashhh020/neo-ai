"use client";

import { appointments } from "@/lib/data/patients";
import { doctorAnalytics } from "@/lib/data/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIBadge } from "@/components/shared/AIBadge";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import {
  Calendar, Users, FileText, MessageSquare, TrendingUp,
  Video, Building2, Clock, ChevronRight, CheckCircle, XCircle, Edit3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const todayAppts = appointments.filter((a) => a.status === "upcoming").slice(0, 6);

const pendingAI = [
  { patientName: "Priya Sharma", remedy: "Natrum Muriaticum", confidence: 82, potency: "200C" },
  { patientName: "Arjun Nair", remedy: "Sulphur", confidence: 67, potency: "30C" },
  { patientName: "Rahul Verma", remedy: "Lycopodium", confidence: 91, potency: "1M" },
];

export default function DoctorDashboard() {
  const revenueData = doctorAnalytics.revenue.map((r) => ({
    date: r.date.slice(5),
    amount: r.amount,
  }));

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: Calendar, color: "#2A5C8D" },
    { label: "Pending Prescriptions", value: pendingAI.length, icon: FileText, color: "#F59E0B" },
    { label: "Active Patients", value: 10, icon: Users, color: "#4ECDC4" },
    { label: "Yesterday's Revenue", value: formatCurrency(doctorAnalytics.revenue[5]?.amount || 0), icon: TrendingUp, color: "#5BB85A" },
    { label: "Unread Messages", value: 3, icon: MessageSquare, color: "#8A2BE2" },
    { label: "Follow-ups Due", value: 4, icon: Clock, color: "#E11D48" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-poppins">Good morning, Dr. Rajan 👨‍⚕️</h1>
        <p className="text-muted-foreground text-sm">Tuesday, 20 May 2026 · {todayAppts.length} patients today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: stat.color + "20" }}>
                  <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-lg font-bold font-poppins leading-none">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                Today&apos;s Schedule
                <Link href="/doctor/schedule" className="text-xs text-primary flex items-center gap-1">
                  Full calendar <ChevronRight className="h-3 w-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayAppts.map((apt, i) => (
                <div key={apt.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{apt.time}</span>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={apt.patientAvatar} />
                    <AvatarFallback className="text-xs">{getInitials(apt.patientName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{apt.chiefComplaint}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {apt.type === "teleconsult" ? (
                      <Video className="h-3.5 w-3.5" style={{ color: "#4ECDC4" }} />
                    ) : (
                      <Building2 className="h-3.5 w-3.5" style={{ color: "#2A5C8D" }} />
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                      <Link href={`/doctor/patients/${apt.patientId}`}>Open Case</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Revenue chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Bar dataKey="amount" fill="#2A5C8D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI pending approvals */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Pending AI Approvals
                <AIBadge />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingAI.map((item) => (
                <div key={item.patientName} className="p-3 rounded-xl border"
                  style={{ borderColor: "#8A2BE230", backgroundColor: "#8A2BE205" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{item.patientName}</p>
                    <span className="text-xs font-bold" style={{ color: "#8A2BE2" }}>
                      {item.remedy}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{item.potency}</p>
                  <ConfidenceMeter score={item.confidence} className="mb-3" />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => toast.success(`Prescription approved for ${item.patientName}`)}>
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => toast.info("Opening modification panel...")}>
                      <Edit3 className="h-3 w-3" /> Modify
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50"
                      onClick={() => toast.error(`Suggestion rejected for ${item.patientName}`)}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Follow-ups Due</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointments.filter((a) => a.status === "completed").slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#E11D48" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">Last seen {formatDate(apt.date)}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                    <Link href={`/doctor/patients/${apt.patientId}`}>View</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
