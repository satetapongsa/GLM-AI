"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useUIStore } from "@/lib/store/useUIStore";
import {
  User,
  Settings,
  Sun,
  Moon,
  Laptop,
  Keyboard,
  LogOut,
  LogIn,
  ChevronRight,
} from "lucide-react";

export function UserProfileMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { setActiveTab } = useUIStore();
  const { user, isAuthenticated, openLogoutConfirm, openAuthModal } = useAuthStore();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const themeIcon =
    theme === "dark" ? (
      <Moon className="h-4 w-4 text-blue-400" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4 text-amber-500" />
    ) : (
      <Laptop className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
    );

  const dropdownItems: DropdownItem[] = [
    {
      id: "account",
      label: "บัญชีผู้ใช้",
      icon: <User className="h-4 w-4" />,
      onClick: () => setActiveTab("settings"),
    },
    {
      id: "settings",
      label: "การตั้งค่าระบบ",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => setActiveTab("settings"),
    },
    {
      id: "theme",
      label: `ธีม (${theme === "dark" ? "มืด" : theme === "light" ? "สว่าง" : "ตามระบบ"})`,
      icon: themeIcon,
      onClick: cycleTheme,
    },
    {
      id: "shortcuts",
      label: "คีย์ลัด (Shortcuts)",
      icon: <Keyboard className="h-4 w-4" />,
      onClick: () => setActiveTab("settings"),
      dividerBefore: true,
    },
    {
      id: "signout",
      label: "ออกจากระบบ",
      icon: <LogOut className="h-4 w-4 text-red-500" />,
      destructive: true,
      onClick: () => openLogoutConfirm(),
      dividerBefore: true,
    },
  ];

  // If user is NOT logged in, show prominent Sign-In CTA
  if (!isAuthenticated || !user) {
    if (collapsed) {
      return (
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="flex items-center justify-center p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
          title="เข้าสู่ระบบ / สมัครสมาชิก"
        >
          <LogIn className="h-4 w-4" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="flex items-center justify-between w-full p-2.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-500 dark:text-blue-400 transition-all cursor-pointer group active:scale-[0.98]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <LogIn className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              เข้าสู่ระบบ
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              บันทึกประวัติการแชท
            </span>
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  // When user is authenticated, show their OWN profile
  if (collapsed) {
    return (
      <Dropdown
        trigger={
          <div
            className="flex items-center justify-center p-1 rounded-xl hover:bg-[hsl(var(--sidebar-hover))] transition-colors cursor-pointer"
            title={`${user.name} (${user.email})`}
          >
            <Avatar fallback={user.name ? user.name.charAt(0).toUpperCase() : "U"} variant="user" size="sm" />
          </div>
        }
        items={dropdownItems}
        align="left"
        width="w-60"
      />
    );
  }

  return (
    <Dropdown
      trigger={
        <div className="flex items-center justify-between w-full p-2 rounded-2xl hover:bg-[hsl(var(--sidebar-hover))] transition-colors cursor-pointer group border border-transparent hover:border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar fallback={user.name ? user.name.charAt(0).toUpperCase() : "U"} variant="user" size="sm" />
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-[hsl(var(--foreground))] truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                {user.email}
              </span>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-transform group-hover:translate-x-0.5" />
        </div>
      }
      items={dropdownItems}
      align="right"
      width="w-60"
      className="w-full"
    />
  );
}
