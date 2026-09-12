"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  LogOut,
  Building2,
  BarChart3,
  User,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { PlanName, FeatureName } from "@/types/subscription";
import { Lock } from "lucide-react";

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
  exact?: boolean;
  requiredPlan?: PlanName;
  requiredFeature?: FeatureName;
};

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: BarChart3,
        requiredFeature: "basic_analytics",
      },
      { href: "/dashboard/businesses", label: "Businesses", icon: Building2 },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: User },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initials, setInitials] = useState("??");
  const [isClient, setIsClient] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [features, setFeatures] = useState<any>(null);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);

  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);

    const fetchSubscriptionFeatures = async () => {
      try {
        const response = await fetch("/api/subscription");
        const data = await response.json();
        if (data.success) {
          setFeatures(data.subscription?.features || data.plan?.features);
        }
      } catch (error) {
        console.error("Error fetching subscription features:", error);
      } finally {
        setIsLoadingFeatures(false);
      }
    };
    fetchSubscriptionFeatures();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (authUser) {
          const userData: UserProfile = {
            id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name || "",
            avatar_url: authUser.user_metadata?.avatar_url || "",
          };
          setUser(userData);

          // Calculate initials
          const name = userData.full_name || userData.email || "User";
          const parts = name.split(" ");
          const calculatedInitials =
            parts.length > 1
              ? (parts[0][0] + parts[1][0]).toUpperCase()
              : name.substring(0, 2).toUpperCase();
          setInitials(calculatedInitials);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
  }, [supabase.auth]);

  const signOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  const isRouteActive = (item: NavItem) => {
    if (!pathname) return false;

    if (item.exact) {
      return pathname === item.href;
    }

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
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <QrCode className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                DemoQR
              </p>
              <p className="text-[10px] font-medium tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                Owner Dashboard
              </p>
            </div>
          </Link>

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
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item);

                  const hasAccess = (() => {
                    if (isLoadingFeatures) return true;
                    if (!features) return true;
                    console.log(features);

                    if (
                      item.label === "Analytics" &&
                      (!features.analytics || features.analytics === "None")
                    )
                      return false;
                    if (
                      item.label === "Businesses" &&
                      (!features.maxBusinesses || features.maxBusinesses === 2)
                    )
                      return false;
                    if (
                      item.label === "Reviews" &&
                      (!features.reviewScanLimit ||
                        features.reviewScanLimit === 0)
                    )
                      return false;

                    return true;
                  })();

                  if (!hasAccess) {
                    return (
                      <div
                        key={item.href}
                        className="mb-1 group relative flex flex-col justify-center rounded-xl px-3 py-2 text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                            LOCKED
                          </span>
                        </div>
                        <p className="mt-1 hidden text-xs leading-tight text-amber-600 dark:text-amber-400 group-hover:block transition-all">
                          Upgrade plan to access
                        </p>
                      </div>
                    );
                  }

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
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-500 dark:bg-indigo-400"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
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
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="relative">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <button
            onClick={signOut}
            disabled={isSigningOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
              text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}