"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  PlayCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col w-16 lg:w-60 shrink-0 border-r border-white/5 glass">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-accent-sm">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <span className="hidden lg:block text-sm font-semibold tracking-tight">SubtitleAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                  active
                    ? "text-white bg-white/8"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-indigo-600/15 border border-indigo-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("w-4.5 h-4.5 shrink-0 relative z-10", active && "text-indigo-400")} />
                <span className="hidden lg:block relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* New Project */}
        <div className="p-2 border-t border-white/5">
          <Link
            href="/dashboard?new=1"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <Plus className="w-4.5 h-4.5 shrink-0" />
            <span className="hidden lg:block">New Project</span>
          </Link>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/5 flex items-center justify-center lg:justify-start gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 ring-1 ring-white/10",
              },
            }}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
