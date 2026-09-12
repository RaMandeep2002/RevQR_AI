"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  QrCode,
  Sparkles,
  Languages,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { generateProfessionalQrImage } from "@/lib/utils";
import { Business } from "@/types";
import { useNextStep } from "nextstepjs";

const defaultForm = {
  name: "",
  email: "",
  category: "",
  googleBusinessUrl: "",
  location: "",
};

type SetupStage = "idle" | "creating" | "generating" | "ready";

// Indian languages with their native names
const INDIAN_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্" },
  { code: "bodo", name: "Bodo", nativeName: "बर' " },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [stage, setStage] = useState<SetupStage>("idle");
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en", "hi"]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const [hasSeenTour, setHasSeenTour] = useState(false);
  const { startNextStep } = useNextStep();

  useEffect(() => {
    const tourSeen = localStorage.getItem("DemoQR_onbaoding_tour_seen");
    if (!tourSeen) {
      const timer = setTimeout(() => {
        startNextStep("onboardingTour");
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, [startNextStep]);

  useEffect(() => {
    const checkExistingSetup = async () => {
      const response = await fetch("/api/businesses");
      const json = await response.json();
      if (response.ok && json.data?.length) {
        router.replace("/dashboard");
        return;
      }
      setCheckingExisting(false);
    };

    checkExistingSetup();
  }, [router]);

  useEffect(() => {
    if (stage !== "ready" || !createdBusiness) return;

    const timer = window.setTimeout(() => {
      router.push(`/dashboard?businessId=${createdBusiness.id}`);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [createdBusiness, router, stage]);

  const progress = useMemo(() => {
    if (stage === "ready") return 100;
    if (stage === "generating") return 72;
    if (stage === "creating") return 38;
    return 12;
  }, [stage]);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleLanguage = (languageCode: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(languageCode)) {
        // Don't remove if it's the last selected language
        if (prev.length === 1) return prev;
        return prev.filter((code) => code !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const removeLanguage = (languageCode: string) => {
    if (selectedLanguages.length === 1) return;
    setSelectedLanguages((prev) => prev.filter((code) => code !== languageCode));
  };

  const generateQrPoster = async (business: Business) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const reviewUrl = `${base}/review/${business.id}?salt=v1`;
    const qrUrl = await QRCode.toDataURL(reviewUrl, {
      width: 420,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });

    return generateProfessionalQrImage(qrUrl, business.name, business.category);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setQrDataUrl("");
    setStage("creating");

    // Save selected languages along with business data
    const businessData = {
      ...form,
      languages: selectedLanguages,
    };

    const response = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(businessData),
    });
    const json = await response.json();

    if (!response.ok) {
      setStage("idle");
      setError(json.error || "We could not create your business setup.");
      return;
    }

    setCreatedBusiness(json.data);
    setStage("generating");

    try {
      const poster = await generateQrPoster(json.data);
      setQrDataUrl(poster);
      setForm(defaultForm);
      setStage("ready");
    } catch {
      setStage("idle");
      setError(
        "Business created, but the QR poster could not be generated. Please open the dashboard to try again.",
      );
    }
  };

  const isBusy = stage === "creating" || stage === "generating";

  if (checkingExisting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-emerald-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading ...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-950">
      <section className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:px-14">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80"
            alt="Business counter"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="relative z-10 flex items-center justify-between">
            <img
              src="/DemoQR-logo.png"
              alt="DemoQR Logo"
              className="h-auto w-44 brightness-0 invert"
            />
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
              Setup
            </span>
          </div>

          <div className="relative z-10 max-w-xl py-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-100 ring-1 ring-emerald-300/20">
              <Sparkles className="h-4 w-4" />
              First QR in under two minutes
            </div>
            <h1
              id="tour-welcome"
              className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"
            >
              Build your first review QR setup.
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-200">
              Add your business details once. DemoQR creates a review
              collection QR poster and opens the dashboard with your new
              business ready to manage.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Business profile"],
              ["2", "QR poster"],
              ["3", "Dashboard"],
            ].map(([step, label]) => (
              <div
                key={step}
                className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xs font-black text-emerald-200">{step}</p>
                <p className="mt-2 text-sm font-bold text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-5xl gap-8 xl:grid-cols-[1fr_0.85fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                  Onboarding
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Create your business
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  These details power the customer-facing review page and your
                  downloadable QR poster.
                </p>
              </div>

              {/* Language Selection Section */}
              <div id="tour-language-selector" className="mb-6">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                    <Languages className="h-4 w-4" />
                    Select languages for your review page
                  </span>
                  
                  {/* Language selection dropdown */}
                  <div className="relative">
                    <div 
                      className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:border-emerald-400 transition-colors"
                      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    >
                      {selectedLanguages.length > 0 ? (
                        selectedLanguages.map((code) => {
                          const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
                          return lang ? (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lang.nativeName}
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-emerald-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLanguage(code);
                                }}
                              />
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-slate-500">
                          Select languages...
                        </span>
                      )}
                      <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
                    </div>

                    {/* Dropdown */}
                    {isLanguageDropdownOpen && (
                      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                        {INDIAN_LANGUAGES.map((language) => (
                          <div
                            key={language.code}
                            className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-emerald-50 ${
                              selectedLanguages.includes(language.code)
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-slate-700"
                            }`}
                            onClick={() => toggleLanguage(language.code)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{language.nativeName}</span>
                              <span className="text-xs text-slate-400">
                                ({language.name})
                              </span>
                            </div>
                            {selectedLanguages.includes(language.code) && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400">
                    Select languages your customers can use to leave reviews
                  </p>
                </label>
              </div>

              <form
                id="tour-business-form"
                className="grid gap-5"
                onSubmit={handleSubmit}
              >
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Business name
                  </span>
                  <Input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="DemoQR Coffee House"
                    required
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Contact email
                    </span>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateForm("email", event.target.value)
                      }
                      placeholder="hello@company.com"
                      required
                      className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Category
                    </span>
                    <Input
                      value={form.category}
                      onChange={(event) =>
                        updateForm("category", event.target.value)
                      }
                      placeholder="Restaurant, Salon, Clinic"
                      required
                      className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                    />
                  </label>
                </div>

                <label id="tour-google-url" className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Google Business URL
                  </span>
                  <Input
                    type="url"
                    value={form.googleBusinessUrl}
                    onChange={(event) =>
                      updateForm("googleBusinessUrl", event.target.value)
                    }
                    placeholder="https://g.page/r/your-business/review"
                    required
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Location
                  </span>
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      updateForm("location", event.target.value)
                    }
                    placeholder="New Delhi, India"
                    required
                    className="h-12 rounded-lg border-slate-200 bg-slate-50 px-4 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                  />
                </label>

                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  id="tour-submit"
                  type="submit"
                  loading={isBusy}
                  disabled={isBusy || selectedLanguages.length === 0}
                  className="h-12 rounded-lg bg-slate-950 text-sm font-black text-white hover:bg-slate-800"
                >
                  {stage === "generating"
                    ? "Generating QR poster"
                    : "Create QR setup"}
                  {!isBusy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            </div>

            <aside className="grid gap-5">
              <div
                id="tour-progress"
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                      Progress
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">
                      Launch status
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    {stage === "ready" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <QrCode className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-6 grid gap-3">
                  {[
                    ["Profile", stage !== "idle"],
                    [
                      "Languages selected",
                      selectedLanguages.length > 0,
                    ],
                    [
                      "QR generated",
                      stage === "generating" || stage === "ready",
                    ],
                    ["Dashboard handoff", stage === "ready"],
                  ].map(([label, active]) => (
                    <div
                      key={String(label)}
                      className="flex items-center gap-3 text-sm font-bold text-slate-600"
                    >
                      <BadgeCheck
                        className={`h-4 w-4 ${active ? "text-emerald-600" : "text-slate-300"}`}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="tour-qr-preview"
                className="rounded-lg border border-slate-200 p-6 bg-white text-black shadow-xl shadow-slate-300/60"
              >
                {qrDataUrl ? (
                  <div className="text-center">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR poster"
                      className="mx-auto w-48 rounded-lg border border-white/10 shadow-2xl"
                    />
                    <p className="mt-4 text-sm font-black text-emerald-200">
                      QR is ready
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      Opening your dashboard now...
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-black bg-white/5">
                      <QrCode className="h-16 w-16 text-slate-500" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Building2 className="h-4 w-4 text-emerald-300" />
                        {form.name || "Your business"}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <MapPin className="h-4 w-4 text-blue-300" />
                        {form.location || "Business location"}
                      </div>
                      {selectedLanguages.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedLanguages.map((code) => {
                            const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
                            return lang ? (
                              <span
                                key={code}
                                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                              >
                                {lang.nativeName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
