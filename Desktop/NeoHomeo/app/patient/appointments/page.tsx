"use client";

import { useState } from "react";
import { appointments } from "@/lib/data/patients";
import { useAuthStore } from "@/lib/store/authStore";
import { patients } from "@/lib/data/patients";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Building2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate, getInitials } from "@/lib/utils";
import { Appointment } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "no-show": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function AppointmentCard({ apt, onCancel }: { apt: Appointment; onCancel: (id: string) => void }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={apt.doctorAvatar} />
            <AvatarFallback>{getInitials(apt.doctorName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{apt.doctorName}</p>
                <p className="text-xs text-muted-foreground">{apt.chiefComplaint}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onCancel(apt.id)}
                  >
                    Cancel Appointment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(apt.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {apt.time}
              </div>
              <div className="flex items-center gap-1">
                {apt.type === "teleconsult" ? (
                  <Video className="h-3 w-3" style={{ color: "#4ECDC4" }} />
                ) : (
                  <Building2 className="h-3 w-3" style={{ color: "#2A5C8D" }} />
                )}
                {apt.type === "teleconsult" ? "Teleconsult" : "In-person"}
              </div>
            </div>

            {apt.notes && (
              <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg px-2 py-1">
                {apt.notes}
              </p>
            )}
          </div>

          <Badge className={`text-xs flex-shrink-0 ${statusColors[apt.status]}`}>
            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const patient = patients.find((p) => p.userId === user?.id) || patients[0];
  const [apts, setApts] = useState(appointments.filter((a) => a.patientId === patient.id));

  const upcoming = apts.filter((a) => a.status === "upcoming");
  const past = apts.filter((a) => a.status !== "upcoming");

  function handleCancel(id: string) {
    setApts((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" as const } : a));
    toast.success("Appointment cancelled");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Appointments</h1>
          <p className="text-muted-foreground text-sm">{upcoming.length} upcoming</p>
        </div>
        <Button asChild size="sm" className="gradient-brand text-white border-0">
          <Link href="/patient/doctors">Book New</Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length > 0 ? (
            upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />)
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No upcoming appointments</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/patient/doctors">Find a Doctor</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-3">
          {past.map((apt) => <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
