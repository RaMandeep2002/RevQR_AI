"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Star, ArrowRight, Shield, Zap, Sparkles, Check, Loader2, X, HelpCircle, ArrowLeft } from "lucide-react";
import ReviewsWidget from "@/components/review_widget";

const plans = [
  {
    name: "Starter",
    description: "Perfect for single-location businesses looking to start collecting reviews.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "1 Business Location",
      "Up to 3 Static QR Codes",
      "Basic QR Customization (no logos)",
      "10 AI-generated replies / month",
      "50 Email review requests / month",
      "Basic 7-day Analytics overview",
      "Watermarked QR Codes & Widgets",
      "Email Support (72-hour SLA)"
    ],
    cta: "Get Started Free",
    popular: false,
    badge: "Free Forever"
  },
  {
    name: "Growth",
    description: "The sweet spot for active businesses needing review automation and dynamic tools.",
    priceMonthly: 2999,
    priceYearly: 29990,
    features: [
      "Up to 3 Business Locations",
      "Unlimited Static QR Codes",
      "Up to 20 Dynamic QR Codes",
      "Advanced QR Customization (logos & templates)",
      "100 AI-generated replies / month",
      "500 Email & 100 SMS requests / month",
      "90-day Detailed Analytics & Conversions",
      "White-labeled (no QReview branding)",
      "CRM & Google Business Integrations",
      "Priority Support (24-hour SLA)"
    ],
    cta: "Start Pro Trial",
    popular: true,
    badge: "Most Popular"
  },
  {
    name: "Premium",
    description: "Designed for multi-location franchises, agencies, and enterprise clients.",
    priceMonthly: 7999,
    priceYearly: 79990,
    features: [
      "Unlimited Business Locations",
      "Unlimited Dynamic & Static QR Codes",
      "Full White-label Scan Landing Pages",
      "Unlimited AI-generated replies",
      "Unlimited Email & 1,000 SMS / month",
      "Custom Report Builder & CSV exports",
      "REST API access & Webhooks / Zapier",
      "Role-based Team Management (10 users)",
      "Dedicated Account Manager",
      "24/7 Live Chat Support"
    ],
    cta: "Contact Sales",
    popular: false,
    badge: "Enterprise"
  }
];

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "loading" | "success">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", card: "", expiry: "", cvc: "" });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("loading");
    setTimeout(() => {
      setCheckoutStep("success");
      setTimeout(() => {
        // Redirect to dashboard or close
        window.location.href = "/dashboard";
      }, 2000);
    }, 1800);
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setCheckoutStep("idle");
    setFormData({ name: "", email: "", card: "", expiry: "", cvc: "" });
    
    // For free starter tier, we can trigger instant activation experience
    if (plan.priceMonthly === 0) {
      setCheckoutStep("loading");
      setTimeout(() => {
        setCheckoutStep("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }, 1200);
    }
  };

  return (
    <div className="magicpattern relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden font-sans">
      {/* Background Silvery Metallic Gradients & Glows */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[20%] right-[-5%] -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-teal-500/10 via-emerald-900/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-2xl px-6 py-4 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-100 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-emerald-400 shadow-lg group-hover:shadow-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 group-hover:to-zinc-400 transition-colors">QReview</span>
          </div>
          <div className="hidden items-center gap-10 md:flex">
            <a href="#features" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full">How it Works</a>
            <Link href="/auth" className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-950 shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden group">
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-40 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-8 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer group">
            <Sparkles className="h-4 w-4 text-emerald-400 group-hover:animate-pulse" />
            <span>AI-Powered Review Management for 2026</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-7xl lg:text-8xl drop-shadow-2xl">
            The Smartest Way to <br className="hidden sm:block" /> Collect & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 filter drop-shadow-lg">Manage Reviews.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Boost your reputation with QReview. Use AI-powered QR code feedback systems to collect reviews, automate smart replies, and analyze customer sentiment in real-time.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/auth" className="group relative w-full sm:w-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 p-[1px] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0">
              <div className="flex h-full w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-950 transition-all duration-300 group-hover:bg-transparent group-hover:text-white">
                Start Free Trial <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-lg font-bold text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group">
              View Demo Dashboard <span aria-hidden="true" className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          {/* How it Works / Interactive Feature Grid */}
          <div id="how-it-works" className="mt-24 rounded-[2.5rem] border border-white/10 bg-zinc-950/40 p-2 shadow-2xl backdrop-blur-xl lg:mt-32 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="rounded-[2rem] border border-white/5 bg-zinc-950/80 p-8 sm:p-12 shadow-inner relative z-10">
              <h2 className="text-center text-3xl font-extrabold text-white mb-12 tracking-tight">How our Platform Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { icon: Zap, title: "QR Code System", desc: "Create dynamic QR codes for any location instantly to start collecting contactless feedback." },
                  { icon: Shield, title: "Review Automation", desc: "Automate your feedback loop and boost your Google Maps ranking with verified reviews." },
                  { icon: Star, title: "AI Reputation", desc: "Our Gemini AI helps users craft detailed reviews while you manage everything from a smart dashboard." }
                ].map((feature, i) => (
                  <div key={i} className="group/card relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500 origin-left" />
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover/card:scale-110 group-hover/card:rotate-3 group-hover/card:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-500">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-sm font-bold leading-7 text-emerald-400 uppercase tracking-[0.2em]">AI-Driven Insights</h2>
              <p className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Everything you need to grow.</p>
            </div>
            <div className="mx-auto mt-20 max-w-2xl lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { title: "Instant Sentiment Analysis", desc: "Understand customer satisfaction levels instantly with AI-powered sentiment tracking and deep analytics." },
                  { title: "Automated Smart Replies", desc: "Use AI to automate business review replies, saving time while maintaining a personal touch with every customer." },
                  { title: "Contactless Feedback", desc: "Safe, fast, and modern feedback collection via beautifully customized QR codes tailored for your brand." }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col group relative pl-6 bg-black p-4">
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-white/10 group-hover:bg-emerald-500 transition-colors duration-300" />
                    <dt className="text-xl font-bold text-white relative z-10">{feature.title}</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-zinc-400 font-medium">
                      <p className="flex-auto">{feature.desc}</p>
                      <p className="mt-6">
                        <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                          Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="review" className="py-24 sm:py-32">
          <ReviewsWidget />
        </section>

        {/* CTA Section */}
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-zinc-900/50 to-zinc-950 border border-white/5 py-24 sm:py-32 rounded-[3rem] mx-4 sm:mx-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Boost your reviews today.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400 font-medium">
                Join hundreds of businesses using QReview to streamline their customer feedback loop and skyrocket their ratings.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-950 shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                  Get Started for Free
                </Link>
                <a href="#" className="w-full sm:w-auto rounded-full border border-white/10 px-8 py-4 text-lg font-bold text-white hover:bg-white/5 transition-all duration-300">
                  Contact Sales <span aria-hidden="true" className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 blur-[120px] opacity-40 pointer-events-none" aria-hidden="true">
            <div className="aspect-[1155/678] w-[50rem] bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full" />
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 border-t border-white/5 py-12 px-6 mt-12 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-zinc-300 opacity-90 hover:opacity-100 transition-opacity">
            <QrCode className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-extrabold tracking-tight">QReview</span>
          </div>
          <p className="text-sm font-medium text-zinc-500">© 2026 QReview System. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-semibold text-zinc-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Simulated Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl p-4 transition-all duration-300">
          <div 
            className="relative w-full max-w-md rounded-[2rem] bg-zinc-900 border border-white/10 p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-16 -right-16 -z-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em]">Secure Checkout</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Subscribe to {selectedPlan.name}</h3>
              </div>
              {checkoutStep !== "loading" && (
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-full p-2 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                  aria-label="Close checkout"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4">
              {checkoutStep === "loading" && (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-md bg-emerald-500/30 animate-pulse" />
                    <Loader2 className="h-12 w-12 text-emerald-400 animate-spin relative z-10" />
                  </div>
                  <p className="text-white font-bold text-xl mb-2">Processing Payment...</p>
                  <p className="text-zinc-400 text-sm font-medium">Verifying with secure sandbox environment</p>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-lg bg-emerald-500/40 animate-pulse" />
                    <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center relative z-10">
                      <Check className="h-10 w-10 text-emerald-400 animate-bounce" />
                    </div>
                  </div>
                  <p className="text-white font-extrabold text-3xl mb-3 tracking-tight">Success!</p>
                  <p className="text-zinc-400 text-sm font-medium px-4 leading-relaxed">
                    Your <strong className="text-white">{selectedPlan.name}</strong> plan is now active. Preparing your dashboard...
                  </p>
                </div>
              )}

              {checkoutStep === "idle" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  {/* Plan Summary */}
                  <div className="rounded-2xl bg-zinc-950 p-5 border border-white/5 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-white font-bold text-lg">{selectedPlan.name} <span className="text-zinc-400 text-sm font-medium">({isYearly ? "Annual" : "Monthly"})</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                      <p className="text-emerald-400 font-extrabold text-2xl">
                        ₹{(isYearly ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Form Fields */}
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Name on Card</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Email</label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        pattern="[0-9\s]{13,19}"
                        value={formData.card}
                        onChange={(e) => setFormData({ ...formData, card: e.target.value })}
                        className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={formData.cvc}
                          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-4 font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-8"
                  >
                    <span>Activate Subscription</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <p className="text-[11px] text-zinc-500 text-center font-medium mt-4 flex items-center justify-center gap-1.5">
                    <Shield className="h-3 w-3" /> Secure sandbox transaction. No real card billed.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

