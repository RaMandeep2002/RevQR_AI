"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  Settings,
  Sun,
  Moon,
  User,
  Sparkles,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export function DashboardHeader({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initials, setInitials] = useState("??");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const pathSegments = pathname ? pathname.split("/").filter(Boolean) : [];

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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  const getPageTitle = () => {
    if (pathSegments.length === 0) return "Dashboard";
    const lastSegment = pathSegments[pathSegments.length - 1];
    return (
      lastSegment.charAt(0).toUpperCase() +
      lastSegment.slice(1).replace(/-/g, " ")
    );
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 dark:border-slate-700/50 dark:bg-slate-900/80">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden transition-all"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </motion.button>

        {/* Page Title with Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {pathSegments.length > 1 ? (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block"
                >
                  Dashboard
                </Link>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:block">
                  /
                </span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {getPageTitle()}
                </span>
              </>
            ) : (
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {getPageTitle()}
              </h1>
            )}
          </div>

          {/* Optional: Add a badge or indicator */}
          {pathSegments.length === 1 && pathSegments[0] === "dashboard" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              Live
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            aria-label="Theme selector"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </motion.button>

          <AnimatePresence>
            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-black/5 z-50 dark:border-slate-700 dark:bg-slate-800/95 dark:ring-white/10"
                >
                  <div className="border-b border-slate-100 px-3 py-2 mb-1 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Theme
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTheme("light");
                      setShowThemeMenu(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      theme === "light"
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                    {theme === "light" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-indigo-500 dark:text-indigo-400"
                      >
                        ✓
                      </motion.span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTheme("dark");
                      setShowThemeMenu(false);
                    }}
                    className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-medium transition-all mt-1 ${
                      theme === "dark"
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                    {theme === "dark" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-indigo-500 dark:text-indigo-400"
                      >
                        ✓
                      </motion.span>
                    )}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100 font-bold text-indigo-700 transition-all hover:ring-4 hover:ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:ring-indigo-900/50"
          >
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name || "User"}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-black/5 z-50 dark:border-slate-700 dark:bg-slate-800/95 dark:ring-white/10"
                >
                  {/* User Info */}
                  <div className="border-b border-slate-100 px-3 py-3 mb-1 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                        {user?.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.full_name || "User"}
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {user?.full_name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-indigo-400"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-indigo-400"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <Link
                      href="/dashboard/help"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-indigo-400"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help & Support
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-1 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
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
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </>
                    )}
                  </button>

                  {/* Footer */}
                  <div className="mt-2 border-t border-slate-100 px-3 py-2 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                      QReview v2.0
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
