"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminSignOut() {
  const router = useRouter();
  return <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-semibold text-slate-300 hover:bg-white/10" onClick={async () => { await createClient().auth.signOut(); router.replace("/admin/login"); router.refresh(); }}><LogOut className="h-4 w-4" /> Sign out</button>;
}
