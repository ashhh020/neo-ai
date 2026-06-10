"use client";

import { Bell, Search, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store/uiStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuthStore } from "@/lib/store/authStore";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
}

export function TopBar({ title, showSearch = true }: TopBarProps) {
  const { user, logout } = useAuthStore();
  const { openMobileNav } = useUIStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="h-14 sticky top-0 z-40 flex items-center px-4 gap-4"
      style={{ background: "var(--glass-base)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", borderBottom: "1px solid var(--glass-border)" }}>
      {/* Hamburger — mobile only */}
      <button
        onClick={openMobileNav}
        className="md:hidden p-2 -ml-1 rounded-lg hover:bg-white/40 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" style={{ color: "var(--text-obsidian)" }} />
      </button>

      {title && (
        <h1 className="text-base font-semibold font-poppins hidden sm:block">{title}</h1>
      )}

      {showSearch && (
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 bg-muted border-0 text-sm focus-visible:ring-1"
            />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:block max-w-24 truncate">{user?.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
