"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserSearch,
  MessageSquareText,
  CalendarDays,
  PillBottle,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/patient", label: "Overview", icon: LayoutDashboard },
  { href: "/patient/doctors", label: "Find Doctors", icon: UserSearch },
  { href: "/patient/dr-neo", label: "Dr. Neo AI", icon: MessageSquareText, isAI: true },
  { href: "/patient/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/patient/tracker", label: "Remedy Tracker", icon: PillBottle },
  { href: "/patient/records", label: "My Records", icon: FileText },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  return (
    <aside className="w-60 flex-shrink-0 h-full border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="h-14 border-b flex items-center px-5 gap-2.5">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm font-poppins">
          N
        </div>
        <span className="font-semibold font-poppins text-sm">NeoHomeo</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/patient" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className="h-4 w-4 flex-shrink-0"
                strokeWidth={1.75}
                style={item.isAI ? { color: "#8A2BE2" } : undefined}
              />
              <span className={item.isAI ? "" : ""}>{item.label}</span>
              {item.isAI && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#8A2BE220", color: "#8A2BE2" }}>
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t">
        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="nav-item w-full text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
