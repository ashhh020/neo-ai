"use client";

import { useState, useMemo } from "react";
import { doctors } from "@/lib/data/doctors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Search, Video, CheckCircle2, MapPin, Clock, X } from "lucide-react";
import { PractitionerProfile } from "@/types";
import { getInitials, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [maxFee, setMaxFee] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<PractitionerProfile | null>(null);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => d.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase())) &&
        !d.city.toLowerCase().includes(search.toLowerCase())) return false;
      if (specialty !== "all" && !d.specialties.includes(specialty)) return false;
      if (teleconsultOnly && !d.teleconsult) return false;
      if (maxFee !== "all" && d.fee > parseInt(maxFee)) return false;
      return true;
    });
  }, [search, specialty, teleconsultOnly, maxFee]);

  function handleBook(doctor: PractitionerProfile) {
    toast.success(`Appointment request sent to ${doctor.name}!`);
    setSelectedDoctor(null);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-poppins">Find a Doctor</h1>
        <p className="text-muted-foreground text-sm">Browse verified homeopathic practitioners</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, specialty, city..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={specialty} onValueChange={(v) => setSpecialty(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {allSpecialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={maxFee} onValueChange={(v) => setMaxFee(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Fee range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Fee</SelectItem>
            <SelectItem value="500">Under ₹500</SelectItem>
            <SelectItem value="1000">Under ₹1,000</SelectItem>
            <SelectItem value="1500">Under ₹1,500</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={teleconsultOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setTeleconsultOnly(!teleconsultOnly)}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          Teleconsult
        </Button>
        {(search || specialty !== "all" || teleconsultOnly || maxFee !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSpecialty("all"); setTeleconsultOnly(false); setMaxFee("all"); }} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} doctors found</p>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doctor) => (
          <Card key={doctor.id} className="card-hover overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(doctor.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{doctor.name}</p>
                    {doctor.verified && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{doctor.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{doctor.rating}</span>
                    <span className="text-xs text-muted-foreground">({doctor.reviewCount})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {doctor.specialties.slice(0, 2).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
                {doctor.specialties.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{doctor.specialties.length - 2}</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {doctor.city}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {doctor.experience}y exp
                </div>
                {doctor.teleconsult && (
                  <div className="flex items-center gap-1" style={{ color: "#4ECDC4" }}>
                    <Video className="h-3 w-3" />
                    Teleconsult
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-base">{formatCurrency(doctor.fee)}</span>
                  <span className="text-xs text-muted-foreground"> / consult</span>
                </div>
                <Button size="sm" onClick={() => setSelectedDoctor(doctor)}>
                  Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No doctors found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Doctor profile dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
        {selectedDoctor && (
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedDoctor.avatar} />
                  <AvatarFallback>{getInitials(selectedDoctor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedDoctor.name}
                    {selectedDoctor.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">{selectedDoctor.title}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedDoctor.bio}</p>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">QUALIFICATIONS</p>
                <ul className="space-y-1">
                  {selectedDoctor.qualifications.map((q) => (
                    <li key={q} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">LANGUAGES</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.languages.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>

              {selectedDoctor.availableSlots && selectedDoctor.availableSlots.filter((s) => s.available).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">AVAILABLE SLOTS</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDoctor.availableSlots.filter((s) => s.available).slice(0, 4).map((slot) => (
                      <button
                        key={slot.id}
                        className="text-xs p-2 rounded-lg border hover:bg-muted transition-colors text-left"
                        onClick={() => handleBook(selectedDoctor)}
                      >
                        <div className="font-medium">{slot.date}</div>
                        <div className="text-muted-foreground">{slot.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full gradient-brand text-white border-0" onClick={() => handleBook(selectedDoctor)}>
                Book Appointment · {formatCurrency(selectedDoctor.fee)}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
