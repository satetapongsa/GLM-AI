"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { useUIStore } from "@/lib/store/useUIStore";
import {
  User,
  Settings,
  Sun,
  Moon,
  Laptop,
  Keyboard,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function UserProfileMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { setActiveTab } = useUIStore();
  const user = BRAND_CONFIG.defaultUser;

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
      onClick: () => alert("คุณอยู่ในโหมด Local GML Workspace"),
      dividerBefore: true,
    },
  ];

  if (collapsed) {
    return (
      <Dropdown
        trigger={
          <div
            className="flex items-center justify-center p-1 rounded-xl hover:bg-[hsl(var(--sidebar-hover))] transition-colors cursor-pointer"
            title={`${user.name} (${user.email})`}
          >
            <Avatar fallback="U" variant="user" size="sm" />
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
            <Avatar fallback="U" variant="user" size="sm" />
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
