"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Settings, Plus, Captions } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-14 shrink-0 flex-col border-r border-border bg-sidebar lg:w-[210px]">

        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3 lg:px-4">
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-card">
            <Captions className="h-3.5 w-3.5 text-foreground" />
            <span className="rec-dot absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <span className="hidden font-mono text-[11px] font-semibold tracking-[0.18em] text-foreground lg:block">
            SUBTITLE.AI
          </span>
        </div>

        {/* New project */}
        <div className="shrink-0 p-2 lg:p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="w-full" asChild>
                <Link href="/dashboard?new=1">
                  <Plus />
                  <span className="hidden lg:inline">New Project</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">New Project</TooltipContent>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-2 pt-2 lg:px-3">
          <span className="mb-1 hidden px-1 font-mono text-[9px] tracking-[0.25em] text-muted-foreground/60 lg:block">
            MENU
          </span>
          {navItems.map((nav) => {
            const active = pathname === nav.href || (nav.href !== "/dashboard" && pathname.startsWith(nav.href));
            return (
              <Tooltip key={nav.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={nav.href}
                    className={cn(
                      "flex items-center gap-2.5 border border-transparent px-2.5 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "border-border bg-card text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <nav.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                    <span className="hidden lg:block">{nav.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{nav.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Status row */}
        <div className="hidden shrink-0 items-center gap-2 border-t border-border px-4 py-3 lg:flex">
          <span className="rec-dot h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">ENGINES ONLINE</span>
        </div>

        {/* User */}
        <div className="flex shrink-0 items-center justify-center gap-2.5 border-t border-border px-3 py-3 lg:justify-start">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7 ring-1 ring-border rounded-none",
                avatarImage: "rounded-none",
              },
            }}
          />
          <span className="hidden truncate text-[12px] font-medium text-muted-foreground lg:block">
            My Account
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
