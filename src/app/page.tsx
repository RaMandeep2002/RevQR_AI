"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Star, ArrowRight, Shield, Zap, Sparkles, Check, Loader2, X, HelpCircle, ArrowLeft } from "lucide-react";

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
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100 overflow-hidden">
      
      {/* Background Silvery Metallic Gradients & Glows */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-zinc-800/10 blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">QReview</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">How it Works</a>
            {/* <a href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Pricing</a> */}
            <Link href="/auth" className="rounded-full bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-md hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-36 pb-24">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md mb-8 hover:border-zinc-700 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>AI-Powered Review Management for 2026</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-100 sm:text-7xl">
            The Smartest Way to Collect & <br />
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">Manage Reviews with AI.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Boost your reputation with QReview. Use AI-powered QR code feedback systems to collect reviews, automate smart replies, and analyze customer sentiment in real-time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="w-full sm:w-auto rounded-full bg-zinc-100 px-8 py-4 text-lg font-semibold text-zinc-950 shadow-xl hover:bg-zinc-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 px-8 py-4 text-lg font-semibold text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-center">
              View Demo Dashboard <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
          
          {/* How it Works / Interactive Feature Grid */}
          <div id="how-it-works" className="mt-20 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-2 shadow-2xl backdrop-blur-sm lg:mt-28 overflow-hidden">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-inner">
              <h2 className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-10">How our QR Review Platform Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { icon: Zap, title: "QR Code Feedback System", desc: "Create dynamic QR codes for any business location instantly and start collecting contactless feedback." },
                  { icon: Shield, title: "Google Review Automation", desc: "Automate your feedback loop and boost your Google Maps ranking with verified customer reviews." },
                  { icon: Star, title: "AI Reputation Management", desc: "Our Gemini AI helps users craft helpful, detailed reviews while you manage everything from a smart dashboard." }
                ].map((feature, i) => (
                  <div key={i} className="group p-5 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/60 transition-all duration-300">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-5 group-hover:scale-110 group-hover:border-zinc-700 transition-all">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-zinc-100">{feature.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-sm font-semibold leading-7 text-zinc-400 uppercase tracking-widest">AI-Driven Insights for Your Business</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Everything you need to grow your reputation</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { title: "Instant Sentiment Analysis", desc: "Understand customer satisfaction levels instantly with AI-powered sentiment tracking and analytics." },
                  { title: "Automated Smart Replies", desc: "Use AI to automate business review replies, saving time while maintaining a personal touch with every customer." },
                  { title: "Contactless Customer Feedback", desc: "Safe, fast, and modern feedback collection via professional QR codes tailored for SMEs." }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col border-l-2 border-zinc-700 pl-6 py-2 bg-zinc-900/10 hover:bg-zinc-900/30 transition-all rounded-r-xl border border-transparent hover:border-zinc-900">
                    <dt className="text-lg font-bold leading-7 text-zinc-100">{feature.title}</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                      <p className="flex-auto">{feature.desc}</p>
                      <p className="mt-6">
                        <a href="#" className="text-sm font-semibold leading-6 text-zinc-300 hover:text-zinc-100 transition-colors">Learn more <span aria-hidden="true" className="ml-1">→</span></a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="pricing" className="py-24 sm:py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.02] blur-[150px] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold leading-7 text-emerald-400 uppercase tracking-widest">Pricing Plans</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-5xl">Transparent Pricing for Businesses of All Sizes</p>
              <p className="mt-4 text-base text-zinc-400">Choose the perfect plan to automate your review acquisition and supercharge your brand reputation.</p> */}
              
              {/* Billing Cycle Toggle */}
              {/* <div className="mt-10 flex items-center justify-center gap-4">
                <span className={`text-sm font-semibold transition-colors ${!isYearly ? "text-zinc-100" : "text-zinc-400"}`}>Billed Monthly</span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className="relative h-6 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all border border-zinc-700 focus:outline-none"
                  aria-label="Toggle yearly billing"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-zinc-100 transition-all shadow-md ${
                      isYearly ? "translate-x-6 bg-emerald-400" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${isYearly ? "text-zinc-100" : "text-zinc-400"}`}>
                  Billed Annually
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 tracking-wider">
                    SAVE 20%
                  </span>
                </span>
              </div>
            </div> */}

            {/* Plan Grid */}
            {/* <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
              {plans.map((plan, i) => {
                const price = isYearly ? plan.priceYearly : plan.priceMonthly;
                const pricePerMonth = isYearly ? Math.round(price / 12) : price;

                return (
                  <div
                    key={i}
                    className={`relative rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-700/80 shadow-2xl scale-105 lg:scale-105 z-10 hover:border-emerald-500/50"
                        : "bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800 shadow-md hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-zinc-200 px-4 py-1 text-xs font-semibold text-zinc-950 uppercase tracking-widest shadow-md">
                          {plan.badge}
                        </div>
                      )}
                      {!plan.popular && plan.badge && (
                        <div className="inline-flex rounded-full bg-zinc-800/80 px-3 py-1 text-[10px] font-bold text-zinc-300 uppercase tracking-wider border border-zinc-700 mb-4">
                          {plan.badge}
                        </div>
                      )}
                      
                      <h3 className="text-xl font-bold text-zinc-100 mt-2">{plan.name}</h3>
                      <p className="mt-2 text-sm text-zinc-400 leading-relaxed min-h-[40px]">{plan.description}</p>
                      
                      <div className="mt-6 flex items-baseline gap-1 text-zinc-100">
                        <span className="text-4xl font-extrabold tracking-tight">₹{pricePerMonth.toLocaleString()}</span>
                        <span className="text-sm text-zinc-400 font-medium">/month</span>
                      </div>
                      {isYearly && price > 0 && (
                        <div className="text-xs font-semibold text-emerald-400 mt-1.5">
                          Billed annually at ₹{price.toLocaleString()}
                        </div>
                      )}
                      {price === 0 && (
                        <div className="text-xs font-semibold text-zinc-500 mt-1.5">
                          No credit card required
                        </div>
                      )}

                      <ul className="mt-8 space-y-3.5 text-sm text-zinc-300 border-t border-zinc-800/60 pt-6">
                        {plan.features.slice(0, 5).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-zinc-500 font-semibold pl-8 mt-1 italic">
                            + {plan.features.length - 5} more premium features
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full rounded-full py-3 px-4 text-sm font-semibold tracking-wide shadow-md transition-all ${
                          plan.popular
                            ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95"
                            : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div> */}

            {/* Compare Full Plan Details Link */}
            {/* <div className="mt-16 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 group text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <span>View full plan feature comparison</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="relative isolate overflow-hidden bg-zinc-900/30 border border-zinc-900 py-16 sm:py-24 lg:py-32 rounded-[2rem] mx-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">Boost your business reviews today.</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                Join hundreds of businesses using QReview to streamline their customer feedback loop and increase their star ratings.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth" className="rounded-full bg-zinc-100 px-8 py-4 text-lg font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 transition-all">
                  Get Started for Free
                </Link>
                <a href="#" className="text-sm font-semibold leading-6 text-zinc-300 hover:text-zinc-100 transition-colors">
                  Contact Sales <span aria-hidden="true" className="ml-1">→</span>
                </a>
              </div>
            </div>
          </div>
          {/* Decorative background glow */}
          <div className="absolute -top-24 left-1/2 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-zinc-800 to-zinc-900 opacity-25" />
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-400 opacity-80">
            <QrCode className="h-5 w-5" />
            <span className="text-lg font-bold">QReview</span>
          </div>
          <p className="text-sm text-zinc-500">© 2026 QReview System. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Simulated Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div 
            className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-850 p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-12 -right-12 -z-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Simulated Checkout</span>
                <h3 className="text-xl font-bold text-zinc-100 mt-0.5">Subscribe to {selectedPlan.name}</h3>
              </div>
              {checkoutStep !== "loading" && (
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
                  aria-label="Close checkout"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4">
              {checkoutStep === "loading" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
                  <p className="text-zinc-200 font-semibold text-lg">Processing your payment...</p>
                  <p className="text-zinc-500 text-xs mt-1">Verifying subscription with sandbox environment</p>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                    <Check className="h-8 w-8 text-emerald-400 animate-bounce" />
                  </div>
                  <p className="text-zinc-100 font-bold text-xl">Payment Successful!</p>
                  <p className="text-zinc-400 text-sm mt-2 px-4">
                    Thank you! Your **{selectedPlan.name}** plan is now active. Redirecting you to the dashboard...
                  </p>
                </div>
              )}

              {checkoutStep === "idle" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Plan Summary */}
                  <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800/60 flex justify-between items-center">
                    <div>
                      <p className="text-zinc-400 text-xs">Plan Selected</p>
                      <p className="text-zinc-200 font-bold">{selectedPlan.name} Plan ({isYearly ? "Annual" : "Monthly"})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-xs">Due Today</p>
                      <p className="text-zinc-100 font-extrabold text-lg">
                        ₹{(isYearly ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Form Fields */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        pattern="[0-9\s]{13,19}"
                        value={formData.card}
                        onChange={(e) => setFormData({ ...formData, card: e.target.value })}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={formData.cvc}
                          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 font-semibold text-sm tracking-wide shadow-lg hover:shadow-emerald-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 mt-6"
                  >
                    <span>Pay & Activate Subscription</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-[10px] text-zinc-500 text-center font-medium">
                    This is a secure sandbox transaction. No real credit card details are billed.
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

