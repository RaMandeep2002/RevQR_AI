"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import PasswordInput, {
  validatePassword,
  ValidationResult,
} from "./paswordVaildation";
import { QrCode, Moon, Sun } from "lucide-react";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (systemPrefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Check session on mount and set up auto-refresh
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        setIsSessionValid(false);
        return;
      }

      if (session) {
        // Check if token is expired or about to expire (within 5 minutes)
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (timeUntilExpiry > 0) {
          setIsSessionValid(true);
          
          // If token expires in less than 5 minutes, refresh it
          if (timeUntilExpiry < fiveMinutes) {
            await refreshSession();
          }
          
          // Redirect to dashboard if session is valid
          router.push("/onboarding");
          return;
        } else {
          // Session expired, clear it
          await supabase.auth.signOut();
          setIsSessionValid(false);
        }
      } else {
        setIsSessionValid(false);
      }
    };

    checkSession();

    // Set up session refresh interval (every 15 minutes)
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await refreshSession();
      }
    }, 15 * 60 * 1000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsSessionValid(true);
          router.push("/onboarding");
        } else if (event === 'SIGNED_OUT') {
          setIsSessionValid(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was automatically refreshed
          console.log('Token refreshed successfully');
        }
      }
    );

    return () => {
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // Refresh session function
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        // If refresh fails, sign out
        await supabase.auth.signOut();
        setIsSessionValid(false);
        return false;
      }
      if (data.session) {
        console.log("Session refreshed successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session refresh error:", error);
      return false;
    }
  };

  // Auto-login with stored credentials
  const attemptAutoLogin = async () => {
    try {
      const storedEmail = localStorage.getItem("user_email");
      const storedPassword = localStorage.getItem("user_password");
      
      if (storedEmail && storedPassword) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: storedPassword,
        });
        
        if (!error && data.session) {
          // Set a reminder to refresh token (1 day before expiry)
          const expiresAt = new Date(data.session.expires_at! * 1000);
          const refreshTime = new Date(expiresAt.getTime() - 24 * 60 * 60 * 1000);
          
          const timeUntilRefresh = refreshTime.getTime() - Date.now();
          if (timeUntilRefresh > 0) {
            setTimeout(async () => {
              await refreshSession();
            }, timeUntilRefresh);
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Auto-login error:", error);
      return false;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "register" && (!validation || !validation.isValid)) {
      setError(
        "Please enter a valid password (minimum 8 characters with uppercase and lowercase letters)",
      );
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      
      if (error) {
        return setError(error.message);
      }

      // Store credentials for auto-login (encrypted in production)
      if (data.session) {
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_password", password);
        
        // Store session expiry info
        const expiresAt = new Date(data.session.expires_at! * 1000);
        localStorage.setItem("session_expires_at", expiresAt.toISOString());
        
        // Set a timer to refresh token 1 day before expiry
        const refreshTime = new Date(expiresAt.getTime() - 24 * 60 * 60 * 1000);
        const timeUntilRefresh = refreshTime.getTime() - Date.now();
        
        if (timeUntilRefresh > 0) {
          setTimeout(async () => {
            await refreshSession();
          }, timeUntilRefresh);
        }
      }
      
      router.push("/onboarding");
      router.refresh();
    } else {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      setLoading(false);
      
      if (error) {
        return setError(error.message);
      }

      if (data?.user?.identities?.length === 0) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        // Store credentials for auto-login after registration
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_password", password);
        
        setSuccess("Successfully registered! Redirecting to setup...");
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      }
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (mode === "register") {
      setValidation(validatePassword(newPassword));
    }
  };

  const handleModeSwitch = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setPassword("");
    setValidation(null);
  };

  // Handle logout with cleanup
  const handleLogout = async () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_password");
    localStorage.removeItem("session_expires_at");
    await supabase.auth.signOut();
    setIsSessionValid(false);
    router.push("/auth");
  };

  // If still checking session, show loading state
  if (isSessionValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If session is valid and user is already logged in, redirect to dashboard
  if (isSessionValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-lg"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5 text-slate-700" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-400" />
        )}
      </button>

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
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Branding */}
          <div className="mb-12 flex items-center gap-2 lg:justify-start justify-center">
            <div className="flex items-center gap-3 text-zinc-100 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-700 dark:to-zinc-800 border border-white/10 text-emerald-400 shadow-lg group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 group-hover:to-zinc-400 transition-colors">
                DemoQR
              </span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">
              {mode === "login"
                ? "Enter your credentials to access your dashboard."
                : "Register your business and start collecting reviews."}
            </p>
          </div>

          <form className="mt-10" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors duration-300"
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
                  className="h-12 rounded-xl border border-slate-400 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 px-4 transition-all focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-500/10 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors duration-300"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  {mode === "login" && (
                    <Link
                      href={`/auth/forgot-password`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-300"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>

                <PasswordInput
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  showValidation={mode === "register"}
                />

                {mode === "register" && password && !validation?.isValid && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-top-1">
                    <p className="font-semibold mb-1">Password must contain:</p>
                    <ul className="space-y-0.5">
                      <li
                        className={`flex items-center gap-1.5 ${
                          validation?.isValidLength
                            ? "text-green-600 dark:text-green-400 line-through"
                            : ""
                        }`}
                      >
                        <span>{validation?.isValidLength ? "✓" : "○"}</span>
                        At least 8 characters
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${
                          validation?.hasUpperCase
                            ? "text-green-600 dark:text-green-400 line-through"
                            : ""
                        }`}
                      >
                        <span>{validation?.hasUpperCase ? "✓" : "○"}</span>
                        Uppercase letter (A-Z)
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${
                          validation?.hasLowerCase
                            ? "text-green-600 dark:text-green-400 line-through"
                            : ""
                        }`}
                      >
                        <span>{validation?.hasLowerCase ? "✓" : "○"}</span>
                        Lowercase letter (a-z)
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 dark:bg-red-950/50 p-4 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 dark:bg-red-500 text-white text-[10px] font-bold">
                  !
                </div>
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 text-white">
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
              <Button
                type="submit"
                loading={loading}
                disabled={
                  mode === "register" &&
                  password.length > 0 &&
                  !validation?.isValid
                }
                className="h-14 w-full text-base font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-slate-900 rounded-xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-slate-200/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "login"
                  ? "Sign In to Account"
                  : "Register Your Account"}
              </Button>
            </div>

            <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("register")}
                    className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-300"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-300"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>

            <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-600 transition-colors duration-300">
              © 2026 <span className="text-brand-600 dark:text-brand-400">DemoQR</span> System
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}