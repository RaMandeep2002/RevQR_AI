"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);

    setSuccess("Password updated successfully. Redirecting to sign in...");
    setTimeout(() => {
      router.push("/auth");
      router.refresh();
    }, 1200);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
        <p className="mt-2 text-sm text-slate-600">Use the link from your email, then set a new password here.</p>

        <form className="mt-6 space-y-4" onSubmit={handleUpdatePassword}>
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <Button type="submit" loading={loading} className="w-full">
            Update Password
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          <Link href="/auth" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
