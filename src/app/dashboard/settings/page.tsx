"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Building2, Moon, Sun } from "lucide-react";
import { Business } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = ["English", "Hindi", "Hinglish", "Punglish"] as const;
const TONES = ["Professional", "Friendly", "Enthusiastic"] as const;

export default function DashboardSettingsPage() {
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] =
    useState<(typeof LANGUAGES)[number]>("English");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [billItems, setBillItems] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [businessForm, setBusinessForm] = useState({
    name: "",
    email: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { theme, setTheme } = useTheme();

  const syncBusinessForm = (business: Business) => {
    setBusinessForm({
      name: business.name,
      email: business.email,
      category: business.category,
      googleBusinessUrl: business.google_business_url,
      location: business.location,
    });
  };

  const fetchSettings = async () => {
    setLoading(true);
    const [settingsResponse, businessResponse] = await Promise.all([
      fetch("/api/settings"),
      fetch("/api/businesses"),
    ]);
    const [settingsJson, businessJson] = await Promise.all([
      settingsResponse.json(),
      businessResponse.json(),
    ]);
    setLoading(false);
    if (!settingsResponse.ok)
      return setError(settingsJson.error || "Failed to load settings.");
    if (!businessResponse.ok)
      return setError(businessJson.error || "Failed to load businesses.");
    setKeywords(settingsJson.data.keywords || "");
    setLanguage(
      (settingsJson.data.language || "English") as (typeof LANGUAGES)[number],
    );
    setTone(
      (settingsJson.data.tone || "Professional") as (typeof TONES)[number],
    );
    setBillItems(settingsJson.data.bill_items || "");

    const nextBusinesses = businessJson.data || [];
    setBusinesses(nextBusinesses);
    if (nextBusinesses.length) {
      setSelectedBusinessId(nextBusinesses[0].id);
      syncBusinessForm(nextBusinesses[0]);
    }
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

  const updateBusinessField = (
    field: keyof typeof businessForm,
    value: string,
  ) => {
    setBusinessForm((current) => ({ ...current, [field]: value }));
  };

  const selectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);
    const business = businesses.find((item) => item.id === businessId);
    if (business) syncBusinessForm(business);
  };

  const saveBusiness = async () => {
    setError("");
    setMessage("");
    if (!selectedBusinessId) return setError("Select a business to update.");
    setSavingBusiness(true);
    const response = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedBusinessId, ...businessForm }),
    });
    const json = await response.json();
    setSavingBusiness(false);
    if (!response.ok)
      return setError(json.error || "Failed to update business.");

    setBusinesses((current) =>
      current.map((business) =>
        business.id === json.data.id ? { ...business, ...json.data } : business,
      ),
    );
    syncBusinessForm(json.data);
    setMessage("Business updated successfully.");
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
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Business Profile
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Update the details used on review pages and QR posters.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Business
            </span>
            {/* <select
              value={selectedBusinessId}
              onChange={(e) => selectBusiness(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50"
            >
              <option value="">Select business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select> */}
            <Select value={selectedBusinessId} onValueChange={selectBusiness}>
              <SelectTrigger className="mt-2 py-6 px-4 w-full rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50">
                <SelectValue placeholder="Select Business" />
              </SelectTrigger>
              <SelectContent className="w-full rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50">
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Input
            value={businessForm.name}
            onChange={(e) => updateBusinessField("name", e.target.value)}
            placeholder="Business name"
            className="h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          <Input
            value={businessForm.email}
            onChange={(e) => updateBusinessField("email", e.target.value)}
            placeholder="Business email"
            type="email"
            className="h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          <Input
            value={businessForm.category}
            onChange={(e) => updateBusinessField("category", e.target.value)}
            placeholder="Category"
            className="h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          <Input
            value={businessForm.location}
            onChange={(e) => updateBusinessField("location", e.target.value)}
            placeholder="Location"
            className="h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          <Input
            value={businessForm.googleBusinessUrl}
            onChange={(e) =>
              updateBusinessField("googleBusinessUrl", e.target.value)
            }
            placeholder="Google Business URL"
            type="url"
            className="h-12 rounded-xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 md:col-span-2"
          />
        </div>

        <Button
          onClick={saveBusiness}
          loading={savingBusiness || loading}
          className="mt-4 h-11 rounded-xl bg-blue-600 px-5 font-bold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Update Business
        </Button>
      </Card>

      <Card className="rounded-2xl bg-slate-50 p-5 dark:bg-[#0B1739] border-[#343B4F]/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Keywords
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Add at least 2-3 keywords for better ranking.
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
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {message}
        </p>
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
