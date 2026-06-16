"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, WandSparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Business } from "@/types";
import { applyLogoToQr } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Template = {
  id: string;
  name: string;
  dark: string;
  light: string;
  borderClass: string;
  cardClass: string;
};

const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    dark: "#111827",
    light: "#ffffff",
    borderClass: "rounded-2xl border-8 border-white",
    cardClass: "bg-white",
  },
  {
    id: "ocean",
    name: "Ocean",
    dark: "#0a4a6a",
    light: "#e6f6ff",
    borderClass: "rounded-[1.75rem] border-8 border-cyan-100",
    cardClass: "bg-cyan-50",
  },
  {
    id: "sunset",
    name: "Sunset",
    dark: "#7a2e0e",
    light: "#fff7ed",
    borderClass: "rounded-[1.75rem] border-8 border-orange-100",
    cardClass: "bg-orange-50",
  },
  {
    id: "mono-soft",
    name: "Mono Soft",
    dark: "#334155",
    light: "#f8fafc",
    borderClass: "rounded-[1.75rem] border-8 border-slate-100",
    cardClass: "bg-slate-50",
  },
  // {
  //   id: "midnight",
  //   name: "Midnight",
  //   dark: "#020617",
  //   light: "#0F172A",
  //   borderClass:
  //     "rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black",
  //   cardClass: "bg-slate-50",
  // },

  // // Purple Dark Theme
  // {
  //   id: "aurora",
  //   name: "Aurora",
  //   dark: "#140F2D",
  //   light: "#1E1B4B",
  //   borderClass:
  //     "rounded-[1.75rem] border border-violet-500/20 bg-gradient-to-br from-violet-950 via-purple-950 to-slate-950",
  //  cardClass: "bg-slate-50",
  // },
];

