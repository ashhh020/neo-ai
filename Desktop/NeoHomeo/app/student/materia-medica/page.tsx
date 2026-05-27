"use client";

import { useState } from "react";
import { remedies } from "@/lib/data/remedies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, BookOpen, PlusCircle, X } from "lucide-react";
import { Remedy } from "@/types";
import { toast } from "sonner";

const CATEGORIES = ["all", "mineral", "plant", "animal", "nosode"] as const;

const categoryColors: Record<string, string> = {
  mineral: "#2A5C8D",
  plant: "#5BB85A",
  animal: "#F59E0B",
  nosode: "#8A2BE2",
  imponderabilia: "#4ECDC4",
};

export default function MateriaMedicaPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Remedy | null>(null);

  const filtered = remedies.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.abbreviation.toLowerCase().includes(search.toLowerCase()) &&
      !r.keynotes.some((k) => k.toLowerCase().includes(search.toLowerCase()))) return false;
    if (category !== "all" && r.category !== category) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-poppins">Materia Medica</h1>
        <p className="text-muted-foreground text-sm">{remedies.length} remedies · Classical homeopathic reference</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search remedies, keynotes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
              className="capitalize"
              style={category === cat && cat !== "all" ? { backgroundColor: categoryColors[cat], color: "white", border: "none" } : {}}
            >
              {cat}
            </Button>
          ))}
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="gap-1">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} remedies</p>

      {/* Remedy grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((remedy) => (
          <Card key={remedy.id} className="card-hover cursor-pointer" onClick={() => setSelected(remedy)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{remedy.name}</h3>
                  <p className="text-xs text-muted-foreground">{remedy.abbreviation}</p>
                </div>
                <Badge
                  className="text-xs capitalize flex-shrink-0"
                  style={{ backgroundColor: categoryColors[remedy.category] + "20", color: categoryColors[remedy.category] }}
                >
                  {remedy.category}
                </Badge>
              </div>
              {remedy.constitution && (
                <p className="text-xs text-muted-foreground italic mb-2">&ldquo;{remedy.constitution}&rdquo;</p>
              )}
              <ul className="space-y-0.5">
                {remedy.keynotes.slice(0, 3).map((kn) => (
                  <li key={kn} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[remedy.category] }} />
                    {kn}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="ghost"
                className="mt-3 h-7 text-xs gap-1 w-full"
                onClick={(e) => { e.stopPropagation(); toast.success(`${remedy.name} added to flashcards!`); }}
              >
                <PlusCircle className="h-3 w-3" /> Add to Flashcards
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No remedies found</p>
        </div>
      )}

      {/* Remedy detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {selected.name}
                    <span className="text-sm font-normal text-muted-foreground">({selected.abbreviation})</span>
                  </div>
                  {selected.constitution && (
                    <p className="text-sm font-normal text-muted-foreground italic mt-0.5">{selected.constitution}</p>
                  )}
                </div>
                <Badge
                  className="ml-auto capitalize"
                  style={{ backgroundColor: categoryColors[selected.category] + "20", color: categoryColors[selected.category] }}
                >
                  {selected.category}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="mind">
              <TabsList className="w-full">
                <TabsTrigger value="mind" className="flex-1">Mind</TabsTrigger>
                <TabsTrigger value="generals" className="flex-1">Generals</TabsTrigger>
                <TabsTrigger value="keynotes" className="flex-1">Keynotes</TabsTrigger>
                <TabsTrigger value="modalities" className="flex-1">Modalities</TabsTrigger>
              </TabsList>
              <TabsContent value="mind" className="space-y-2 mt-3">
                {selected.mind.map((m) => (
                  <p key={m} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#8A2BE2" }} />
                    {m}
                  </p>
                ))}
              </TabsContent>
              <TabsContent value="generals" className="space-y-2 mt-3">
                {selected.generals.map((g) => (
                  <p key={g} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#2A5C8D" }} />
                    {g}
                  </p>
                ))}
              </TabsContent>
              <TabsContent value="keynotes" className="space-y-2 mt-3">
                {selected.keynotes.map((k) => (
                  <p key={k} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#5BB85A" }} />
                    {k}
                  </p>
                ))}
              </TabsContent>
              <TabsContent value="modalities" className="mt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-2">WORSE</p>
                    {selected.modalities.worse.map((m) => (
                      <p key={m} className="text-sm text-muted-foreground">· {m}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-2">BETTER</p>
                    {selected.modalities.better.map((m) => (
                      <p key={m} className="text-sm text-muted-foreground">· {m}</p>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)", color: "white", border: "none" }}
              onClick={() => { toast.success(`${selected.name} added to flashcards!`); setSelected(null); }}
            >
              <PlusCircle className="h-4 w-4" /> Add to Flashcards
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
