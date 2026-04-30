"use client";

import { useEffect, useState } from "react";

import { LogOut, Menu, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [initials, setInitials] = useState("??");
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "User";
        const parts = name.split(" ");
        const calculatedInitials = parts.length > 1 
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
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex flex-1 items-center gap-4">
        <button onClick={onOpenSidebar} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-full max-w-md md:block">
          <img src="/Qreview-logo.png" alt="QReview Logo" className="h-auto w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-brand-100 font-black text-brand-700 transition-all hover:ring-4 hover:ring-brand-50"
          >
            {initials}
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
                </div>
                
                <Link 
                    // @ts-ignore Next.js route type checking is too strict
                  href="/dashboard/settings" 
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-brand-700 transition-all"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-1"
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


