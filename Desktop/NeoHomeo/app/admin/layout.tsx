"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth("admin");
  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
