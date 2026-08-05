"use client";

import { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Check,
  Loader2,
  X,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import ReviewsWidget from "@/components/review_widget";
import NavBar from "@/components/LandingPage/NavBar";
import Footer from "@/components/LandingPage/Footer";
import Hero from "@/components/LandingPage/HeroSection";
import Features from "@/components/LandingPage/Features";

const plans = [
  {
    name: "Starter",
    description:
      "Perfect for single-location businesses looking to start collecting reviews.",
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
      "Email Support (72-hour SLA)",
    ],
    cta: "Get Started Free",
    popular: false,
    badge: "Free Forever",
  },
  {
    name: "Growth",
    description:
      "The sweet spot for active businesses needing review automation and dynamic tools.",
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
      "Priority Support (24-hour SLA)",
    ],
    cta: "Start Pro Trial",
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Premium",
    description:
      "Designed for multi-location franchises, agencies, and enterprise clients.",
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
      "24/7 Live Chat Support",
    ],
    cta: "Contact Sales",
    popular: false,
    badge: "Enterprise",
  },
];

export default function HomePage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(
    null,
  );
  const [checkoutStep, setCheckoutStep] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

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

  const handlePlanSelect = (plan: (typeof plans)[0]) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    console.log(data);

    setLoading(false);
  };

  return (
    <div className="magicpattern relative flex min-h-dvh flex-col bg-background text-foreground">
      {/* Fixed background layers */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute left-1/2 top-[-10rem] h-[32rem] w-[70rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "var(--brand-glow)", opacity: 0.35 }}
        />
      </div>

      <NavBar />
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full space-y-24 pb-24 pt-8">
          {/* Hero Section */}
          <Hero />
          {/* Features Grid */}
          <Features />
        </div>
      </main>

      <Footer />
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
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em]">
                  Secure Checkout
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                  Subscribe to {selectedPlan.name}
                </h3>
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
                  <p className="text-white font-bold text-xl mb-2">
                    Processing Payment...
                  </p>
                  <p className="text-zinc-400 text-sm font-medium">
                    Verifying with secure sandbox environment
                  </p>
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
                  <p className="text-white font-extrabold text-3xl mb-3 tracking-tight">
                    Success!
                  </p>
                  <p className="text-zinc-400 text-sm font-medium px-4 leading-relaxed">
                    Your{" "}
                    <strong className="text-white">{selectedPlan.name}</strong>{" "}
                    plan is now active. Preparing your dashboard...
                  </p>
                </div>
              )}

              {checkoutStep === "idle" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  {/* Plan Summary */}
                  <div className="rounded-2xl bg-zinc-950 p-5 border border-white/5 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Plan
                      </p>
                      <p className="text-white font-bold text-lg">
                        {selectedPlan.name}{" "}
                        <span className="text-zinc-400 text-sm font-medium">
                          ({isYearly ? "Annual" : "Monthly"})
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Total
                      </p>
                      <p className="text-emerald-400 font-extrabold text-2xl">
                        ₹
                        {(isYearly
                          ? selectedPlan.priceYearly
                          : selectedPlan.priceMonthly
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Form Fields */}
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        pattern="[0-9\s]{13,19}"
                        value={formData.card}
                        onChange={(e) =>
                          setFormData({ ...formData, card: e.target.value })
                        }
                        className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                          value={formData.expiry}
                          onChange={(e) =>
                            setFormData({ ...formData, expiry: e.target.value })
                          }
                          className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-300 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                          CVC
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={formData.cvc}
                          onChange={(e) =>
                            setFormData({ ...formData, cvc: e.target.value })
                          }
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
                    <Shield className="h-3 w-3" /> Secure sandbox transaction.
                    No real card billed.
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
