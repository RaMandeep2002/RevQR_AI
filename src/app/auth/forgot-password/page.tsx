"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${appUrl}/auth/reset-password`
    });

    setLoading(false);
    if (error) return setError(error.message);
    setSuccess("Password reset email sent. Please check your inbox.");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your account email and we will send you a password reset link.</p>

        <form className="mt-6 space-y-4" onSubmit={handleResetRequest}>
          <Input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/auth" className="font-semibold text-brand-700 hover:text-brand-800">
            Back to Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
