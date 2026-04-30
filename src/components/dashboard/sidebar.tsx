"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, MessageSquare, Settings, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ComponentType } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  href: string;  // Keep as string to avoid route type conflicts
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/businesses", label: "Businesses", icon: Building2 },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings } // Fixed: lowercase 's' in settings
];

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-10 flex items-center justify-between px-2">
          <img src="/Qreview-logo.png" alt="QReview Logo" className="h-auto w-28" />
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                // @ts-expect-error Next.js route type checking is too strict
                href={item.href} // Type assertion to bypass strict route checking
                onClick={onClose}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <ActiveIcon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-6">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}