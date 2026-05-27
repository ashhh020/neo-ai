"use client";

import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth("doctor");
  return (
    <div className="h-screen flex overflow-hidden">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
