import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Building2, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin-auth";
import { AdminSignOut } from "@/components/admin-sign-out";

async function countRows(table: string) {
  const { count } = await adminClient.from(table).select("id", { count: "exact", head: true });
  return count || 0;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!isAdminUser(user)) redirect("/auth");

  const [{ data: users }, businesses, reviews, subscriptions] = await Promise.all([
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    countRows("businesses"),
    countRows("reviews"),
    countRows("subscriptions"),
  ]);

  const stats = [
    { label: "Registered users", value: users?.users.length || 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Businesses", value: businesses, icon: Building2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Reviews collected", value: reviews, icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
    { label: "Subscriptions", value: subscriptions, icon: Activity, color: "text-purple-600 bg-purple-50" },
  ];

  const recentUsers = (users?.users || []).slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950"><ShieldCheck className="h-6 w-6" /></div>
            <div><p className="text-2xl font-black">Admin console</p><p className="text-sm text-slate-400">Platform overview and account monitoring</p></div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400"><span>{user.email}</span><AdminSignOut /></div>
        </header>

        <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><p className="text-3xl font-black">{value.toLocaleString()}</p><p className="mt-1 text-sm text-slate-400">{label}</p></div>)}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><h2 className="font-bold">Recent accounts</h2><p className="mt-1 text-sm text-slate-400">Latest users registered in Supabase Auth</p></div><Link href="/dashboard" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">Customer dashboard →</Link></div>
          <div className="divide-y divide-white/10">
            {recentUsers.length ? recentUsers.map((account) => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="font-medium">{account.email || "No email"}</p><p className="text-xs text-slate-500">{account.id}</p></div><div className="text-right text-xs text-slate-400"><p>{account.last_sign_in_at ? `Last sign in ${new Date(account.last_sign_in_at).toLocaleDateString()}` : "Never signed in"}</p><p className="mt-1">{account.created_at ? new Date(account.created_at).toLocaleDateString() : ""}</p></div></div>) : <p className="px-6 py-8 text-sm text-slate-400">No users found.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
