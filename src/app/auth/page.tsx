"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
// import { Chrome } from "lucide-react";
// import Image from "next/image";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error, data } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(error.message);

      if (data?.user?.identities?.length === 0) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setSuccess("Please check your email to confirm your registration!");
      }
    }
  };

  // const handleGoogleAuth = async () => {
  //   setLoading(true);
  //   setError("");
  //   setSuccess("");
  //   const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${appUrl}/dashboard`
  //     }
  //   });
  //   setLoading(false);
  //   if (error) setError(error.message);
  // };

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left Side: Image Content - Strict 50% */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80"
          alt="Modern workspace"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/80 via-brand-900/40 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 z-10">
          <div className="max-w-md p-10 rounded-[2.5rem] bg-slate-950/20 backdrop-blur-xl border border-white/10 shadow-2xl">
            <span className="inline-flex items-center rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-brand-500/30">
              New Feature
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight text-white">
              Revolutionizing Customer Feedback with AI.
            </h2>
            <p className="mt-4 text-lg font-medium text-brand-100/90">
              Generate intelligent review responses and build a stellar online
              reputation in minutes, not hours.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form - Strict 50% */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Branding */}
          <div className="mb-12 flex items-center gap-2 lg:justify-start justify-center">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <span className="text-xl font-black">Q</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              QReview
            </span> */}
            <img
              src="/Qreview-logo.png"
              alt="QReview Logo"
              className="h-auto w-64"
            />


          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {mode === "login"
                ? "Enter your credentials to access your dashboard."
                : "Register your business and start collecting reviews."}
            </p>
          </div>

          <form className="mt-10" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  {mode === "login" && (
                    <Link
                      // @ts-ignore Next.js route type checking is too strict
                      href="/auth/forgot-password"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                  !
                </div>
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600 border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {success}
              </div>
            )}

            <div className="mt-8 grid gap-4">
              {/* <Button
                type="button"
                onClick={handleGoogleAuth}
                loading={loading}
                className="h-12 w-full rounded-xl border border-slate-200  text-sm font-bold text-black"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button> */}
              <Button
                type="submit"
                loading={loading}
                className="h-14 w-full text-base font-bold bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xl shadow-slate-900/10"
              >
                {mode === "login" ? "Sign In to Account" : "Register Business"}
              </Button>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}

                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-bold text-brand-600 hover:text-brand-700"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-bold text-brand-600 hover:text-brand-700"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>

            <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              © 2026 <span className="text-brand-600">QReview</span> System
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
