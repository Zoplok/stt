"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  PlayCircle,
  Plus,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: "#06060f" }}>
      {/* Sidebar */}
      <aside className="flex flex-col w-14 lg:w-[220px] shrink-0 border-r border-white/[0.06]" style={{ background: "#07070e" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-3 lg:px-4 h-14 border-b border-white/[0.06] shrink-0">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <PlayCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="hidden lg:block text-[14px] font-semibold tracking-tight text-white">SubtitleAI</span>
        </div>

        {/* New Project button */}
        <div className="px-2 lg:px-3 pt-4 pb-2 shrink-0">
          <Link
            href="/dashboard?new=1"
            className="flex items-center justify-center lg:justify-start gap-2.5 w-full px-2.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all text-white text-[13px] font-semibold shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:block">New Project</span>
          </Link>
        </div>

        {/* Section label */}
        <div className="hidden lg:block px-4 pt-4 pb-1">
          <span className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.1em]">Menu</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 relative z-10 transition-colors",
                  active ? "text-indigo-400" : "text-white/30 group-hover:text-white/60"
                )} />
                <span className="hidden lg:block relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Keyboard shortcut hint */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-3 mx-2 mb-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <Keyboard className="w-3.5 h-3.5 text-white/20 shrink-0" />
          <span className="text-[11px] text-white/20 leading-tight">Press <kbd className="font-mono bg-white/[0.06] px-1 py-0.5 rounded text-[10px]">?</kbd> for shortcuts</span>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/[0.06] flex items-center justify-center lg:justify-start gap-2.5 shrink-0">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7 ring-1 ring-white/10 rounded-lg",
                avatarImage: "rounded-lg",
              },
            }}
          />
          <span className="hidden lg:block text-[12px] text-white/35 font-medium truncate">My Account</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
