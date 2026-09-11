"use client";

import { useEffect, useMemo, useState, use, useRef } from "react";
import { Star, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { enforceWordLimit, wordCount } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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

// Color mapping for star ratings
const getStarColor = (rating: number) => {
  if (rating === 0) return "bg-blue-600";
  if (rating <= 2) return "bg-red-500";
  if (rating === 3) return "bg-amber-500";
  if (rating === 4) return "bg-blue-500";
  return "bg-emerald-500";
};

const getStarTextColor = (rating: number) => {
  if (rating === 0) return "text-blue-100";
  if (rating <= 2) return "text-red-100";
  if (rating === 3) return "text-amber-100";
  if (rating === 4) return "text-blue-100";
  return "text-emerald-100";
};

const getStarLabel = (rating: number) => {
  if (rating === 0) return "Customer Review";
  if (rating <= 2) return "We Value Your Feedback";
  if (rating === 3) return "Help Us Improve";
  if (rating === 4) return "Great Experience!";
  return "Excellent Experience!";
};

export default function ReviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const [businessName, setBusinessName] = useState("Loading...");
  const [businessCategory, setBusinessCategory] = useState("");
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
  const [businessLanguages, setBusinessLanguages] = useState<string[]>([
    "en",
    "hi",
  ]); // Store business languages
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const hasRecordedScan = useRef(false);

  const words = useMemo(() => wordCount(reviewText), [reviewText]);

  // Get available languages based on business settings
  const availableLanguages = useMemo(() => {
    return INDIAN_LANGUAGES.filter((lang) =>
      businessLanguages.includes(lang.code),
    );
  }, [businessLanguages]);

  useEffect(() => {
    const loadBusiness = async () => {
      const response = await fetch(`/api/businesses/${businessId}`);
      const json = await response.json();
      console.log("response -------> ", json);

      const business = json.data;
      if (business?.limitExceeded) {
        setLimitExceeded(true);
      } else if (!hasRecordedScan.current) {
        hasRecordedScan.current = true;
        console.log("hasRecordedScan ---> ", hasRecordedScan.current)
        fetch(`/api/businesses/${businessId}/scan`, { method: "POST" }).catch(console.error);
      }

      setBusinessName(business?.name ?? "Business");
      setBusinessCategory(business?.category ?? "Service");
      setGoogleBusinessUrl(business?.google_business_url ?? "");

      // Get languages from business data, default to ['en', 'hi']
      const languages = business?.languages || ["en", "hi"];
      // console.log(languages);
      setBusinessLanguages(languages);

      // Set initial language based on browser preference or first available
      const browserLang = navigator.language.split("-")[0];
      const supportedLang = availableLanguages.find(
        (lang) => lang.code === browserLang,
      );
      if (supportedLang) {
        setSelectedLanguage(browserLang);
      } else if (languages.length > 0) {
        setSelectedLanguage(languages[0]);
      }
    };
    loadBusiness();
  }, [businessId]);

  const generateReview = async () => {
    if (!stars) return setError("Please select a star rating first.");

    if (generationCount >= 2) {
      setError(
        "You've already used both AI review generations. Please edit the existing review or write your own.",
      );
      return;
    }

    if (stars <= 3) {
      setError(
        "For ratings of 3 stars or less, please write your own feedback. We value honest reviews.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoadingAI(true);
    setGeneratedOptions([]);

    const response = await fetch("/api/ai/generate-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stars,
        businessName,
        category: businessCategory,
        businessId,
        language: selectedLanguage,
      }),
    });

    const json = await response.json();
    setLoadingAI(false);
    if (!response.ok) return setError(json.error || "AI generation failed");

    setGeneratedOptions(json.options || []);
    setGenerationCount((prev) => prev + 1);
  };

  const selectOption = (option: string) => {
    setReviewText(option);
  };

  const saveReview = async () => {
    setError("");
    setSuccess("");
    if (!stars) return setError("Select stars before saving.");
    if (!customerName.trim()) return setError("Please enter your name.");
    if (!reviewText.trim()) return setError("Review text is empty.");
    if (words > 150) return setError("Review must be 150 words or less.");

    if (stars <= 3) {
      setShowFeedbackForm(true);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: businessId,
        customerName,
        customerEmail,
        stars,
        reviewText,
        language: selectedLanguage, // Add language to review
      }),
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error || "Failed to save review");

    try {
      await navigator.clipboard.writeText(reviewText);
    } catch {
      // Clipboard permission can fail on some browsers.
    }

    if (googleBusinessUrl) {
      window.open(googleBusinessUrl, "_blank", "noopener,noreferrer");
      setSuccess(
        "Review saved. Google page opened. Paste and submit your review there.",
      );
      return;
    }
    setSuccess("Review saved. Copy the text and paste it on Google.");
  };

  const submitLowStarFeedback = async () => {
    setSaving(true);
    setError("");

    try {
      const reviewResponse = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          customerName,
          customerEmail,
          stars,
          reviewText,
          isPublic: false,
          type: "negative_feedback",
          language: selectedLanguage, // Add language to feedback
        }),
      });

      const reviewJson = await reviewResponse.json();

      if (!reviewResponse.ok) {
        throw new Error(reviewJson.error || "Failed to save review");
      }

      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          reviewId: reviewJson.data?.id,
          customerName,
          customerEmail,
          stars,
          reviewText,
          type: "negative_feedback",
          language: selectedLanguage,
        }),
      }).catch(console.error);

      setSuccess(
        "Thank you for your honest feedback. We appreciate you helping us improve! Your feedback has been recorded.",
      );
      setShowFeedbackForm(false);

      await fetch("/api/notifications/negative-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          customerName,
          stars,
          reviewText,
          language: selectedLanguage,
        }),
      }).catch(console.error);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStarMessage = (rating: number) => {
    if (rating <= 2)
      return "We're sorry to hear that. Please share how we can improve.";
    if (rating === 3)
      return "Thank you for your feedback. Tell us what could make it better.";
    if (rating === 4) return "Great! Please share what you loved.";
    return "Excellent! Share your wonderful experience!";
  };

  const getCurrentLanguageDisplay = () => {
    const lang = availableLanguages.find((l) => l.code === selectedLanguage);
    if (lang) {
      return `${lang.flag} ${lang.nativeName} (${lang.name})`;
    }
    return "🌐 Select Language";
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-6 bg-slate-50">
      <div className="w-full max-w-xl">
        {limitExceeded ? (
          <Card className="overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
              Service Temporarily Unavailable
            </h1>
            <p className="text-slate-600">
              {" "}
              We're currently experiencing a temporary service interruption. Our
              team is working to restore full functionality as quickly as
              possible. Thank you for your patience, and please check back
              shortly.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
            <div
              className={`px-6 py-8 text-center text-white transition-all duration-500 ${getStarColor(stars)}`}
            >
              <h1 className="text-2xl font-black tracking-tight">
                {businessName}
              </h1>
              <p
                className={`mt-2 text-sm font-medium uppercase tracking-widest transition-all duration-500 ${getStarTextColor(stars)}`}
              >
                {getStarLabel(stars)}
              </p>
              {availableLanguages.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {availableLanguages.map((lang) => (
                    <span
                      key={lang.code}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        lang.code === selectedLanguage
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {lang.flag} {lang.nativeName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className={`rounded-full p-4 mb-4 ${
                      stars <= 3 ? "bg-amber-50" : "bg-emerald-50"
                    }`}
                  >
                    {stars <= 3 ? (
                      <AlertCircle
                        className={`h-12 w-12 ${
                          stars <= 3 ? "text-amber-500" : "text-emerald-500"
                        }`}
                      />
                    ) : (
                      <CheckCircle className="h-12 w-12 text-emerald-500" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {stars <= 3 ? "Feedback Received!" : "Thank you!"}
                  </h2>
                  <p className="mt-2 text-slate-600">{success}</p>
                  {stars <= 3 && (
                    <p className="mt-4 text-sm text-slate-500 max-w-md">
                      We take your feedback seriously and will work to improve
                      our services. A member of our team may reach out to you.
                    </p>
                  )}
                  <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    {stars > 3 && googleBusinessUrl && (
                      <a
                        href={googleBusinessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        Open Google Review Page
                      </a>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition-colors duration-200"
                    >
                      Leave another {stars <= 3 ? "feedback" : "review"}
                    </Button>
                  </div>
                </div>
              ) : showFeedbackForm ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      We Value Your Honest Feedback
                    </h3>
                    <p className="mt-2 text-slate-600">
                      {getStarMessage(stars)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
                    <p className="text-sm text-amber-700">
                      <strong>Your rating:</strong> {stars}{" "}
                      {stars === 1 ? "star" : "stars"}
                    </p>
                    <p className="mt-2 text-sm text-amber-600">
                      Your feedback helps us improve. Instead of posting a
                      public review, your feedback will be sent directly to our
                      team.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      What went wrong?
                    </label>
                    <Textarea
                      value={reviewText}
                      onChange={(e) =>
                        setReviewText(enforceWordLimit(e.target.value, 150))
                      }
                      placeholder="Please tell us about your experience in detail..."
                      className="rounded-xl border-slate-200 text-black p-4 min-h-[150px] focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowFeedbackForm(false)}
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition-colors duration-200"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={submitLowStarFeedback}
                      disabled={saving || !reviewText.trim()}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="customer-name"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-black"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="customer-email"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Email Address{" "}
                        <span className="text-slate-400 font-normal normal-case tracking-normal">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 text-black"
                      />
                    </div>
                  </div>

                  {/* Star Section */}
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      How was your experience?
                    </p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => {
                            setStars(value);
                            setGeneratedOptions([]);
                            setReviewText("");
                            setGenerationCount(0);
                          }}
                          className="group relative transform transition-all hover:scale-125 active:scale-95"
                          aria-label={`${value} stars`}
                        >
                          <Star
                            className={`h-12 w-12 transition-all duration-300 ${
                              value <= stars
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                                : "text-slate-200 hover:text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {stars > 0 && (
                      <div className="mt-4 space-y-2">
                        <p
                          className={`text-sm font-bold transition-all duration-300 ${
                            stars <= 2
                              ? "text-red-500"
                              : stars === 3
                                ? "text-amber-500"
                                : stars === 4
                                  ? "text-blue-500"
                                  : "text-emerald-500"
                          }`}
                        >
                          {
                            [
                              "Very Disappointing",
                              "Needs Improvement",
                              "Fair - Could be better",
                              "Good!",
                              "Excellent!",
                            ][stars - 1]
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Generation Section - Only for 4+ stars */}
                  {stars >= 4 && availableLanguages.length > 0 && (
                    <div className="space-y-4">
                      {/* Language Selector - Only show if multiple languages available */}
                      {availableLanguages.length > 1 && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowLanguageSelector(!showLanguageSelector)
                            }
                            className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-400" />
                              <span>{getCurrentLanguageDisplay()}</span>
                            </div>
                            <svg
                              className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${showLanguageSelector ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {showLanguageSelector && (
                            <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
                              <div className="max-h-64 overflow-y-auto p-2">
                                {availableLanguages.map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => {
                                      setSelectedLanguage(lang.code);
                                      setShowLanguageSelector(false);
                                      setGeneratedOptions([]);
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 ${
                                      selectedLanguage === lang.code
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span>{lang.nativeName}</span>
                                    <span className="text-xs text-slate-400">
                                      ({lang.name})
                                    </span>
                                    {selectedLanguage === lang.code && (
                                      <CheckCircle className="ml-auto h-4 w-4 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={generateReview}
                          disabled={loadingAI || generationCount >= 2}
                          className="flex-1 py-6 text-base font-bold transition-all bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        >
                          {loadingAI
                            ? "Crafting your options..."
                            : generationCount >= 2
                              ? "✨ Max generations used"
                              : generationCount > 0
                                ? `✨ Generate AI Review Templates (${generationCount}/2 used)`
                                : "✨ Generate AI Review Templates"}
                        </Button>
                      </div>

                      {generationCount >= 2 && (
                        <div className="rounded-lg bg-amber-50 p-3 text-center border border-amber-200">
                          <p className="text-xs text-amber-700">
                            You've used both AI generations. You can edit the
                            review below or write your own.
                          </p>
                        </div>
                      )}

                      {generatedOptions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Choose your template
                              </p>
                            </div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                              {generatedOptions.length} available
                            </span>
                          </div>

                          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                            {generatedOptions.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => selectOption(opt)}
                                className="group relative min-w-[320px] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                <div className="mb-4 flex items-start justify-between">
                                  <div className="rounded-full bg-blue-50 p-2 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <svg
                                      className="h-4 w-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                  </div>

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500">
                                    OPTION {i + 1}
                                  </span>
                                </div>

                                <p className="text-sm leading-7 text-slate-700">
                                  "{opt}"
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                  <span className="text-xs font-medium text-slate-400">
                                    Tap to use this review
                                  </span>

                                  <div className="rounded-full bg-slate-100 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600">
                                    <svg
                                      className="h-4 w-4 text-slate-400 group-hover:text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2.5}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {stars <= 3 ? "Your Feedback" : "Final Review"}
                      </label>
                      <span
                        className={`text-[10px] font-bold ${words > 150 ? "text-red-500" : "text-slate-400"}`}
                      >
                        {words} / 150 WORDS
                      </span>
                    </div>
                    <Textarea
                      value={reviewText}
                      onChange={(e) =>
                        setReviewText(enforceWordLimit(e.target.value, 150))
                      }
                      placeholder={
                        stars <= 3
                          ? "Please share your honest feedback so we can improve..."
                          : "Describe your experience here..."
                      }
                      className="rounded-2xl border-slate-200 bg-white p-4 text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        !
                      </span>
                      {error}
                    </div>
                  )}

                  <Button
                    className={`w-full py-8 text-xl font-black rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                      stars <= 2
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : stars === 3
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : stars === 4
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : stars === 5
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                    onClick={saveReview}
                    disabled={saving || !reviewText.trim()}
                  >
                    {stars <= 3 ? "Submit Feedback" : "Publish Review"}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Powered by <span className="text-blue-600">DemoQR</span>
        </p>
      </div>
    </main>
  );
}