export default function QrCustomizerPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [saltValue, setSaltValue] = useState("v1");
  const [darkColor, setDarkColor] = useState("#111827");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [templateId, setTemplateId] = useState("classic");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoSizePercent, setLogoSizePercent] = useState(22);
  const [logoShape, setLogoShape] = useState<"square" | "rounded" | "circle">(
    "rounded",
  );
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) || templates[0],
    [templateId],
  );

  useEffect(() => {
    const loadBusinesses = async () => {
      const res = await fetch("/api/businesses");
      const json = await res.json();
      setBusinesses(json.data || []);
      if (json.data?.length) setSelectedBusinessId(json.data[0].id);
    };
    loadBusinesses();
  }, []);

  useEffect(() => {
    const loadCustomization = async () => {
      if (!selectedBusinessId) return;
      const res = await fetch(
        `/api/qr-customizations?businessId=${selectedBusinessId}`,
      );
      const json = await res.json();
      if (!res.ok) return;
      setDarkColor(json.data.dark_color || "#111827");
      setLightColor(json.data.light_color || "#ffffff");
      setSaltValue(json.data.salt_value || "v1");
      setTemplateId(json.data.template_id || "classic");
      setLogoDataUrl(json.data.logo_data_url || "");
      setLogoSizePercent(Number(json.data.logo_size_percent || 22));
      setLogoShape(
        (json.data.logo_shape || "rounded") as "square" | "rounded" | "circle",
      );
    };
    loadCustomization();
  }, [selectedBusinessId]);

  useEffect(() => {
    const generate = async () => {
      if (!selectedBusinessId) {
        setQrDataUrl("");
        return;
      }
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${base}/review/${selectedBusinessId}?salt=${encodeURIComponent(saltValue || "v1")}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 520,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      const withLogo = await applyLogoToQr({
        qrDataUrl: dataUrl,
        logoDataUrl,
        logoSizePercent,
        logoShape,
      });
      setQrDataUrl(withLogo);
      setLoading(false);
    };
    generate();
  }, [
    selectedBusinessId,
    saltValue,
    darkColor,
    lightColor,
    logoDataUrl,
    logoSizePercent,
    logoShape,
  ]);

  const applyTemplate = (template: Template) => {
    setTemplateId(template.id);
    setDarkColor(template.dark);
    setLightColor(template.light);
  };

  const saveCustomization = async () => {
    if (!selectedBusinessId) return;
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/qr-customizations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: selectedBusinessId,
        darkColor,
        lightColor,
        saltValue,
        templateId,
        logoDataUrl,
        logoSizePercent,
        logoShape,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error || "Failed to save customization.");
    setMessage("Customization saved.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          QR Customizer
        </h1>
        <p className="mt-1 font-medium text-slate-500 dark:text-slate-300">
          Customize QR color, design, and use pre-generated templates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-5 lg:col-span-2 bg-white dark:bg-[#0B1739] border-[#343B4F]/80">
          <div className="grid gap-4 md:grid-cols-1">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                Business
              </p>

              <Select
                value={selectedBusinessId}
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger className="h-13 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-[#0B1739] dark:text-white">
                  <SelectValue placeholder="Select Business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                QR Dark Color
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#0B1739]"
                />
                <Input
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-11 rounded-xl dark:border-slate-700 dark:bg-[#0B1739] dark:text-white"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                QR Light Color
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#0B1739]"
                />
                <Input
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-11 rounded-xl dark:border-slate-700 dark:bg-[#0B1739] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
              Pre-generated QR Templates
            </p>
            <div className="grid gap-3 md:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    templateId === template.id
                      ? "border-brand-500 bg-brand-50 hover:bg-brand-100 dark:border-brand-400 dark:bg-[#0B1739] dark:hover:bg-slate-800"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B1739] dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {template.name}
                    </p>
                    <WandSparkles className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex gap-2">
                    <span
                      className="h-5 w-5 rounded-full border dark:border-slate-600"
                      style={{ backgroundColor: template.dark }}
                    />
                    <span
                      className="h-5 w-5 rounded-full border dark:border-slate-600"
                      style={{ backgroundColor: template.light }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
              Center Logo (QRFY style)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-9 bg-slate-900 px-4 text-xs font-bold hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => setLogoDataUrl("/Qreview-logo.png")}
                type="button"
              >
                Use QReview Logo
              </Button>
              {/* <Button
                className="h-9 bg-slate-100 px-4 text-xs font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                onClick={() => setLogoDataUrl("")}
                type="button"
              >
                Remove Logo
              </Button> */}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setLogoDataUrl(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-200"
              />
                 <Button
                className="h-9 bg-slate-100 px-4 text-xs font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                onClick={() => setLogoDataUrl("")}
                type="button"
              >
                Remove Logo
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Logo Size: {logoSizePercent}%
                </p>
                <input
                  type="range"
                  min={10}
                  max={25}
                  value={logoSizePercent}
                  onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                  className="w-full dark:bg-slate-700"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Logo Shape
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["square", "rounded", "circle"] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setLogoShape(shape)}
                      className={`h-9 rounded-lg text-xs font-bold ${
                        logoShape === shape
                          ? "bg-brand-600 text-white dark:bg-[#CB3CFF]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                      type="button"
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={saveCustomization}
              loading={saving}
              className="h-11 rounded-xl bg-brand-600 px-6 font-bold hover:bg-brand-700 dark:dark:bg-[#CB3CFF] dark:hover:dark:bg-[#CB3CFF]/80"
            >
              Save Customization
            </Button>
            {message ? (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </div>
        </Card>

        <Card
          className={`${selectedTemplate.cardClass} flex flex-col items-center justify-center gap-4 dark:bg-[#0B1739] border-[#343B4F]/80`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Preview
          </p>
          <div
            className={`${selectedTemplate.borderClass} shadow-xl dark:shadow-slate-900`}
          >
            {loading ? (
              <div className="flex h-52 w-52 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                Generating...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Customized QR Code"
                className="h-52 w-52"
              />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                Select business
              </div>
            )}
          </div>
          <a
            href={qrDataUrl || "#"}
            download={`custom-qr-${selectedBusiness?.name?.replace(/\s+/g, "-").toLowerCase() || "business"}.png`}
            className={`inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold ${
              qrDataUrl
                ? "bg-brand-600 text-white hover:bg-brand-700 dark:dark:bg-[#CB3CFF] dark:hover:dark:bg-[#CB3CFF]/80"
                : "pointer-events-none bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            }`}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </a>
        </Card>
      </div>
    </div>
  );
}
