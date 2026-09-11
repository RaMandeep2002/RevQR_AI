"use client";

import React, { useEffect, useState } from "react";
import { 
  Edit3, 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  Tag,
  X,
  Check,
  Plus,
  Languages,
  ChevronDown,
  Crown,
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle,
  Lock,
  ArrowRight,
  Loader2,
  Settings2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Business, BusinessTone } from "@/types";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// All Indian languages with their details
const INDIAN_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", flag: "🇮🇳" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर", flag: "🇮🇳" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "🇵🇰" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", flag: "🇮🇳" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", flag: "🇮🇳" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", flag: "🇮🇳" },
  { code: "bodo", name: "Bodo", nativeName: "बर' ", flag: "🇮🇳" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", flag: "🇮🇳" },
];

// Tone options
const TONES = ["Professional", "Friendly", "Enthusiastic", "Formal", "Casual"] as const;

// Subscription Plan Data
const PLAN_FEATURES = {
  STARTER: {
    name: "Starter",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    price: "₹299",
    scanLimit: "100 scans/month",
    alert: "Email Only",
    maxLocations: 1,
    idealFor: ["Single Kirana Stores", "Salons & Clinics", "Local service businesses"],
    features: [
      "1 business location",
      "Up to 3 Static QR Codes",
      "PDF Printout QR Standee",
      "Basic Counter Analytics",
      "English + 1 Local Language",
      "Email Alerts for 1-3 Star Reviews"
    ]
  },
  GROWTH: {
    name: "Growth",
    icon: Zap,
    color: "from-blue-500 to-indigo-500",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    price: "₹699",
    scanLimit: "350 scans/month",
    alert: "Email Only",
    maxLocations: 3,
    idealFor: ["Busy Cafés", "Fine Dining Restaurants", "Growing Businesses"],
    features: [
      "Up to 3 business locations",
      "Unlimited Static QR Codes",
      "Up to 20 Dynamic QR Codes",
      "1 High-Quality Acrylic Standee",
      "Multi-language Auto-Detect",
      "Monthly Insights & Sentiment Report",
      "Priority support"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    icon: Crown,
    color: "from-purple-500 to-indigo-500",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    price: "₹1,499",
    scanLimit: "1,000 scans/month",
    alert: "Email Only",
    maxLocations: Infinity,
    idealFor: ["Multi-branch chains", "Hospitals", "Large organizations"],
    features: [
      "Unlimited business locations",
      "Unlimited Dynamic & Static QR Codes",
      "3 Acrylic Standees Included",
      "All Local Languages + Voice-to-Text",
      "Real-Time Staff Leaderboard",
      "REST API Access & Webhooks",
      "Role-based Team Management",
      "24/7 Live Chat Support"
    ]
  }
};

// Add Business Modal Component
function AddBusinessModal({ 
  isOpen, 
  onClose, 
  onSave,
  loading 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
    languages: [] as string[],
    tone: "Professional" as BusinessTone,
    keywords: "",
  });
  const [error, setError] = useState("");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        category: "",
        googleBusinessUrl: "",
        location: "",
        languages: ['en', 'hi'],
        tone: "Professional",
        keywords: "",
      });
      setError("");
      setIsLanguageDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleLanguage = (languageCode: string) => {
    setForm((prev) => {
      const currentLanguages = prev.languages || [];
      if (currentLanguages.includes(languageCode)) {
        if (currentLanguages.length === 1) return prev;
        return {
          ...prev,
          languages: currentLanguages.filter((code) => code !== languageCode),
        };
      } else {
        return {
          ...prev,
          languages: [...currentLanguages, languageCode],
        };
      }
    });
  };

  const removeLanguage = (languageCode: string) => {
    if (form.languages.length === 1) return;
    setForm({
      ...form,
      languages: form.languages.filter((code) => code !== languageCode),
    });
  };

  const handleSave = () => {
    setError("");
    if (!form.name.trim()) {
      setError("Business name is required");
      return;
    }
    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required");
      return;
    }
    if (!form.languages || form.languages.length === 0) {
      setError("Please select at least one language");
      return;
    }
    onSave(form);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
          <Card className="relative flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh]">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

            <div className="flex flex-col flex-1 overflow-hidden p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-white shadow-lg">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Add New Business
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Register a new business location
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Business Name *
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Enter business name"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Category *
                    </label>
                    <Input
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      placeholder="e.g., Restaurant"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Location *
                    </label>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="City, State"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Google Business URL
                    </label>
                    <Input
                      value={form.googleBusinessUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          googleBusinessUrl: e.target.value,
                        })
                      }
                      placeholder="https://g.page/your-business"
                      type="url"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Default Tone
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setForm({ ...form, tone })}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          form.tone === tone
                            ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Keywords
                  </label>
                  <Input
                    value={form.keywords}
                    onChange={(e) =>
                      setForm({ ...form, keywords: e.target.value })
                    }
                    placeholder="service quality, staff behaviour, pricing"
                    className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Add at least 2-3 keywords for better ranking (separated with commas)
                  </p>
                </div>

                {/* Languages Section */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Languages className="h-3.5 w-3.5" />
                    Supported Languages *
                  </label>
                  <div className="mt-1 relative">
                    <div 
                      className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    >
                      {form.languages && form.languages.length > 0 ? (
                        form.languages.map((code) => {
                          const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
                          return lang ? (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-medium text-blue-800 dark:text-blue-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLanguage(code);
                                }}
                              />
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          Select languages...
                        </span>
                      )}
                      <ChevronDown className={`ml-auto h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Language Dropdown */}
                    {isLanguageDropdownOpen && (
                      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl">
                        <div className="grid grid-cols-1 gap-0.5">
                          {INDIAN_LANGUAGES.map((language) => (
                            <div
                              key={language.code}
                              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 ${
                                form.languages.includes(language.code)
                                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                              onClick={() => toggleLanguage(language.code)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{language.flag}</span>
                                <span>{language.nativeName}</span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  ({language.name})
                                </span>
                              </div>
                              {form.languages.includes(language.code) && (
                                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {form.languages && form.languages.length > 0 
                      ? `${form.languages.length} language${form.languages.length > 1 ? 's' : ''} selected` 
                      : 'Select at least one language'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Business
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Upgrade Modal Component
function UpgradeModal({ 
  isOpen, 
  onClose,
  currentPlan,
  businessCount,
  maxLocations
}: { 
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string | null;
  businessCount: number;
  maxLocations: number;
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push('/dashboard/upgrade');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
          <Card className="relative overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2.5 dark:bg-amber-900/30">
                    <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Business Limit Reached
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Upgrade your plan to add more businesses
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Status */}
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Current Plan</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentPlan ? PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES]?.name || 'Free' : 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500 dark:text-slate-400">Businesses Used</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {businessCount} / {maxLocations === Infinity ? '∞' : maxLocations}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((businessCount / maxLocations) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/50">
                  <p>
                    You've reached the maximum number of businesses allowed on your current plan. 
                    Upgrade to Growth or Enterprise to add more locations.
                  </p>
                </div>

                {/* Plan Comparison */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
                    <div 
                      key={key}
                      className={`rounded-lg p-3 text-center transition-all ${
                        key === currentPlan 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {plan.name}
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan.maxLocations === Infinity ? '∞' : plan.maxLocations}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        locations
                      </div>
                      {key === currentPlan && (
                        <div className="mt-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          Current
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleUpgrade}
                    className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade Plan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Edit Modal Component
function EditBusinessModal({ 
  business, 
  isOpen, 
  onClose, 
  onSave,
  loading 
}: { 
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
    languages: [] as string[],
    tone: "Professional" as BusinessTone,
    keywords: "",
  });
  const [error, setError] = useState("");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    if (business && isOpen) {
      setEditForm({
        name: business.name,
        category: business.category,
        googleBusinessUrl: business.google_business_url || "",
        location: business.location,
        languages: business.languages || ['en', 'hi'],
        tone: business.tone || "Professional",
        keywords: business.keywords || "",
      });
      setError("");
      setIsLanguageDropdownOpen(false);
    }
  }, [business, isOpen]);

  if (!isOpen || !business) return null;

  const toggleLanguage = (languageCode: string) => {
    setEditForm((prev) => {
      const currentLanguages = prev.languages || [];
      if (currentLanguages.includes(languageCode)) {
        if (currentLanguages.length === 1) return prev;
        return {
          ...prev,
          languages: currentLanguages.filter((code) => code !== languageCode),
        };
      } else {
        return {
          ...prev,
          languages: [...currentLanguages, languageCode],
        };
      }
    });
  };

  const removeLanguage = (languageCode: string) => {
    if (editForm.languages.length === 1) return;
    setEditForm({
      ...editForm,
      languages: editForm.languages.filter((code) => code !== languageCode),
    });
  };

  const handleSave = () => {
    setError("");
    if (!editForm.languages || editForm.languages.length === 0) {
      setError("Please select at least one language");
      return;
    }
    onSave({ id: business.id, ...editForm });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(business.name);
  const initials = getInitials(business.name);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
          <Card className="relative flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl max-h-[90vh]">
            {/* Decorative gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${avatarColor}`} />

            <div className="flex flex-col flex-1 overflow-hidden p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white ${avatarColor} shadow-lg`}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Edit Business
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Update details for {business.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4 overflow-y-auto flex-1 pr-0.5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Business Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Enter business name"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Category
                    </label>
                    <Input
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      placeholder="e.g., Restaurant"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Location
                    </label>
                    <Input
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      placeholder="City, State"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Google Business URL
                    </label>
                    <Input
                      value={editForm.googleBusinessUrl}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          googleBusinessUrl: e.target.value,
                        })
                      }
                      placeholder="https://g.page/your-business"
                      type="url"
                      className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Default Tone
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setEditForm({ ...editForm, tone })}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          editForm.tone === tone
                            ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Keywords
                  </label>
                  <Input
                    value={editForm.keywords}
                    onChange={(e) =>
                      setEditForm({ ...editForm, keywords: e.target.value })
                    }
                    placeholder="service quality, staff behaviour, pricing"
                    className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Add at least 2-3 keywords for better ranking (separated with commas)
                  </p>
                </div>

                {/* Languages Section */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Languages className="h-3.5 w-3.5" />
                    Supported Languages
                  </label>
                  <div className="mt-1 relative">
                    <div 
                      className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    >
                      {editForm.languages && editForm.languages.length > 0 ? (
                        editForm.languages.map((code) => {
                          const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
                          return lang ? (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-medium text-blue-800 dark:text-blue-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.nativeName}</span>
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLanguage(code);
                                }}
                              />
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          Select languages...
                        </span>
                      )}
                      <ChevronDown className={`ml-auto h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Language Dropdown */}
                    {isLanguageDropdownOpen && (
                      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl">
                        <div className="grid grid-cols-1 gap-0.5">
                          {INDIAN_LANGUAGES.map((language) => (
                            <div
                              key={language.code}
                              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30 ${
                                editForm.languages.includes(language.code)
                                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                              onClick={() => toggleLanguage(language.code)}
                            >
                              <div className="flex items-center gap-2">
                                <span>{language.flag}</span>
                                <span>{language.nativeName}</span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  ({language.name})
                                </span>
                              </div>
                              {editForm.languages.includes(language.code) && (
                                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {editForm.languages && editForm.languages.length > 0 
                      ? `${editForm.languages.length} language${editForm.languages.length > 1 ? 's' : ''} selected` 
                      : 'Select at least one language'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={loading || !editForm.languages || editForm.languages.length === 0}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function DashboardBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    const response = await fetch("/api/businesses");
    const json = await response.json();
    setBusinesses(json.data || []);
    setLoading(false);
  };

  const fetchSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();
      console.log("Subscription data:", data);
      
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        const planName = data.subscription.plan_name?.toUpperCase();
        console.log("Plan name from API:", planName);
        
        if (planName && PLAN_FEATURES[planName as keyof typeof PLAN_FEATURES]) {
          setCurrentPlan(planName);
        } else {
          setCurrentPlan('STARTER');
        }
      } else {
        setCurrentPlan('STARTER');
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setCurrentPlan('STARTER');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchSubscription();
  }, []);

  const openEditModal = (business: Business) => {
    setEditingBusiness(business);
    setIsEditModalOpen(true);
    setError("");
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBusiness(null);
    setError("");
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setError("");
  };

  const saveBusinessUpdate = async (data: any) => {
    setError("");
    setLoading(true);

    const response = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    setLoading(false);
    
    if (!response.ok) {
      const errMsg = json.error || "Failed to update business";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    
    toast.success("Business updated successfully!");
    closeEditModal();
    await fetchBusinesses();
  };

  const addNewBusiness = async (data: any) => {
    setError("");
    setLoading(true);

    const response = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    setLoading(false);
    
    if (!response.ok) {
      setError(json.error || "Failed to add business");
      return;
    }
    
    closeAddModal();
    await fetchBusinesses();
    await fetchSubscription();
  };

  const handleAddBusiness = () => {
    const planData = currentPlan ? PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] : PLAN_FEATURES.STARTER;
    const maxLocations = planData?.maxLocations || 1;

    console.log("Current Plan:", currentPlan);
    console.log("Max Locations:", maxLocations);
    console.log("Businesses Count:", businesses.length);

    if (businesses.length >= maxLocations) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const planData = currentPlan ? PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] : PLAN_FEATURES.STARTER;
  const maxLocations = planData?.maxLocations || 1;
  const canAddBusiness = businesses.length < maxLocations;

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Businesses
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage and update all registered businesses in your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {businesses.length} / {maxLocations === Infinity ? '∞' : maxLocations} locations
          </span>
          <Button 
            className={`gap-2 ${
              canAddBusiness 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-400 hover:bg-slate-500 text-white cursor-not-allowed'
            }`}
            onClick={handleAddBusiness}
            disabled={!canAddBusiness}
          >
            {!canAddBusiness ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Business
          </Button>
        </div>
      </div>

      {/* Current Plan Banner */}
      {currentPlan && PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] && (
        <div className={`rounded-xl bg-gradient-to-r ${PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].color} p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {React.createElement(PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].icon, { className: "h-6 w-6" })}
              <div>
                <span className="font-bold">Current Plan: {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].name}</span>
                <span className="ml-3 text-sm opacity-90">
                  {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].scanLimit}
                </span>
                <span className="ml-3 text-sm opacity-90">
                  • {businesses.length} / {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].maxLocations === Infinity ? '∞' : PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].maxLocations} locations
                </span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => router.push('/dashboard/upgrade')}
            >
              View All Plans
            </Button>
          </div>
        </div>
      )}

      {/* Business Grid */}
      {loading && businesses.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No businesses registered yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started by adding your first business
            </p>
            <Button 
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddBusiness}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((business) => {
            const avatarColor = getAvatarColor(business.name);
            const initials = getInitials(business.name);

            return (
              <Card 
                key={business.id} 
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-transparent hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50"
              >
                {/* Decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${avatarColor}`} />

                <div className="p-6">
                  {/* View Mode */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white ${avatarColor} shadow-lg shadow-${avatarColor}/20`}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {business.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {business.category}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(business)}
                        className="border-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        <span className="ml-1.5 text-xs font-medium">Configure</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-medium">{business.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-medium">Tone: {business.tone || 'Professional'}</span>
                      </div>
                    </div>

                    {/* Keywords Display */}
                    {business.keywords && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Keywords:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {business.keywords.split(',').slice(0, 3).map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-950/30 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                          {business.keywords.split(',').length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                              +{business.keywords.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Language Display */}
                    {business.languages && business.languages.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Languages className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Languages:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {business.languages.slice(0, 4).map((code) => {
                            const lang = INDIAN_LANGUAGES.find(l => l.code === code);
                            return lang ? (
                              <span
                                key={code}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              >
                                <span>{lang.flag}</span>
                                <span>{lang.nativeName}</span>
                              </span>
                            ) : null;
                          })}
                          {business.languages.length > 4 && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                              +{business.languages.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {business.google_business_url && (
                      <a
                        href={business.google_business_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        View on Google Business
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Business Modal */}
      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={addNewBusiness}
        loading={loading}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={currentPlan}
        businessCount={businesses.length}
        maxLocations={maxLocations}
      />

      {/* Edit Modal */}
      <EditBusinessModal
        business={editingBusiness}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={saveBusinessUpdate}
        loading={loading}
      />
    </div>
  );
}