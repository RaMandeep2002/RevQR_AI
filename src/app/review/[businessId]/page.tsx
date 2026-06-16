"use client";

import { useEffect, useMemo, useState, use } from "react";
import { Star, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { enforceWordLimit, wordCount } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
];

export default function ReviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const [businessName, setBusinessName] = useState("Loading...");
  const [businessCategory, setBusinessCategory] = useState("");
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("");
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

  const words = useMemo(() => wordCount(reviewText), [reviewText]);

  useEffect(() => {
    const loadBusiness = async () => {
      const response = await fetch(`/api/businesses/${businessId}`);
      const json = await response.json();
      setBusinessName(json.data?.name ?? "Business");
      setBusinessCategory(json.data?.category ?? "Service");
      setGoogleBusinessUrl(json.data?.google_business_url ?? "");

      const browserLang = navigator.language.split("-")[0];
      const supportedLang = LANGUAGES.find((lang) => lang.code === browserLang);
      if (supportedLang) {
        setSelectedLanguage(browserLang);
      }
    };
    loadBusiness();
  }, [businessId]);

  const generateReview = async () => {
    if (!stars) return setError("Please select a star rating first.");

    // Limit to maximum 2 generations
    if (generationCount >= 2) {
      setError(
        "You've already used both AI review generations. Please edit the existing review or write your own.",
      );
      return;
    }

    // Don't generate positive reviews for 3 stars or less
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
    setGenerationCount((prev) => prev + 1); // Increment generation count
  };

  const selectOption = (option: string) => {
    setReviewText(option);
    // Options stay visible - user can still pick another template
  };

  const saveReview = async () => {
    setError("");
    setSuccess("");
    if (!stars) return setError("Select stars before saving.");
    if (!customerName.trim()) return setError("Please enter your name.");
    if (!customerEmail.trim()) return setError("Please enter your email.");
    if (!reviewText.trim()) return setError("Review text is empty.");
    if (words > 150) return setError("Review must be 150 words or less.");

    // Handle low-star reviews differently
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
      // First, save the review to the database (same as positive reviews)
      const reviewResponse = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          customerName,
          customerEmail,
          stars,
          reviewText,
          isPublic: false, // Mark as private feedback
          type: "negative_feedback",
        }),
      });

      const reviewJson = await reviewResponse.json();

      if (!reviewResponse.ok) {
        throw new Error(reviewJson.error || "Failed to save review");
      }

      // Optionally, also send to a separate feedback endpoint for analytics
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
        }),
      }).catch(console.error); // Don't block if feedback endpoint fails

      setSuccess(
        "Thank you for your honest feedback. We appreciate you helping us improve! Your feedback has been recorded.",
      );
      setShowFeedbackForm(false);

      // Optional: Send email notification to business owner
      await fetch("/api/notifications/negative-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          customerName,
          stars,
          reviewText,
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

  // Star rating labels and messages
  const getStarMessage = (rating: number) => {
    if (rating <= 2)
      return "We're sorry to hear that. Please share how we can improve.";
    if (rating === 3)
      return "Thank you for your feedback. Tell us what could make it better.";
    if (rating === 4) return "Great! Please share what you loved.";
    return "Excellent! Share your wonderful experience!";
  };

  const getCurrentLanguageName = () => {
    const lang = LANGUAGES.find((l) => l.code === selectedLanguage);
    return lang ? `${lang.flag} ${lang.name}` : "🌐 Select Language";
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-xl animate-fade-in">
        <Card className="overflow-hidden border-none shadow-2xl shadow-brand-500/10 ring-1 ring-slate-200">
          <div
            className={`px-6 py-8 text-center text-white ${
              stars <= 3 && stars > 0 ? "bg-amber-600" : "bg-brand-600"
            }`}
          >
            <h1 className="text-2xl font-black tracking-tight">
              {businessName}
            </h1>
            <p className="mt-2 text-sm font-medium text-brand-100 uppercase tracking-widest">
              Customer Review
            </p>
          </div>

          <div className="p-6 md:p-8">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-scale-in">
                <div
                  className={`rounded-full p-4 mb-4 ${
                    stars <= 3 ? "bg-amber-100" : "bg-emerald-100"
                  }`}
                >
                  {stars <= 3 ? (
                    <AlertCircle
                      className={`h-12 w-12 ${
                        stars <= 3 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    />
                  ) : (
                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {stars <= 3 ? "Feedback Received!" : "Thank you!"}
                </h2>
                <p className="mt-2 text-slate-600">{success}</p>
                {stars <= 3 && (
                  <p className="mt-4 text-sm text-slate-500 max-w-md">
                    We take your feedback seriously and will work to improve our
                    services. A member of our team may reach out to you.
                  </p>
                )}
                <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  {stars > 3 && googleBusinessUrl && (
                    <a
                      href={googleBusinessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
                    >
                      Open Google Review Page
                    </a>
                  )}
                  <Button className="" onClick={() => window.location.reload()}>
                    Leave another {stars <= 3 ? "feedback" : "review"}
                  </Button>
                </div>
              </div>
            ) : showFeedbackForm ? (
              // Low-star feedback form
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    We Value Your Honest Feedback
                  </h3>
                  <p className="mt-2 text-slate-600">{getStarMessage(stars)}</p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                  <p className="text-sm text-amber-800">
                    <strong>Your rating:</strong> {stars}{" "}
                    {stars === 1 ? "star" : "stars"}
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Your feedback helps us improve. Instead of posting a public
                    review, your feedback will be sent directly to our team.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    What went wrong?
                  </label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(enforceWordLimit(e.target.value, 150))
                    }
                    placeholder="Please tell us about your experience in detail..."
                    className="rounded-xl border-slate-200 bg-slate-50/50 p-4 min-h-[150px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={submitLowStarFeedback}
                    loading={saving}
                    disabled={!reviewText.trim()}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    Submit Feedback
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl border-slate-200 bg-slate-50/50"
                    required
                  />
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Your email"
                    className="rounded-xl border-slate-200 bg-slate-50/50"
                    required
                  />
                </div>

                {/* Star Section */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
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
                          setGenerationCount(0); // Reset generation count when star rating changes
                        }}
                        className="group relative transform transition-all hover:scale-125 active:scale-95"
                        aria-label={`${value} stars`}
                      >
                        <Star
                          className={`h-12 w-12 transition-all duration-300 ${value <= stars ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-200"}`}
                        />
                      </button>
                    ))}
                  </div>
                  {stars > 0 && (
                    <div className="mt-4 space-y-2">
                      <p
                        className={`text-sm font-bold animate-in fade-in slide-in-from-bottom-2 ${
                          stars <= 2
                            ? "text-red-600"
                            : stars === 3
                              ? "text-amber-600"
                              : stars === 4
                                ? "text-blue-600"
                                : "text-emerald-600"
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
                {stars >= 4 && (
                  <div className="space-y-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowLanguageSelector(!showLanguageSelector)
                        }
                        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-brand-300 hover:shadow-md"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span>{getCurrentLanguageName()}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${showLanguageSelector ? "rotate-180" : ""}`}
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
                        <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                          <div className="max-h-64 overflow-y-auto p-2">
                            {LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setSelectedLanguage(lang.code);
                                  setShowLanguageSelector(false);
                                  setGeneratedOptions([]); // Clear options when language changes
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-brand-50 ${
                                  selectedLanguage === lang.code
                                    ? "bg-brand-50 text-brand-700 font-medium"
                                    : "text-slate-700"
                                }`}
                              >
                                <span className="text-xl">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {selectedLanguage === lang.code && (
                                  <CheckCircle className="ml-auto h-4 w-4 text-brand-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={generateReview}
                        loading={loadingAI}
                        disabled={generationCount >= 2}
                        className="flex-1 py-6 text-base font-bold transition-all bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Generation limit warning */}
                    {generationCount >= 2 && (
                      <div className="rounded-lg bg-amber-50 p-3 text-center border border-amber-100">
                        <p className="text-xs text-amber-700">
                          You've used both AI generations. You can edit the
                          review below or write your own.
                        </p>
                      </div>
                    )}

                    {generatedOptions.length > 0 && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Choose your template
                            </p>
                          </div>
                          <span className="text-xs font-medium text-brand-600 bg-brand-50/80 px-2.5 py-1 rounded-full">
                            {generatedOptions.length} available
                          </span>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
                          {generatedOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => selectOption(opt)}
                              className="group relative min-w-[320px] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                            >
                              {/* Quote Icon */}
                              <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-full bg-brand-50 p-2 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
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

                              {/* Review Text */}
                              <p className="text-sm leading-7 text-slate-700">
                                "{opt}"
                              </p>

                              {/* Bottom CTA */}
                              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-xs font-medium text-slate-400">
                                  Tap to use this review
                                </span>

                                <div className="rounded-full bg-slate-100 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500">
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

                {/* Edit Section - Different placeholder for low stars */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
                    className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                      !
                    </span>
                    {error}
                  </div>
                )}

                <Button
                  className={`w-full py-8 text-xl font-black rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5 active:translate-y-0 ${
                    stars <= 3
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  onClick={saveReview}
                  loading={saving}
                  disabled={!reviewText.trim()}
                >
                  {stars <= 3 ? "Submit Feedback" : "Publish Review"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Powered by <span className="text-brand-600">QReview</span>
        </p>
      </div>
    </main>
  );
}
