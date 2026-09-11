"use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui";
// import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";


// const TONES = ["Professional", "Friendly", "Enthusiastic"] as const;

export default function DashboardSettingsPage() {
  // const [keywords, setKeywords] = useState("");
  // const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  // const [loading, setLoading] = useState(false);
  // const [saving, setSaving] = useState(false);
  // const [message, setMessage] = useState("");
  // const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  // const fetchSettings = async () => {
  //   setLoading(true);
  //   const response = await fetch("/api/settings");
  //   const json = await response.json();
  //   setLoading(false);
  //   if (!response.ok) return setError(json.error || "Failed to load settings.");
  //   setKeywords(json.data.keywords || "");
  //   setTone((json.data.tone || "Professional") as (typeof TONES)[number]);
  // };

  // useEffect(() => {
  //   fetchSettings();
  // }, []);

  // const saveSettings = async () => {
  //   setError("");
  //   setMessage("");
  //   setSaving(true);
  //   const response = await fetch("/api/settings", {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ keywords, tone }),
  //   });
  //   const json = await response.json();
  //   setSaving(false);
  //   if (!response.ok) return setError(json.error || "Failed to save settings.");
  //   setMessage("Settings saved successfully.");
  // };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Settings
        </h1>
        {/* <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
          Configure prompt behavior for AI-generated reviews.
        </p> */}
      </div>
       
      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Theme
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current: <span className="font-semibold capitalize">{theme}</span>{" "}
              mode
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </div>
        {theme === "dark" && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            🌙 Dark mode is active - better for low light environments
          </p>
        )}
        {theme === "light" && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            ☀️ Light mode is active - better for bright environments
          </p>
        )}
      </Card>
    </div>
  );
}
