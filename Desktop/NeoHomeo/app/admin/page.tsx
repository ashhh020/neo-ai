"use client";

import { adminMetrics } from "@/lib/data/analytics";
import { doctors } from "@/lib/data/doctors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIBadge } from "@/components/shared/AIBadge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import { Users, Stethoscope, GraduationCap, Activity, TrendingUp, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatCurrency, getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const pendingDoctors = doctors.filter((d) => !d.verified).slice(0, 3);

const AI_COLORS = ["#5BB85A", "#4ECDC4", "#F59E0B", "#E11D48", "#8A2BE2"];

export default function AdminPage() {
  const metrics = [
    { label: "Total Doctors", value: adminMetrics.totalDoctors.toLocaleString(), icon: Stethoscope, color: "#2A5C8D", change: "+34 this month" },
    { label: "Total Patients", value: adminMetrics.totalPatients.toLocaleString(), icon: Users, color: "#4ECDC4", change: "+2,841 this month" },
    { label: "Total Students", value: adminMetrics.totalStudents.toLocaleString(), icon: GraduationCap, color: "#8A2BE2", change: "+891 this month" },
    { label: "Today's Consults", value: adminMetrics.consultationsToday.toLocaleString(), icon: Activity, color: "#5BB85A", change: `+${adminMetrics.consultationsToday - adminMetrics.consultationsYesterday} vs yesterday` },
    { label: "AI Acceptance Rate", value: `${adminMetrics.aiAcceptanceRate}%`, icon: TrendingUp, color: "#F59E0B", change: "+3% this month" },
    { label: "Pending Verifications", value: String(adminMetrics.pendingVerifications), icon: AlertCircle, color: "#E11D48", change: "Action required" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-poppins">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">NeoHomeo · Admin Panel · 20 May 2026</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="card-hover">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: m.color + "20" }}>
                  <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-xl font-bold font-poppins">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: m.color }}>{m.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue + AI confidence */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Weekly Platform Activity
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5C8D" }} />Consults</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />Revenue</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={adminMetrics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="consultations" fill="#2A5C8D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              AI Confidence Distribution
              <AIBadge />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={adminMetrics.aiConfidenceDistribution} cx="50%" cy="50%" outerRadius={65} dataKey="count" nameKey="range">
                  {adminMetrics.aiConfidenceDistribution.map((_, i) => (
                    <Cell key={i} fill={AI_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {adminMetrics.aiConfidenceDistribution.map((d, i) => (
                <div key={d.range} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AI_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.range}</span>
                  </div>
                  <span className="font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doctor verification queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Verification Queue
              <Badge variant="destructive" className="text-xs">{adminMetrics.pendingVerifications} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={doc.avatar} />
                  <AvatarFallback>{getInitials(doc.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.title} · {doc.city}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => toast.success(`${doc.name} verified!`)}>
                    <CheckCircle2 className="h-3 w-3" /> Verify
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600"
                    onClick={() => toast.error(`${doc.name} rejected`)}>
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Audit Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminMetrics.recentAuditEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#4ECDC4" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{event.action.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="text-muted-foreground"> on {event.resource}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{event.userId} · {timeAgo(event.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* MRR/ARR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue", value: formatCurrency(adminMetrics.monthlyRevenue), color: "#5BB85A" },
          { label: "MRR", value: formatCurrency(adminMetrics.mrr), color: "#2A5C8D" },
          { label: "ARR", value: formatCurrency(adminMetrics.arr), color: "#4ECDC4" },
          { label: "AI Acceptance Rate", value: `${adminMetrics.aiAcceptanceRate}%`, color: "#8A2BE2" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-bold font-poppins" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
