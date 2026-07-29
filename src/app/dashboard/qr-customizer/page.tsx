"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  WandSparkles,
  Palette,
  Upload,
  Trash2,
  Check,
  RefreshCw,
  Building2,
  Sliders,
  Square,
  Circle,
  Squircle,
  Image as ImageIcon,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui";
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
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";

type Template = {
  id: string;
  name: string;
  dark: string;
  light: string;
  darkMode: {
    dark: string;
    light: string;
    templateId: string;
  };
  gradient: string;
  borderClass: string;
  cardClass: string;
  darkCardClass: string;
  icon: string;
  preview: string;
};

const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    dark: "#111827",
    light: "#ffffff",
    darkMode: {
      dark: "#e5e7eb",
      light: "#1f2937",
      templateId: "classic-dark",
    },
    gradient: "from-slate-900 to-slate-700",
    borderClass: "rounded-2xl border-4 border-white/80",
    cardClass: "bg-white/80 backdrop-blur-sm",
    darkCardClass: "dark:bg-slate-800/80 dark:backdrop-blur-sm",
    icon: "🎯",
    preview: "bg-gradient-to-br from-slate-100 to-slate-200",
  },
  {
    id: "ocean",
    name: "Ocean",
    dark: "#0a4a6a",
    light: "#e6f6ff",
    darkMode: {
      dark: "#67e8f9",
      light: "#0c4a6e",
      templateId: "ocean-dark",
    },
    gradient: "from-cyan-600 to-blue-600",
    borderClass: "rounded-[1.75rem] border-4 border-cyan-200/50",
    cardClass: "bg-gradient-to-br from-cyan-50 to-blue-50",
    darkCardClass:
      "dark:bg-gradient-to-br dark:from-cyan-950/40 dark:to-blue-950/40",
    icon: "🌊",
    preview: "bg-gradient-to-br from-cyan-100 to-blue-100",
  },
  {
    id: "sunset",
    name: "Sunset",
    dark: "#7a2e0e",
    light: "#fff7ed",
    darkMode: {
      dark: "#fdba74",
      light: "#431407",
      templateId: "sunset-dark",
    },
    gradient: "from-orange-500 to-rose-500",
    borderClass: "rounded-[1.75rem] border-4 border-orange-200/50",
    cardClass: "bg-gradient-to-br from-orange-50 to-rose-50",
    darkCardClass:
      "dark:bg-gradient-to-br dark:from-orange-950/40 dark:to-rose-950/40",
    icon: "🌅",
    preview: "bg-gradient-to-br from-orange-100 to-rose-100",
  },
  {
    id: "mono-soft",
    name: "Mono Soft",
    dark: "#334155",
    light: "#f8fafc",
    darkMode: {
      dark: "#cbd5e1",
      light: "#1e293b",
      templateId: "mono-soft-dark",
    },
    gradient: "from-slate-500 to-gray-500",
    borderClass: "rounded-[1.75rem] border-4 border-slate-200/50",
    cardClass: "bg-gradient-to-br from-slate-50 to-gray-50",
    darkCardClass:
      "dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-gray-800/50",
    icon: "🎨",
    preview: "bg-gradient-to-br from-slate-100 to-gray-100",
  },
  {
    id: "aurora",
    name: "Aurora",
    dark: "#1a0a2e",
    light: "#f0e6ff",
    darkMode: {
      dark: "#c4b5fd",
      light: "#1e1b4b",
      templateId: "aurora-dark",
    },
    gradient: "from-purple-600 to-pink-600",
    borderClass: "rounded-[1.75rem] border-4 border-purple-200/50",
    cardClass: "bg-gradient-to-br from-purple-50 to-pink-50",
    darkCardClass:
      "dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-pink-950/40",
    icon: "✨",
    preview: "bg-gradient-to-br from-purple-100 to-pink-100",
  },
  {
    id: "forest",
    name: "Forest",
    dark: "#064e3b",
    light: "#ecfdf5",
    darkMode: {
      dark: "#6ee7b7",
      light: "#022c22",
      templateId: "forest-dark",
    },
    gradient: "from-emerald-600 to-teal-600",
    borderClass: "rounded-[1.75rem] border-4 border-emerald-200/50",
    cardClass: "bg-gradient-to-br from-emerald-50 to-teal-50",
    darkCardClass:
      "dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-teal-950/40",
    icon: "🌿",
    preview: "bg-gradient-to-br from-emerald-100 to-teal-100",
  },
];
export default function QrCustomizerPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [saltValue, setSaltValue] = useState("v1");

  // Light mode colors
  const [darkColor, setDarkColor] = useState("#111827");
  const [lightColor, setLightColor] = useState("#ffffff");

  // Dark mode colors
  const [darkColorDarkMode, setDarkColorDarkMode] = useState("#e5e7eb");
  const [lightColorDarkMode, setLightColorDarkMode] = useState("#1f2937");

  const [dotStyle, setDotStyle] = useState<
    "square" | "rounded" | "dots" | "classy"
  >("dots");
  const [templateId, setTemplateId] = useState("classic");
  const [templateIdDarkMode, setTemplateIdDarkMode] = useState("classic-dark");
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
  const [activeTab, setActiveTab] = useState<"colors" | "logo" | "templates">(
    "templates",
  );

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );

  const selectedTemplate = useMemo(() => {
    const id = isDark ? templateIdDarkMode : templateId;
    return templates.find((t) => t.id === id) || templates[0];
  }, [templateId, templateIdDarkMode, isDark]);

  // Get current colors based on theme
  const currentColors = useMemo(() => {
    if (isDark) {
      return {
        dark: darkColorDarkMode,
        light: lightColorDarkMode,
      };
    }
    return {
      dark: darkColor,
      light: lightColor,
    };
  }, [isDark, darkColor, lightColor, darkColorDarkMode, lightColorDarkMode]);

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

      // Load light mode colors
      setDarkColor(json.data.dark_color || "#111827");
      setLightColor(json.data.light_color || "#ffffff");

      // Load dark mode colors
      setDarkColorDarkMode(json.data.dark_color_dark_mode || "#e5e7eb");
      setLightColorDarkMode(json.data.light_color_dark_mode || "#1f2937");

      setSaltValue(json.data.salt_value || "v1");
      setTemplateId(json.data.template_id || "classic");
      setTemplateIdDarkMode(json.data.template_id_dark_mode || "classic-dark");
      setDotStyle(json.data.dot_style || "dots");
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
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const url = `${base}/review/${selectedBusinessId}?salt=${encodeURIComponent(saltValue || "v1")}`;

        const QRCodeStyling = (await import("qr-code-styling")).default;

        const qrCode = new QRCodeStyling({
          width: 520,
          height: 520,
          data: url,
          margin: 10,
          dotsOptions: {
            color: currentColors.dark,
            type: dotStyle,
          },
          backgroundOptions: {
            color: currentColors.light,
          },
          cornersSquareOptions: {
            type: dotStyle === "dots" ? "dot" : "extra-rounded",
          },
        });

        const blob = await qrCode.getRawData("png");
        if (!blob) throw new Error("Failed to generate QR");

        let dataUrl: string;
        if (Buffer.isBuffer(blob)) {
          dataUrl = `data:image/png;base64,${blob.toString("base64")}`;
        } else if (blob instanceof Blob) {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          const blobData = new Blob([blob as any], { type: "image/png" });
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blobData);
          });
        }

        const withLogo = await applyLogoToQr({
          qrDataUrl: dataUrl,
          logoDataUrl,
          logoSizePercent,
          logoShape,
        });
        setQrDataUrl(withLogo);
      } catch (err) {
        console.error("Error generating QR:", err);
      }
      setLoading(false);
    };
    generate();
  }, [
    selectedBusinessId,
    saltValue,
    currentColors.dark,
    currentColors.light,
    dotStyle,
    logoDataUrl,
    logoSizePercent,
    logoShape,
  ]);

  const applyTemplate = (template: Template) => {
    if (isDark && template.darkMode) {
      setTemplateIdDarkMode(template.darkMode.templateId);
      setDarkColorDarkMode(template.darkMode.dark);
      setLightColorDarkMode(template.darkMode.light);
    } else {
      setTemplateId(template.id);
      setDarkColor(template.dark);
      setLightColor(template.light);
    }
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
        darkColorDarkMode,
        lightColorDarkMode,
        saltValue,
        templateId,
        templateIdDarkMode,
        dotStyle,
        logoDataUrl,
        logoSizePercent,
        logoShape,
      }),
    });

    console.log("res -----> ", res);

    const json = await res.json();
    console.log("json -----> ", json);

    setSaving(false);
    if (!res.ok) return setError(json.error || "Failed to save customization.");
    setMessage("Customization saved successfully! 🎉");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg shadow-purple-500/20">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                QR Customizer
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Personalize your QR codes with colors, logos, and templates
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <Sun className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isDark ? "Dark" : "Light"} Mode
            </span>
            <Moon className="h-4 w-4 text-slate-500" />
          </div> */}
          <Button
            onClick={saveCustomization}
            loading={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            <Check className="mr-2 h-4 w-4" />
            Save Customization
          </Button>
        </div>
      </div>

      {/* Message/Error */}
      {(message || error) && (
        <div
          className={`rounded-xl p-4 ${
            message
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          }`}
        >
          {message || error}
        </div>
      )}

      {/* Theme indicator for colors */}
      {/* <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Editing:
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isDark
                ? "bg-slate-700 text-slate-200"
                : "bg-white text-slate-700 shadow-sm"
            }`}
          >
            {isDark ? "🌙 Dark Mode Colors" : "☀️ Light Mode Colors"}
          </span>
        </div>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Selector */}
          <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <Select
                value={selectedBusinessId}
                onValueChange={setSelectedBusinessId}
              >
                <SelectTrigger className="flex-1 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white">
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
          </Card>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {[
              { id: "templates", label: "Templates", icon: WandSparkles },
              { id: "colors", label: "Colors", icon: Palette },
              { id: "logo", label: "Logo", icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Choose a pre-designed template
                  </p>
                  {/* <span className="text-xs text-slate-400 dark:text-slate-500">
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </span> */}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {templates.map((template) => {
                    const isActive = isDark
                      ? templateIdDarkMode === template.darkMode?.templateId
                      : templateId === template.id;
                    const colors =
                      isDark && template.darkMode
                        ? {
                            dark: template.darkMode.dark,
                            light: template.darkMode.light,
                          }
                        : { dark: template.dark, light: template.light };

                    return (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`group relative rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          isActive
                            ? "border-purple-500 bg-purple-50 shadow-purple-500/20 dark:border-purple-400 dark:bg-purple-950/30"
                            : "border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-2xl">{template.icon}</span>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                              {template.name}
                              {isDark && template.darkMode && (
                                <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                                  (Dark)
                                </span>
                              )}
                            </p>
                          </div>
                          {isActive && (
                            <div className="rounded-full bg-purple-500 p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-1.5">
                          <div
                            className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-600"
                            style={{ backgroundColor: colors.dark }}
                          />
                          <div
                            className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-600"
                            style={{ backgroundColor: colors.light }}
                          />
                        </div>
                        <div
                          className={`mt-2 h-1 w-full rounded-full bg-gradient-to-r ${template.gradient}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === "colors" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {/* <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isDark ? "🌙 Dark Mode Colors" : "☀️ Light Mode Colors"}
                  </span> */}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      QR Dark Color
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={isDark ? darkColorDarkMode : darkColor}
                        onChange={(e) => {
                          if (isDark) {
                            setDarkColorDarkMode(e.target.value);
                          } else {
                            setDarkColor(e.target.value);
                          }
                        }}
                        className="h-12 w-14 rounded-xl border-2 border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <Input
                        value={isDark ? darkColorDarkMode : darkColor}
                        onChange={(e) => {
                          if (isDark) {
                            setDarkColorDarkMode(e.target.value);
                          } else {
                            setDarkColor(e.target.value);
                          }
                        }}
                        className="h-12 rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      QR Light Color
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={isDark ? lightColorDarkMode : lightColor}
                        onChange={(e) => {
                          if (isDark) {
                            setLightColorDarkMode(e.target.value);
                          } else {
                            setLightColor(e.target.value);
                          }
                        }}
                        className="h-12 w-14 rounded-xl border-2 border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <Input
                        value={isDark ? lightColorDarkMode : lightColor}
                        onChange={(e) => {
                          if (isDark) {
                            setLightColorDarkMode(e.target.value);
                          } else {
                            setLightColor(e.target.value);
                          }
                        }}
                        className="h-12 rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Salt Value
                    </p>
                    <Input
                      value={saltValue}
                      onChange={(e) => setSaltValue(e.target.value)}
                      placeholder="v1"
                      className="h-12 rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div> */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Dot Style
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "square", label: "Square" },
                        { value: "rounded", label: "Rounded" },
                        { value: "dots", label: "Dots" },
                        { value: "classy", label: "Classy" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setDotStyle(style.value as any)}
                          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                            dotStyle === style.value
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Tab - Same as before */}
            {activeTab === "logo" && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
                  {logoDataUrl ? (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <img
                          src={logoDataUrl}
                          alt="Logo"
                          className="max-h-16 max-w-16 object-contain"
                        />
                      </div>
                      <Button
                        // variant="outline"
                        onClick={() => setLogoDataUrl("")}
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload a logo to appear in the center of your QR code
                      </p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () =>
                            setLogoDataUrl(String(reader.result || ""));
                          reader.readAsDataURL(file);
                        }}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-600 hover:file:bg-purple-100 dark:file:bg-purple-950/30 dark:file:text-purple-400"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Logo Size: {logoSizePercent}%
                    </p>
                    <div className="flex items-center gap-3">
                      <Sliders className="h-4 w-4 text-slate-400" />
                      <input
                        type="range"
                        min={10}
                        max={30}
                        value={logoSizePercent}
                        onChange={(e) =>
                          setLogoSizePercent(Number(e.target.value))
                        }
                        className="flex-1 h-2 rounded-lg bg-slate-200 accent-purple-500 dark:bg-slate-700"
                      />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
                        {logoSizePercent}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Logo Shape
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "square", icon: Square, label: "Square" },
                        { value: "rounded", icon: Squircle, label: "Rounded" },
                        { value: "circle", icon: Circle, label: "Circle" },
                      ].map((shape) => {
                        const Icon = shape.icon;
                        const isActive = logoShape === shape.value;
                        return (
                          <button
                            key={shape.value}
                            onClick={() => setLogoShape(shape.value as any)}
                            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {shape.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card
            className={`${selectedTemplate.cardClass} ${selectedTemplate.darkCardClass} relative overflow-hidden border-0 p-6 backdrop-blur-sm`}
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                Live Preview 
                {/* {isDark ? "(Dark Mode)" : "(Light Mode)"} */}
              </p>
              <div
                className={`${selectedTemplate.borderClass} shadow-2xl transition-all duration-300`}
              >
                {loading ? (
                  <div className="flex h-52 w-52 items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Customized QR Code"
                    className="h-52 w-52"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                    Select a business
                  </div>
                )}
              </div>

              {/* Business info under QR */}
              {selectedBusiness && (
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedBusiness.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedBusiness.category || "Business"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Download Button */}
          <a
            href={qrDataUrl || "#"}
            download={`qr-${selectedBusiness?.name?.replace(/\s+/g, "-").toLowerCase() || "business"}.png`}
            className={`w-full rounded-xl py-6 text-base font-bold text-center inline-flex items-center justify-center transition-all duration-300 ${
              qrDataUrl && !loading
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 hover:shadow-purple-500/40"
                : "pointer-events-none bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
            }`}
          >
            <Download className="mr-2 h-5 w-5" />
            Download QR Code
          </a>

          {/* Template info */}
          <div className="rounded-xl bg-white/50 p-4 text-center backdrop-blur-sm dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Template:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedTemplate.icon} {selectedTemplate.name}
                {isDark && " (Dark)"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
