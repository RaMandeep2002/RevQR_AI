"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";

const LANGUAGES = ["English", "Hindi", "Hinglish", "Punglish"] as const;
const TONES = ["Professional", "Friendly", "Enthusiastic"] as const;

export default function DashboardSettingsPage() {
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] =
    useState<(typeof LANGUAGES)[number]>("English");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [billItems, setBillItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  const fetchSettings = async () => {
    setLoading(true);
    const response = await fetch("/api/settings");
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error || "Failed to load settings.");
    setKeywords(json.data.keywords || "");
    setLanguage(
      (json.data.language || "English") as (typeof LANGUAGES)[number],
    );
    setTone((json.data.tone || "Professional") as (typeof TONES)[number]);
    setBillItems(json.data.bill_items || "");
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, language, tone, billItems }),
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error || "Failed to save settings.");
    setMessage("Settings saved successfully.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
          Configure prompt behavior for AI-generated reviews.
        </p>
      </div>

      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Keywords
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Add at least 2-3 keywords for better ranking. (Seprated with comma)
        </p>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="service quality, staff behaviour, pricing"
          className="mt-3 h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Choose Language
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {LANGUAGES.map((item) => (
            <button
              key={item}
              onClick={() => setLanguage(item)}
              className={`h-10 rounded-xl text-sm font-bold transition ${
                language === item
                  ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Default Tone
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TONES.map((item) => (
            <button
              key={item}
              onClick={() => setTone(item)}
              className={`h-10 rounded-xl text-sm font-bold transition ${
                tone === item
                  ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Bill Items
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Add bill items AI will use in reviews.
        </p>
        <Input
          value={billItems}
          onChange={(e) => setBillItems(e.target.value)}
          placeholder="Enter items (comma separated)"
          className="mt-3 h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />
      </Card>

      {error ? (
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {message ? (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-3 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/30">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm font-semibold">{message}</p>
        </div>
      ) : null}

      <Button
        onClick={saveSettings}
        loading={saving || loading}
        className="h-12 w-full rounded-2xl bg-blue-600 text-base font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Save
      </Button>

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
