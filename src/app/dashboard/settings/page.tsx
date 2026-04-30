"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { Input } from "@/components/ui/input";

const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;
const TONES = ["Professional", "Friendly", "Enthusiastic"] as const;

export default function DashboardSettingsPage() {
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("English");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [billItems, setBillItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    const response = await fetch("/api/settings");
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error || "Failed to load settings.");
    setKeywords(json.data.keywords || "");
    setLanguage((json.data.language || "English") as (typeof LANGUAGES)[number]);
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
      body: JSON.stringify({ keywords, language, tone, billItems })
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error || "Failed to save settings.");
    setMessage("Settings saved successfully.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Settings</h1>
        <p className="mt-1 font-medium text-slate-500">Configure prompt behavior for AI-generated reviews.</p>
      </div>

      <Card className="rounded-2xl bg-slate-50 p-5">
        <h2 className="text-xl font-bold text-slate-900">Keywords</h2>
        <p className="text-sm text-slate-400">Add at least 2-3 keywords for better ranking.</p>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="service quality, staff behaviour, pricing"
          className="mt-3 h-12 rounded-xl border-slate-300 bg-white"
        />
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5">
        <h2 className="text-xl font-bold text-slate-900">Choose Language</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {LANGUAGES.map((item) => (
            <button
              key={item}
              onClick={() => setLanguage(item)}
              className={`h-10 rounded-xl text-sm font-bold transition ${
                language === item ? "bg-blue-500 text-white shadow-md" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5">
        <h2 className="text-xl font-bold text-slate-900">Default Tone</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TONES.map((item) => (
            <button
              key={item}
              onClick={() => setTone(item)}
              className={`h-10 rounded-xl text-sm font-bold transition ${
                tone === item ? "bg-blue-500 text-white shadow-md" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5">
        <h2 className="text-xl font-bold text-slate-900">Bill Items</h2>
        <p className="text-sm text-slate-400">Add bill items AI will use in reviews.</p>
        <Input
          value={billItems}
          onChange={(e) => setBillItems(e.target.value)}
          placeholder="Enter items (comma separated)"
          className="mt-3 h-12 rounded-xl border-slate-300 bg-white"
        />
      </Card>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}

      <Button onClick={saveSettings} loading={saving || loading} className="h-12 w-full rounded-2xl bg-blue-600 text-base font-bold hover:bg-blue-700">
        Save
      </Button>
    </div>
  );
}