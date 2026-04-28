"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignIn = async () => {
    setLoadingSignIn(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingSignIn(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  const handleSignUp = async () => {
    setLoadingSignUp(true);
    setError("");
    setSuccess("");
    const { error, data } = await supabase.auth.signUp({ email, password });
    setLoadingSignUp(false);
    if (error) return setError(error.message);
    
    if (data?.user?.identities?.length === 0) {
      setError("This email is already registered. Please sign in instead.");
    } else {
      setSuccess("Please check your email to confirm your registration!");
    }
  };


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
          <div className="max-w-md">
            <span className="inline-flex items-center rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-brand-500/30">
              New Feature
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight text-white">
              Revolutionizing Customer Feedback with AI.
            </h2>
            <p className="mt-4 text-lg font-medium text-brand-100/90">
              Generate intelligent review responses and build a stellar online reputation in minutes, not hours.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form - Strict 50% */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Branding */}
          <div className="mb-12 flex items-center gap-2 lg:justify-start justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <span className="text-xl font-black">R</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">RevQR AI</span>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Business Access</h1>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400" htmlFor="email">
                  Email Address
                </label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400" htmlFor="password">
                    Password
                  </label>
                </div>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">!</div>
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600 border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {success}
              </div>
            )}

            <div className="mt-8 grid gap-4">
              <Button 
                onClick={handleSignIn} 
                loading={loadingSignIn} 
                disabled={loadingSignUp}
                className="h-14 w-full text-base font-bold bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xl shadow-slate-900/10"
              >
                Sign In to Account
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 font-bold text-slate-400 tracking-widest">or</span>
                </div>
              </div>
              <Button 
                onClick={handleSignUp} 
                loading={loadingSignUp} 
                disabled={loadingSignIn} 
                className="h-14 w-full text-base font-bold text-slate-900 border-2 border-slate-200 hover:border-brand-50 rounded-xl transition-all"
              >
                Register New Business
              </Button>
            </div>

            <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              © 2024 <span className="text-brand-600">RevQR AI</span> System
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}



