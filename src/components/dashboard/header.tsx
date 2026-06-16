"use client";

import { useEffect, useState } from "react";
import { LogOut, Menu, Settings, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export function DashboardHeader({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const [initials, setInitials] = useState("??");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "User";
        const parts = name.split(" ");
        const calculatedInitials =
          parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
        setInitials(calculatedInitials);
      }
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <header className="flex h-20 shrink-0 items-center justify-between bg-white px-8 dark:border-slate-700 dark:bg-transparent">
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Theme selector"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          {showThemeMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowThemeMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200 dark:border-slate-700 dark:bg-slate-800 dark:ring-white/10">
                <div className="border-b border-slate-50 px-3 py-2 mb-1 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Theme
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setTheme("light");
                    setShowThemeMenu(false);
                  }}
                  className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    theme === "light"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                  {theme === "light" && (
                    <span className="text-brand-500 dark:text-brand-400">✓</span>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setTheme("dark");
                    setShowThemeMenu(false);
                  }}
                  className={`flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-bold transition-all mt-1 ${
                    theme === "dark"
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                  {theme === "dark" && (
                    <span className="text-brand-500 dark:text-brand-400">✓</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-brand-100 font-black text-brand-700 transition-all hover:ring-4 hover:ring-brand-50 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300 dark:hover:ring-brand-900/50"
          >
            {initials}
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200 dark:border-slate-700 dark:bg-slate-800 dark:ring-white/10">
                <div className="border-b border-slate-50 px-3 py-2 mb-1 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Account
                  </p>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-all dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-brand-300"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-1 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}