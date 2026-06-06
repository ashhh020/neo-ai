"use client";

import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { WelcomeModal } from "@/components/shared/WelcomeModal";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth("student");
  return (
    <div className="h-screen flex overflow-hidden">
      <WelcomeModal />
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto scrollbar-thin" style={{ background: "transparent" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
