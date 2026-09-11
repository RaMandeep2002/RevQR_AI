"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, LockKeyhole, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    // The server checks the allowlist. This prevents a valid customer account
    // from being treated as an admin just because it can authenticate.
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    if (!response.ok) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This account does not have administrator access.");
      return;
    }

    router.replace(searchParams.get("redirectedFrom") || "/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-emerald-400">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-950">QReview</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Admin console</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Administrator sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Use your separate admin credentials to access platform-wide data.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Admin email
            <Input className="h-12 rounded-xl" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Password
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input className="h-12 rounded-xl pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <Button className="h-12 w-full rounded-xl bg-slate-950 hover:bg-slate-800" loading={loading} type="submit">Sign in to admin</Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">Customer access is available at <a className="font-semibold text-emerald-700" href="/auth">/auth</a>.</p>
      </div>
    </main>
  );
}
