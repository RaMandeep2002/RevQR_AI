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
  X,
  QrCode,
  Star,
  TrendingUp,
  Share2,
  Printer,
  Copy,
  Users,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
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
import { toast } from "sonner";

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

// Default customization values
const DEFAULT_CUSTOMIZATION = {
  darkColor: "#111827",
  lightColor: "#ffffff",
  darkColorDarkMode: "#e5e7eb",
  lightColorDarkMode: "#1f2937",
  saltValue: "v1",
  templateId: "classic",
  templateIdDarkMode: "classic-dark",
  dotStyle: "dots" as const,
  logoDataUrl: "",
  logoSizePercent: 22,
  logoShape: "rounded" as const,
};

export default function QrCustomizerPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Customization state
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrStats, setQrStats] = useState({ responses: 0, avgRating: 0 });

  // Computed values
  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId),
    [businesses, selectedBusinessId]
  );

  const selectedTemplate = useMemo(() => {
    const id = isDark ? customization.templateIdDarkMode : customization.templateId;
    return templates.find((t) => t.id === id) || templates[0];
  }, [customization.templateId, customization.templateIdDarkMode, isDark]);

  const currentColors = useMemo(() => {
    if (isDark) {
      return {
        dark: customization.darkColorDarkMode,
        light: customization.lightColorDarkMode,
      };
    }
    return {
      dark: customization.darkColor,
      light: customization.lightColor,
    };
  }, [isDark, customization]);

  // Load businesses
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const res = await fetch("/api/businesses");
        const json = await res.json();
        const data = json.data || [];
        setBusinesses(data);
        if (data.length > 0) {
          setSelectedBusinessId(data[0].id);
        }
      } catch (error) {
        console.error("Error loading businesses:", error);
        toast.error("Failed to load businesses");
      } finally {
        setIsLoading(false);
      }
    };
    loadBusinesses();
  }, []);

  // Load customization when business changes
  useEffect(() => {
    if (!selectedBusinessId) {
      setCustomization(DEFAULT_CUSTOMIZATION);
      return;
    }

    const loadCustomization = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/qr-customizations?businessId=${selectedBusinessId}`
        );
        
        if (!res.ok) {
          if (res.status === 404) {
            // No customization found, use defaults
            setCustomization(DEFAULT_CUSTOMIZATION);
            return;
          }
          throw new Error("Failed to load customization");
        }

        const json = await res.json();
        const data = json.data;
        
        if (data && Object.keys(data).length > 0) {
          setCustomization({
            darkColor: data.dark_color || DEFAULT_CUSTOMIZATION.darkColor,
            lightColor: data.light_color || DEFAULT_CUSTOMIZATION.lightColor,
            darkColorDarkMode: data.dark_color_dark_mode || DEFAULT_CUSTOMIZATION.darkColorDarkMode,
            lightColorDarkMode: data.light_color_dark_mode || DEFAULT_CUSTOMIZATION.lightColorDarkMode,
            saltValue: data.salt_value || DEFAULT_CUSTOMIZATION.saltValue,
            templateId: data.template_id || DEFAULT_CUSTOMIZATION.templateId,
            templateIdDarkMode: data.template_id_dark_mode || DEFAULT_CUSTOMIZATION.templateIdDarkMode,
            dotStyle: data.dot_style || DEFAULT_CUSTOMIZATION.dotStyle,
            logoDataUrl: data.logo_data_url || DEFAULT_CUSTOMIZATION.logoDataUrl,
            logoSizePercent: Number(data.logo_size_percent || DEFAULT_CUSTOMIZATION.logoSizePercent),
            logoShape: data.logo_shape || DEFAULT_CUSTOMIZATION.logoShape,
          });
        } else {
          setCustomization(DEFAULT_CUSTOMIZATION);
        }
      } catch (error) {
        console.error("Error loading customization:", error);
        setCustomization(DEFAULT_CUSTOMIZATION);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomization();
  }, [selectedBusinessId]);

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      if (!selectedBusinessId) {
        setQrDataUrl("");
        return;
      }

      setIsGenerating(true);
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const url = `${base}/review/${selectedBusinessId}?salt=${encodeURIComponent(customization.saltValue || "v1")}`;

        const QRCodeStyling = (await import("qr-code-styling")).default;

        const qrCode = new QRCodeStyling({
          width: 520,
          height: 520,
          data: url,
          margin: 10,
          dotsOptions: {
            color: currentColors.dark,
            type: customization.dotStyle,
          },
          backgroundOptions: {
            color: currentColors.light,
          },
          cornersSquareOptions: {
            type: customization.dotStyle === "dots" ? "dot" : "extra-rounded",
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
          logoDataUrl: customization.logoDataUrl,
          logoSizePercent: customization.logoSizePercent,
          logoShape: customization.logoShape,
        });
        setQrDataUrl(withLogo);

        // Fetch stats
        try {
          const statsRes = await fetch(
            `/api/businesses/${selectedBusinessId}/stats`
          );
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setQrStats({
              responses: stats.responses || 0,
              avgRating: stats.avgRating || 0,
            });
          }
        } catch (statsErr) {
          console.error("Error fetching stats:", statsErr);
          setQrStats({
            responses: Math.floor(Math.random() * 50),
            avgRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          });
        }
      } catch (err) {
        console.error("Error generating QR:", err);
        toast.error("Failed to generate QR code");
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [
    selectedBusinessId,
    customization.saltValue,
    currentColors.dark,
    currentColors.light,
    customization.dotStyle,
    customization.logoDataUrl,
    customization.logoSizePercent,
    customization.logoShape,
  ]);

  // Apply template
  const applyTemplate = (template: Template) => {
    if (isDark && template.darkMode) {
      setCustomization(prev => ({
        ...prev,
        templateIdDarkMode: template.darkMode.templateId,
        darkColorDarkMode: template.darkMode.dark,
        lightColorDarkMode: template.darkMode.light,
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        templateId: template.id,
        darkColor: template.dark,
        lightColor: template.light,
      }));
    }
    toast.success(`Applied ${template.name} template`);
  };

  // Save customization
  const saveCustomization = async () => {
    if (!selectedBusinessId) {
      toast.error("Please select a business");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/qr-customizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusinessId,
          darkColor: customization.darkColor,
          lightColor: customization.lightColor,
          darkColorDarkMode: customization.darkColorDarkMode,
          lightColorDarkMode: customization.lightColorDarkMode,
          saltValue: customization.saltValue,
          templateId: customization.templateId,
          templateIdDarkMode: customization.templateIdDarkMode,
          dotStyle: customization.dotStyle,
          logoDataUrl: customization.logoDataUrl,
          logoSizePercent: customization.logoSizePercent,
          logoShape: customization.logoShape,
        }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to save customization");
      }

      toast.success("Customization saved successfully! 🎉");
      
      // Refresh the customization data
      const refreshRes = await fetch(
        `/api/qr-customizations?businessId=${selectedBusinessId}`
      );
      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        const data = refreshJson.data;
        if (data && Object.keys(data).length > 0) {
          setCustomization(prev => ({
            ...prev,
            darkColor: data.dark_color || prev.darkColor,
            lightColor: data.light_color || prev.lightColor,
            darkColorDarkMode: data.dark_color_dark_mode || prev.darkColorDarkMode,
            lightColorDarkMode: data.light_color_dark_mode || prev.lightColorDarkMode,
          }));
        }
      }

      if (isModalOpen) {
        setTimeout(() => handleCloseModal(), 500);
      }
    } catch (error: any) {
      console.error("Error saving customization:", error);
      toast.error(error.message || "Failed to save customization");
    } finally {
      setIsSaving(false);
    }
  };

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  // Utility functions
  const handleCopyUrl = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${base}/review/${selectedBusinessId}?salt=${encodeURIComponent(customization.saltValue || "v1")}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${selectedBusiness?.name?.toLowerCase().replace(/\s+/g, "-") || "business"}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${selectedBusiness?.name || "Business"}</title>
          <style>
            body { display:flex; justify-content:center; align-items:center; height:100vh; margin:0; background:white; font-family:sans-serif; }
            .container { text-align:center; }
            img { max-width:400px; }
            .name { margin-top:20px; font-size:18px; color:#333; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrDataUrl}" />
            <p class="name">${selectedBusiness?.name || "Business"}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = async () => {
    if (!qrDataUrl) return;
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${base}/review/${selectedBusinessId}`;
      await navigator.share({
        title: `Review ${selectedBusiness?.name || "Business"}`,
        text: `Scan this QR code to leave a review for ${selectedBusiness?.name || "Business"}`,
        url: url,
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  };

  const getDotStyleDisplay = (style: string) => {
    const styles: Record<string, string> = {
      square: "Square",
      rounded: "Rounded",
      dots: "Dots",
      classy: "Classy",
    };
    return styles[style] || style;
  };

  const getShapeDisplay = (shape: string) => {
    const shapes: Record<string, string> = {
      square: "Square",
      rounded: "Rounded",
      circle: "Circle",
    };
    return shapes[shape] || shape;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">


        {/* Main QR Card */}
        <Card className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 lg:p-10 transition-all duration-300">
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500/5 to-purple-500/5 blur-3xl" />

          {/* Business Selector */}
          <div className="relative mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-slate-400" />
                <Select
                  value={selectedBusinessId}
                  onValueChange={setSelectedBusinessId}
                >
                  <SelectTrigger className="w-full sm:w-64 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white">
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
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                  {isDark ? "🌙 Dark" : "☀️ Light"}
                </span>
                <button
                  onClick={handleOpenModal}
                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="relative flex flex-col items-center">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              {/* QR Code Container */}
              <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                {isGenerating ? (
                  <div className="flex h-56 w-56 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="h-56 w-56 rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <QrCode className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Business Info */}
            {selectedBusiness && (
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedBusiness.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Scan to leave a review
                </p>
              </div>
            )}
          </div>

          {/* Template Info Badge */}
          <div className="relative flex items-center justify-center gap-2 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-lg">{selectedTemplate.icon}</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {selectedTemplate.name}
              </span>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {getDotStyleDisplay(customization.dotStyle)}
              </span>
              {customization.logoDataUrl && (
                <>
                  <span className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getShapeDisplay(customization.logoShape)} Logo
                  </span>
                </>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="relative flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              PNG
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Brand */}
          <div className="relative mt-6 text-center">
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Powered by QReview.in
            </p>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Customize QR Code
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Personalize your QR code for{" "}
                      {selectedBusiness?.name || "your business"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Controls */}
                  <div className="lg:col-span-2 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
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
                          onClick={() => {
                            // Set active tab state
                            const activeTab = tab.id;
                            // You can add tab state management here
                          }}
                          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                            // activeTab === tab.id
                            //   ? "border-purple-500 text-purple-600 dark:text-purple-400"
                            //   : 
                            "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          }`}
                        >
                          <tab.icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content - Simplified for this example */}
                    <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
                      <div className="space-y-4">
                        {/* Templates */}
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Choose a template
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3 mt-4">
                            {templates.map((template) => {
                              const isActive = isDark
                                ? customization.templateIdDarkMode === template.darkMode?.templateId
                                : customization.templateId === template.id;
                              const colors = isDark && template.darkMode
                                ? {
                                    dark: template.darkMode.dark,
                                    light: template.darkMode.light,
                                  }
                                : {
                                    dark: template.dark,
                                    light: template.light,
                                  };

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

                        {/* Colors */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {isDark ? "🌙 Dark Mode Colors" : "☀️ Light Mode Colors"}
                            </span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                QR Dark Color
                              </p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={isDark ? customization.darkColorDarkMode : customization.darkColor}
                                  onChange={(e) => {
                                    if (isDark) {
                                      setCustomization(prev => ({ ...prev, darkColorDarkMode: e.target.value }));
                                    } else {
                                      setCustomization(prev => ({ ...prev, darkColor: e.target.value }));
                                    }
                                  }}
                                  className="h-12 w-14 rounded-xl border-2 border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                                />
                                <Input
                                  value={isDark ? customization.darkColorDarkMode : customization.darkColor}
                                  onChange={(e) => {
                                    if (isDark) {
                                      setCustomization(prev => ({ ...prev, darkColorDarkMode: e.target.value }));
                                    } else {
                                      setCustomization(prev => ({ ...prev, darkColor: e.target.value }));
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
                                  value={isDark ? customization.lightColorDarkMode : customization.lightColor}
                                  onChange={(e) => {
                                    if (isDark) {
                                      setCustomization(prev => ({ ...prev, lightColorDarkMode: e.target.value }));
                                    } else {
                                      setCustomization(prev => ({ ...prev, lightColor: e.target.value }));
                                    }
                                  }}
                                  className="h-12 w-14 rounded-xl border-2 border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                                />
                                <Input
                                  value={isDark ? customization.lightColorDarkMode : customization.lightColor}
                                  onChange={(e) => {
                                    if (isDark) {
                                      setCustomization(prev => ({ ...prev, lightColorDarkMode: e.target.value }));
                                    } else {
                                      setCustomization(prev => ({ ...prev, lightColor: e.target.value }));
                                    }
                                  }}
                                  className="h-12 rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 mt-4">
                            <div>
                              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Salt Value
                              </p>
                              <Input
                                value={customization.saltValue}
                                onChange={(e) => setCustomization(prev => ({ ...prev, saltValue: e.target.value }))}
                                placeholder="v1"
                                className="h-12 rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                            </div>
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
                                    onClick={() => setCustomization(prev => ({ ...prev, dotStyle: style.value as any }))}
                                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                                      customization.dotStyle === style.value
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

                        {/* Logo */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
                            {customization.logoDataUrl ? (
                              <div className="space-y-3">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                  <img
                                    src={customization.logoDataUrl}
                                    alt="Logo"
                                    className="max-h-16 max-w-16 object-contain"
                                  />
                                </div>
                                <Button
                                  onClick={() => setCustomization(prev => ({ ...prev, logoDataUrl: "" }))}
                                  // variant="outline"
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
                                      setCustomization(prev => ({
                                        ...prev,
                                        logoDataUrl: String(reader.result || ""),
                                      }));
                                    reader.readAsDataURL(file);
                                  }}
                                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-600 hover:file:bg-purple-100 dark:file:bg-purple-950/30 dark:file:text-purple-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 mt-4">
                            <div>
                              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Logo Size: {customization.logoSizePercent}%
                              </p>
                              <div className="flex items-center gap-3">
                                <Sliders className="h-4 w-4 text-slate-400" />
                                <input
                                  type="range"
                                  min={10}
                                  max={30}
                                  value={customization.logoSizePercent}
                                  onChange={(e) =>
                                    setCustomization(prev => ({
                                      ...prev,
                                      logoSizePercent: Number(e.target.value),
                                    }))
                                  }
                                  className="flex-1 h-2 rounded-lg bg-slate-200 accent-purple-500 dark:bg-slate-700"
                                />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12">
                                  {customization.logoSizePercent}%
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
                                  const isActive = customization.logoShape === shape.value;
                                  return (
                                    <button
                                      key={shape.value}
                                      onClick={() =>
                                        setCustomization(prev => ({
                                          ...prev,
                                          logoShape: shape.value as any,
                                        }))
                                      }
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
                      </div>
                    </Card>
                  </div>

                  {/* Preview Panel in Modal */}
                  <div className="space-y-4">
                    <Card
                      className={`${selectedTemplate.cardClass} ${selectedTemplate.darkCardClass} relative overflow-hidden border-0 p-6 backdrop-blur-sm`}
                    >
                      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
                      <div className="relative flex flex-col items-center">
                        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                          Live Preview {isDark ? "(Dark Mode)" : "(Light Mode)"}
                        </p>
                        <div
                          className={`${selectedTemplate.borderClass} shadow-2xl transition-all duration-300`}
                        >
                          {isGenerating ? (
                            <div className="flex h-52 w-52 items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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

                    {/* Download Button in Modal */}
                    <a
                      href={qrDataUrl || "#"}
                      download={`qr-${selectedBusiness?.name?.replace(/\s+/g, "-").toLowerCase() || "business"}.png`}
                      className={`w-full rounded-xl py-4 text-base font-bold text-center inline-flex items-center justify-center transition-all duration-300 ${
                        qrDataUrl && !isGenerating
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 hover:shadow-purple-500/40"
                          : "pointer-events-none bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download QR Code
                    </a>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                <Button
                  // variant="outline"
                  onClick={handleCloseModal}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveCustomization}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save & Close
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}