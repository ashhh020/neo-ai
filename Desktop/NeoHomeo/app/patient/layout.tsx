"use client";

import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth("patient");
  return (
    <div className="h-screen flex overflow-hidden">
      <PatientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
