"use client";

import { useState } from "react";
import { patients } from "@/lib/data/patients";
import { remedies } from "@/lib/data/remedies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Search, FileText, Send } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const mockPrescriptions = [
  { id: "rx-001", patientId: "p-001", patientName: "Priya Sharma", date: "2026-05-19", remedy: "Natrum Muriaticum", potency: "200C", status: "active" as const, doctorResponse: "approved" as const },
  { id: "rx-002", patientId: "p-002", patientName: "Arjun Nair", date: "2026-05-18", remedy: "Sulphur", potency: "30C", status: "active" as const, doctorResponse: "modified" as const },
  { id: "rx-003", patientId: "p-004", patientName: "Rahul Verma", date: "2026-05-17", remedy: "Lycopodium", potency: "1M", status: "active" as const, doctorResponse: "approved" as const },
  { id: "rx-004", patientId: "p-007", patientName: "Sunita Krishnamurthy", date: "2026-05-15", remedy: "Calcarea Carbonica", potency: "200C", status: "completed" as const, doctorResponse: "approved" as const },
];

const POTENCIES = ["6C", "12C", "30C", "200C", "1M", "10M", "LM1", "LM2", "LM3"];
const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Once weekly", "As needed"];

export default function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedRemedy, setSelectedRemedy] = useState("");
  const [remedySearch, setRemedySearch] = useState("");
  const [potency, setPotency] = useState("200C");
  const [frequency, setFrequency] = useState("Once daily");
  const [duration, setDuration] = useState("4 weeks");
  const [rationale, setRationale] = useState("");

  const filtered = mockPrescriptions.filter((rx) =>
    !search || rx.patientName.toLowerCase().includes(search.toLowerCase()) || rx.remedy.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRemedies = remedies.filter((r) =>
    r.name.toLowerCase().includes(remedySearch.toLowerCase()) || r.abbreviation.toLowerCase().includes(remedySearch.toLowerCase())
  ).slice(0, 8);

  function handleSend() {
    if (!selectedPatient || !selectedRemedy) {
      toast.error("Please select patient and remedy");
      return;
    }
    toast.success("Prescription sent to patient!");
    setOpen(false);
    setSelectedPatient(""); setSelectedRemedy(""); setRationale("");
  }

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Prescriptions</h1>
          <p className="text-muted-foreground text-sm">{mockPrescriptions.length} total prescriptions</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 gradient-brand text-white border-0">
          <PlusCircle className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search prescriptions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map((rx) => {
          const patient = patients.find((p) => p.id === rx.patientId);
          return (
            <Card key={rx.id} className="card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={patient?.avatar} />
                  <AvatarFallback>{getInitials(rx.patientName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{rx.patientName}</p>
                    <Badge className={`text-xs ${statusColor[rx.status]}`}>{rx.status}</Badge>
                    {rx.doctorResponse && (
                      <Badge variant="outline" className="text-xs capitalize">{rx.doctorResponse}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rx.remedy} · {rx.potency}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{formatDate(rx.date)}</p>
                  <Button size="sm" variant="ghost" className="h-7 text-xs mt-1">View</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New prescription dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Prescription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={(v) => setSelectedPatient(v ?? "")}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.filter((p) => p.activeDoctorId === "dr-001").map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Remedy</Label>
              <Input
                className="mt-1"
                placeholder="Search remedy..."
                value={remedySearch}
                onChange={(e) => { setRemedySearch(e.target.value); setSelectedRemedy(""); }}
              />
              {remedySearch && (
                <div className="border rounded-lg mt-1 overflow-hidden divide-y">
                  {filteredRemedies.map((r) => (
                    <button
                      key={r.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                      onClick={() => { setSelectedRemedy(r.name); setRemedySearch(r.name); }}
                    >
                      <span>{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.abbreviation}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Potency</Label>
                <Select value={potency} onValueChange={(v) => setPotency(v ?? "")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{POTENCIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v ?? "")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Duration</Label>
              <Input className="mt-1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 4 weeks" />
            </div>

            <div>
              <Label>Clinical Rationale</Label>
              <Textarea
                className="mt-1"
                placeholder="Document your prescription rationale..."
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSend} className="w-full gap-2 gradient-brand text-white border-0">
              <Send className="h-4 w-4" />
              Sign & Send Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
