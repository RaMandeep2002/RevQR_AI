"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  LogOut,
  Building2,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, type ComponentType } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  exact?: boolean; // For routes that should match exactly
};

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/businesses", label: "Businesses", icon: Building2 },
    ],
  },
  {
    title: "QR",
    items: [
      { href: "/dashboard/qr-customizer", label: "QR Codes", icon: QrCode },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const [email, setEmail] = useState("??");
  const [initials, setInitials] = useState("??");
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const email = user?.email || "User";
        const name = user.user_metadata?.full_name || user.email || "User";
        const parts = name.split(" ");
        const calculatedInitials =
          parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
        setEmail(email);
        setInitials(calculatedInitials);
      }
    };
    getUser();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  // Helper function to check if a route is active
  const isRouteActive = (item: NavItem) => {
    if (!pathname) return false;
    
    if (item.exact) {
      return pathname === item.href;
    }
    
    // For nested routes, check if pathname starts with the href
    // but handle the case where href is "/dashboard" and pathname is "/dashboard"
    if (item.href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-[280px] transform overflow-hidden
        border-r border-slate-200/50 dark:border-white/5
        bg-white dark:bg-[#0B1120]
        shadow-2xl shadow-slate-200/30 dark:shadow-[0_0_60px_rgba(0,0,0,0.6)]
        transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Ambient Glow Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/5" />
      </div>

      <div className="relative flex h-full flex-col px-4 py-6">
        {/* Header / Logo */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                QReview
              </p>
              <p className="text-[10px] font-medium tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                Owner Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 p-2 backdrop-blur-sm
              text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white
              lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
                        )}

                        <Icon
                          className={`h-5 w-5 transition-all ${
                            isActive
                              ? "text-indigo-600 dark:text-indigo-300"
                              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                          }`}
                        />

                        <span>{item.label}</span>

                        {item.badge && (
                          <span
                            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-200/50 dark:border-white/5 pt-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {email}
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
              text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10
              transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
}