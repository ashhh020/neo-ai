"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, RotateCcw, HelpCircle, GraduationCap,
  LogOut, MessageSquarePlus, History, Bookmark, FlaskConical,
  FileText, Layers, Library, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Chat",
    items: [
      { href: "/student/chat", label: "New Chat", icon: MessageSquarePlus },
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
      { href: "/student/repertory", label: "Repertory", icon: Layers, isAI: true },
      { href: "/student/research", label: "Research Library", icon: Library },
    ],
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  return (
    <aside
      className="w-60 flex-shrink-0 h-full flex flex-col"
      style={{
        background: "var(--glass-base)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderRight: "1px solid var(--glass-border)",
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 gap-2.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="w-8 h-8 rounded-xl gradient-mineral flex items-center justify-center text-white font-bold text-sm">N</div>
        <div>
          <div className="font-bold text-xs" style={{ color: "var(--text-obsidian)" }}>NeoHomeo AI</div>
          <div className="font-mono-neo text-[9px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Student Platform</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="font-mono-neo text-[9px] font-bold uppercase tracking-[0.12em] px-2 mb-1.5" style={{ color: "var(--text-dim)" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/student" && item.href !== "/student/chat" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-item text-sm transition-all",
                      isActive
                        ? "font-semibold"
                        : "hover:bg-white/40"
                    )}
                    style={isActive ? {
                      background: "rgba(78,115,223,0.12)",
                      color: "var(--accent-mineral)",
                    } : { color: "var(--text-dim)" }}
                  >
                    <item.icon
                      className="h-4 w-4 flex-shrink-0"
                      strokeWidth={1.75}
                      style={item.isAI ? { color: "#8A2BE2" } : undefined}
                    />
                    {item.label}
                    {item.isAI && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono-neo"
                        style={{ background: "#8A2BE215", color: "#8A2BE2" }}>
                        AI
                      </span>
                    )}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--accent-mineral)", boxShadow: "0 0 8px var(--accent-mineral)" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 space-y-0.5" style={{ borderTop: "1px solid var(--glass-border)" }}>
        <Link href="/student/settings"
          className="nav-item text-sm hover:bg-white/40"
          style={{ color: "var(--text-dim)" }}>
          <Settings className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          Settings
        </Link>
        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="nav-item w-full text-sm hover:bg-red-50/60"
          style={{ color: "var(--text-dim)" }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
