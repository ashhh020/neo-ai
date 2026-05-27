"use client";

import { useState } from "react";
import { DrNeoChat } from "@/components/shared/DrNeoChat";
import { AIBadge } from "@/components/shared/AIBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

export default function DrNeoPatientPage() {
  const [caseSummary, setCaseSummary] = useState<Record<string, unknown> | null>(null);

  function handleSendToDoctor() {
    toast.success("Case summary sent to your doctor for review!");
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row overflow-hidden">
      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)" }}>
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Dr. Neo</span>
              <AIBadge />
            </div>
            <p className="text-xs text-muted-foreground">AI Pre-Assessment · Classical Homeopathy</p>
          </div>
        </div>

        <DrNeoChat
          mode="patient"
          placeholder="Describe your symptoms..."
          quickPrompts={[
            "I have a headache",
            "I've been feeling anxious",
            "I have skin issues",
            "My sleep is disturbed",
          ]}
          onCaseSummary={(s) => setCaseSummary(s as Record<string, unknown> | null)}
          className="flex-1"
        />
      </div>

      {/* Case summary panel */}
      {caseSummary && (
        <div className="w-80 border-l p-4 overflow-y-auto scrollbar-thin bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Case Summary</span>
              <AIBadge />
            </div>
          </div>
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                {JSON.stringify(caseSummary, null, 2)}
              </pre>
            </CardContent>
          </Card>
          <Button
            className="w-full mt-3 gap-2"
            style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)", color: "white", border: "none" }}
            onClick={handleSendToDoctor}
          >
            <Send className="h-4 w-4" />
            Send to My Doctor
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your doctor will review and respond within 24 hours
          </p>
        </div>
      )}
    </div>
  );
}
