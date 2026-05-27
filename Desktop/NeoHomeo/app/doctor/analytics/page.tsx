"use client";

import { doctorAnalytics } from "@/lib/data/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Activity, Star } from "lucide-react";

const COLORS = ["#2A5C8D", "#4ECDC4", "#8A2BE2", "#5BB85A", "#F59E0B", "#E11D48", "#06B6D4"];

export default function AnalyticsPage() {
  const totalRevenue = doctorAnalytics.revenue.reduce((s, r) => s + r.amount, 0);
  const avgPerDay = Math.round(totalRevenue / doctorAnalytics.revenue.length);

  const outcomeData = [
    { name: "Improved", value: doctorAnalytics.outcomeStats.improved, color: "#5BB85A" },
    { name: "Stable", value: doctorAnalytics.outcomeStats.stable, color: "#4ECDC4" },
    { name: "Worsened", value: doctorAnalytics.outcomeStats.worsened, color: "#E11D48" },
  ];

  const revenueData = doctorAnalytics.revenue.map((r) => ({
    date: r.date.slice(5),
    revenue: r.amount,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-poppins">Analytics</h1>
        <p className="text-muted-foreground text-sm">Revenue, outcomes & patient insights</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "7-Day Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "#5BB85A" },
          { label: "Avg/Day", value: formatCurrency(avgPerDay), icon: TrendingUp, color: "#2A5C8D" },
          { label: "Patient Retention", value: `${doctorAnalytics.patientRetention}%`, icon: Users, color: "#4ECDC4" },
          { label: "Follow-up Rate", value: `${doctorAnalytics.followUpAdherence}%`, icon: Activity, color: "#8A2BE2" },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "20" }}>
                  <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xl font-bold font-poppins">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v) => [formatCurrency(v as number), "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#2A5C8D" strokeWidth={2.5} dot={{ r: 4, fill: "#2A5C8D" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Outcome stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {outcomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {outcomeData.map((o) => (
                <div key={o.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                    <span className="text-muted-foreground">{o.name}</span>
                  </div>
                  <span className="font-medium">{o.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top remedies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Prescribed Remedies</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={doctorAnalytics.topRemedies} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appointment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { day: "Mon", "In-person": 8, Teleconsult: 4 },
                { day: "Tue", "In-person": 10, Teleconsult: 5 },
                { day: "Wed", "In-person": 6, Teleconsult: 3 },
                { day: "Thu", "In-person": 12, Teleconsult: 6 },
                { day: "Fri", "In-person": 14, Teleconsult: 7 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="In-person" fill="#2A5C8D" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Teleconsult" fill="#4ECDC4" radius={[4, 4, 0, 0]} stackId="a" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
