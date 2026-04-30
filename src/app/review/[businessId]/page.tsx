"use client";

import { useEffect, useMemo, useState, use } from "react";
import { Star, CheckCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { enforceWordLimit, wordCount } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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

  const words = useMemo(() => wordCount(reviewText), [reviewText]);

  useEffect(() => {
    const loadBusiness = async () => {
      const response = await fetch(`/api/businesses/${businessId}`);
      const json = await response.json();
      setBusinessName(json.data?.name ?? "Business");
      setBusinessCategory(json.data?.category ?? "Service");
      setGoogleBusinessUrl(json.data?.google_business_url ?? "");
    };
    loadBusiness();
  }, [businessId]);

  const generateReview = async () => {
    if (!stars) return setError("Please select a star rating first.");
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
        businessId
      }),
    });

    const json = await response.json();
    setLoadingAI(false);
    if (!response.ok) return setError(json.error || "AI generation failed");
    setGeneratedOptions(json.options || []);
  };

  const selectOption = (option: string) => {
    setReviewText(option);
    setGeneratedOptions([]); // Hide options once selected
  };

  const saveReview = async () => {
    setError("");
    setSuccess("");
    if (!stars) return setError("Select stars before saving.");
    if (!customerName.trim()) return setError("Please enter your name.");
    if (!customerEmail.trim()) return setError("Please enter your email.");
    if (!reviewText.trim()) return setError("Review text is empty.");
    if (words > 150) return setError("Review must be 150 words or less.");

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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-xl animate-fade-in">
        <Card className="overflow-hidden border-none shadow-2xl shadow-brand-500/10 ring-1 ring-slate-200">
          <div className="bg-brand-600 px-6 py-8 text-center text-white">
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
                <div className="rounded-full bg-emerald-100 p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Thank you!
                </h2>
                <p className="mt-2 text-slate-600">
                  Your review is saved. Google page is opened for quick paste.
                </p>
                <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href={googleBusinessUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                      googleBusinessUrl
                        ? "bg-slate-900 hover:bg-slate-800"
                        : "pointer-events-none bg-slate-400"
                    }`}
                  >
                    Open Google Review Page
                  </a>
                </div>
                <Button
                  className="mt-4 bg-slate-100 text-slate-900 hover:bg-slate-200"
                  onClick={() => window.location.reload()}
                >
                  Leave another
                </Button>
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
                        onClick={() => setStars(value)}
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
                    <p className="mt-4 text-sm font-bold text-amber-600 animate-in fade-in slide-in-from-bottom-2">
                      {
                        [
                          "Disappointing",
                          "Fair",
                          "Good",
                          "Great!",
                          "Exceptional!",
                        ][stars - 1]
                      }
                    </p>
                  )}
                </div>

                {/* AI Generation Section */}
                <div className="space-y-4">
                  <Button
                    onClick={generateReview}
                    loading={loadingAI}
                    className={`w-full py-6 text-base font-bold transition-all ${stars === 0 ? "opacity-50 grayscale cursor-not-allowed" : "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20"}`}
                  >
                    {loadingAI
                      ? "Crafting your options..."
                      : "✨ Generate AI Reviews"}
                  </Button>

                  {generatedOptions.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      {/* Header */}
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

                      {/* Scrollable container - all options scroll vertically */}
                      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {generatedOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => selectOption(opt)}
                            className="group relative w-full flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                          >
                            {/* Quote icon + text */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 text-brand-400 group-hover:text-brand-500 transition-colors mt-0.5">
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                              </div>
                              <p className="flex-1 text-sm leading-relaxed text-slate-700">
                                &quot;{opt}&quot;
                              </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                  #{i + 1}
                                </span>
                                {/* <span className="text-[10px] text-slate-400">
                                  Template
                                </span> */}
                              </div>
                              <div className="rounded-full bg-slate-100 p-1.5 group-hover:bg-brand-500 transition-all duration-200 group-hover:scale-105">
                                <svg
                                  className="h-3.5 w-3.5 text-slate-400 group-hover:text-white"
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

                            {/* Hover overlay */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-brand-500/0 transition-all duration-300 pointer-events-none" />
                          </button>
                        ))}
                      </div>

                      {/* Scroll hint */}
                      <div className="flex justify-center gap-1">
                        <div className="h-1 w-8 rounded-full bg-brand-200" />
                        <div className="h-1 w-2 rounded-full bg-slate-300" />
                        <div className="h-1 w-2 rounded-full bg-slate-300" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Final Review
                    </label>
                    <span
                      className={`text-[10px] font-bold ${words > 150 ? "text-red-500" : "text-slate-400"}`}
                    >
                      {words} / 150 WORDS
                    </span>
                  </div>
                  <Textarea
                    // rows={5}
                    value={reviewText}
                    onChange={(e) =>
                      setReviewText(enforceWordLimit(e.target.value, 150))
                    }
                    placeholder="Describe your experience here..."
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
                  className="w-full py-8 text-xl font-black bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                  onClick={saveReview}
                  loading={saving}
                  disabled={!reviewText.trim()}
                >
                  Publish Review
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
