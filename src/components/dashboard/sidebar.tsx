"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Plug,
  QrCode,
  Settings,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ComponentType } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  href: string; // Keep as string to avoid route type conflicts
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  // { href: "/dashboard/businesses", label: "Businesses", icon: Building2 },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/qr-customizer", label: "QR Customizer", icon: Palette },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }, // Fixed: lowercase 's' in settings
];

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-hidden
  border-r border-slate-200 dark:border-white/10
  bg-white dark:bg-transparent
  dark:bg-gradient-to-b dark:from-[#0F172A] dark:via-[#111827] dark:to-[#020617]
  shadow-xl shadow-slate-200/50 dark:shadow-[0_0_40px_rgba(0,0,0,0.45)]
  backdrop-blur-2xl
  transition-transform duration-300
  lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_35%)]" />

      {/* Bottom glow */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />

      <div className="relative flex h-full flex-col px-5 py-6">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-between">
          {/* <img
            src="/Qreview-logo.png"
            alt="QReview Logo"
            className="h-auto w-32 dark:brightness-0 dark:invert"
          /> */}
          <div className="flex items-center gap-3 text-zinc-100 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-emerald-400 shadow-lg group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 group-hover:to-zinc-400 transition-colors">
              QReview
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2
        text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white
        lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 overflow-hidden
            rounded-2xl px-4 py-3 text-sm font-semibold
            transition-all duration-300
            ${
              active
                ? "bg-indigo-50 dark:bg-transparent dark:bg-gradient-to-r dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-white shadow-sm dark:shadow-lg dark:shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-400/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`}
              >
                {/* Active Glow */}
                {active && (
                  <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_left,rgba(99,102,241,0.25),transparent_70%)]" />
                )}

                <ActiveIcon
                  className={`relative h-5 w-5 transition-transform duration-300 ${
                    active
                      ? "text-indigo-600 dark:text-indigo-300"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:scale-110"
                  }`}
                />

                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-200 dark:border-white/10 pt-6">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl
        px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400
        transition-all duration-300
        hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
