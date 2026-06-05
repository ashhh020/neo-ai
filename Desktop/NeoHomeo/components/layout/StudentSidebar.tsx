"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  HelpCircle,
  GraduationCap,
  LogOut,
  MessageSquarePlus,
  History,
  Bookmark,
  FlaskConical,
  FileText,
  Layers,
  Library,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Chat",
    items: [
      { href: "/student/chat/history", label: "Chat History", icon: History },
    ],
  },
  {
    label: "Study",
    items: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/materia-medica", label: "Materia Medica", icon: BookOpen },
      { href: "/student/flashcards", label: "Flashcards", icon: RotateCcw },
      { href: "/student/quiz", label: "Quiz Engine", icon: HelpCircle },
      { href: "/student/ai-tutor", label: "Organon Tutor", icon: GraduationCap, isAI: true },
      { href: "/student/notes", label: "Study Notes", icon: FileText },
    ],
  },
  {
    label: "Saved",
    items: [
      { href: "/student/saved-cases", label: "Saved Cases", icon: Bookmark },
      { href: "/student/saved-remedies", label: "Saved Remedies", icon: FlaskConical },
      { href: "/student/saved-rubrics", label: "Saved Rubrics", icon: Layers },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/student/materia-medica-tutor", label: "MM Tutor", icon: BookOpen, isAI: true },
      { href: "/student/repertory", label: "Repertory Tool", icon: Layers, isAI: true },
      { href: "/student/research", label: "Research Library", icon: Library },
    ],
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  return (
    <aside className="w-60 flex-shrink-0 h-full border-r bg-card flex flex-col">
      <div className="h-14 border-b flex items-center px-5 gap-2.5">
        <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center text-white font-bold text-sm font-poppins">N</div>
        <div>
          <div className="font-semibold font-poppins text-xs">NeoHomeo AI</div>
          <div className="text-[10px] text-muted-foreground">Student Platform</div>
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-3 pt-3">
        <Link
          href="/student/chat"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium gradient-brand text-white hover:opacity-90 transition-opacity"
        >
          <MessageSquarePlus className="h-4 w-4 flex-shrink-0" />
          New Chat
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));
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
                    {item.label}
                    {item.isAI && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#8A2BE220", color: "#8A2BE2" }}>
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t space-y-0.5">
        <Link href="/student/settings" className={cn("nav-item", "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <Settings className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          Settings
        </Link>
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
