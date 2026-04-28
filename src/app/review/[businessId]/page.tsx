"use client";

import { useEffect, useMemo, useState, use } from "react";
import { Star, CheckCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { enforceWordLimit, wordCount } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = use(params);
  const [businessName, setBusinessName] = useState("Loading...");
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
      console.log("json -----> ", json)
      setBusinessName(json.data?.name ?? "Business");
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
      body: JSON.stringify({ stars })
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
    if (!reviewText.trim()) return setError("Review text is empty.");
    if (words > 150) return setError("Review must be 150 words or less.");

    setSaving(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: businessId, stars, reviewText })
    });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setError(json.error || "Failed to save review");
    setSuccess("Review saved successfully.");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 md:px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-xl animate-fade-in">
        <Card className="overflow-hidden border-none shadow-2xl shadow-brand-500/10 ring-1 ring-slate-200">
          <div className="bg-brand-600 px-6 py-8 text-center text-white">
            <h1 className="text-2xl font-black tracking-tight">{businessName}</h1>
            <p className="mt-2 text-sm font-medium text-brand-100 uppercase tracking-widest">Customer Review</p>
          </div>

          <div className="p-6 md:p-8">
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-scale-in">
                <div className="rounded-full bg-emerald-100 p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Thank you!</h2>
                <p className="mt-2 text-slate-600">Your review has been posted successfully.</p>
                <Button className="mt-8 bg-slate-900 hover:bg-slate-800" onClick={() => window.location.reload()}>
                  Leave another
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Star Section */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">How was your experience?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button 
                        key={value} 
                        onClick={() => setStars(value)} 
                        className="group relative transform transition-all hover:scale-125 active:scale-95" 
                        aria-label={`${value} stars`}
                      >
                        <Star className={`h-12 w-12 transition-all duration-300 ${value <= stars ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-slate-200"}`} />
                      </button>
                    ))}
                  </div>
                  {stars > 0 && (
                    <p className="mt-4 text-sm font-bold text-amber-600 animate-in fade-in slide-in-from-bottom-2">
                      {["Disappointing", "Fair", "Good", "Great!", "Exceptional!"][stars - 1]}
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
                    {loadingAI ? "Crafting your options..." : "✨ Generate AI Reviews"}
                  </Button>

                  {generatedOptions.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Pick a template to personalize</p>
                      <div className="grid gap-3">
                        {generatedOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => selectOption(opt)}
                            className="group relative flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-left text-sm text-slate-700 transition-all hover:border-brand-500 hover:bg-white hover:shadow-md"
                          >
                            <span className="flex-1 line-clamp-2 leading-relaxed italic">{opt}</span>
                            <div className="rounded-full bg-brand-100 p-1 group-hover:bg-brand-600 transition-colors">
                              <CheckCircle className="h-4 w-4 text-brand-600 group-hover:text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Review</label>
                    <span className={`text-[10px] font-bold ${words > 150 ? "text-red-500" : "text-slate-400"}`}>
                      {words} / 150 WORDS
                    </span>
                  </div>  
                  <Textarea
                    // rows={5}
                    value={reviewText}
                    onChange={(e) => setReviewText(enforceWordLimit(e.target.value, 150))}
                    placeholder="Describe your experience here..."
                    className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">!</span>
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
          Powered by <span className="text-brand-600">RevQR AI</span>
        </p>
      </div>
    </main>
  );
}
