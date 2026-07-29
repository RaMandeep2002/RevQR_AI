"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

type Plan = {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  buttonText: string;
  isPopular?: boolean;
  isFounding?: boolean;
  features: string[];
  suitableFor: string[];
};

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("growth");
  
  // ROI Calculator State
  const [businessType, setBusinessType] = useState<string>("clinic");
  const [ticketSize, setTicketSize] = useState<number>(2000);
  const [newCustomers, setNewCustomers] = useState<number>(5);

  const businessPresets: Record<string, { name: string; ticket: number; customers: number }> = {
    retail: { name: "Retail / Café", ticket: 500, customers: 12 },
    salon: { name: "Salon / Spa", ticket: 1200, customers: 8 },
    clinic: { name: "Clinic / Dentist", ticket: 3500, customers: 5 },
    gym: { name: "Gym / Hotel", ticket: 8000, customers: 3 },
  };

  const handlePresetChange = (type: string) => {
    setBusinessType(type);
    setTicketSize(businessPresets[type].ticket);
    setNewCustomers(businessPresets[type].customers);
  };

  const annualRevIncrease = newCustomers * ticketSize * 12;
  const growthPlanPrice = 14999;
  const roiMultiplier = Math.max(1, Math.round(annualRevIncrease / growthPlanPrice));

  const plans: Plan[] = [
    {
      name: "Founding Member",
      price: 4999,
      originalPrice: 14999,
      description: "Exclusive lifetime pricing for our first 20 early adopters.",
      badge: "Limited Spots Left",
      badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      icon: Crown,
      buttonText: "Claim Founding Deal",
      isFounding: true,
      features: [
        "Everything in Growth Plan",
        "Lifetime price locked at ₹4,999/year",
        "Direct Slack/WhatsApp with founders",
        "Premium support response < 2 hrs",
        "Beta access to future features",
      ],
      suitableFor: ["First 20 visionaries", "Early adopters", "SMB Founders"],
    },
    {
      name: "Starter",
      price: 7999,
      description: "Essential feedback loops for single-location retail businesses.",
      icon: Building2,
      buttonText: "Start Starter Plan",
      features: [
        "1 business location",
        "Unlimited QR scans",
        "AI-assisted review drafts",
        "Private feedback collection",
        "Basic dashboard analytics",
        "Standard email support",
      ],
      suitableFor: ["Small retail shops", "Salons & Cafés", "Local service businesses"],
    },
    {
      name: "Growth",
      price: 14999,
      description: "Advanced intelligence & tools to scale reputation rapidly.",
      badge: "Most Popular",
      badgeColor: "bg-indigo-600 text-white font-bold",
      icon: Zap,
      buttonText: "Upgrade to Growth",
      isPopular: true,
      features: [
        "Everything in Starter",
        "Advanced analytics & trends",
        "AI feedback insights & summaries",
        "Priority email & chat support",
        "Custom reports & scheduled exports",
        "Early access to new updates",
      ],
      suitableFor: ["Restaurants & Gyms", "Dental & Health Clinics", "Hotels & Multi-staff businesses"],
    },
    {
      name: "Pro",
      price: 29999,
      description: "Full brand management suite for multi-branch organizations.",
      icon: Sparkles,
      buttonText: "Upgrade to Pro",
      features: [
        "Multiple business locations (up to 5)",
        "Team access & staff accounts",
        "Advanced CSV/PDF exports",
        "Premium dedicated support",
        "API & Webhooks access (Beta)",
        "WhatsApp integration (Upcoming)",
      ],
      suitableFor: ["Multi-branch chains", "Marketing agencies", "Large organizations"],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-24">
      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" /> Pricing built for growth
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Simple, Value-Driven Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          Choose a plan that pays for itself. Capture real customer feedback, boost your Google reviews, and increase your store visits.
        </p>
      </div>

      {/* Founding Member Spotlight */}
      <div className="relative mb-16 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/50 via-orange-50/30 to-amber-50/20 p-8 dark:border-amber-500/20 dark:from-amber-950/20 dark:to-slate-900 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Crown className="h-3.5 w-3.5" /> Founding Member Initiative
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Be one of our first 20 customers
            </h3>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Get full access to all features at only <strong className="text-slate-950 dark:text-white">₹4,999/year</strong>. Lock in this lifetime rate forever—your subscription renewal will never increase, even as we add premium features.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end shrink-0 gap-2">
            <div className="text-right">
              <span className="text-xs text-slate-400 line-through">₹14,999/yr</span>
              <div className="text-3xl font-extrabold text-slate-950 dark:text-white">
                ₹4,999<span className="text-sm font-medium text-slate-500">/year</span>
              </div>
            </div>
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-950 dark:text-white font-bold px-6 py-3 transition-all shadow-md shadow-amber-500/10">
              Claim Founding Deal
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              ⚡ Only 7 spots remaining at this price!
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2 grid-cols-1 mb-20">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isSelected = selectedPlan === plan.name.toLowerCase();
          
          return (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name.toLowerCase())}
              className={`relative flex flex-col rounded-3xl p-8 cursor-pointer transition-all duration-300 border bg-white dark:bg-[#0d1631]
                ${plan.isPopular 
                  ? "ring-2 ring-indigo-600 dark:ring-indigo-500 shadow-xl scale-[1.02] border-transparent" 
                  : plan.isFounding
                  ? "border-amber-200 dark:border-amber-500/30 hover:border-amber-400"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                } ${isSelected ? "ring-2 ring-brand-500 dark:ring-brand-400" : ""}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3.5 right-6 rounded-full px-3 py-1 text-xs font-bold ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              )}

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${
                    plan.isPopular 
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                      : plan.isFounding
                      ? "bg-amber-50 dark:bg-amber-950/50 text-amber-500"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    <PlanIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 h-10">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline mb-6">
                  {plan.originalPrice && (
                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 line-through mr-2">
                      ₹{plan.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-slate-500 ml-1">/year</span>
                </div>

                {/* Suitability */}
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Ideal For
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.suitableFor.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${
                        plan.isPopular ? "text-indigo-500" : plan.isFounding ? "text-amber-500" : "text-emerald-500"
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                plan.isPopular 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                  : plan.isFounding
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/10"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
              }`}>
                {plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* ROI Calculator Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090f23] p-8 md:p-12 mb-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 mb-2">
                <TrendingUp className="h-3.5 w-3.5" /> Value Calculator
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                Estimate Your Return on Investment (ROI)
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              We focus on building customer outcomes, not selling software. If a dentist gains just 5 new clients from high Google trust, the software pays for itself multiple times over. Calculate your potential return below:
            </p>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Select Business Sector
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(businessPresets).map((presetKey) => (
                  <button
                    key={presetKey}
                    onClick={() => handlePresetChange(presetKey)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      businessType === presetKey
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {businessPresets[presetKey].name.split(" / ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Average Customer Value (Ticket Size)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">₹{ticketSize.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="100"
                  value={ticketSize}
                  onChange={(e) => setTicketSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>New Clients / Month (from better Reviews)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{newCustomers} clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={newCustomers}
                  onChange={(e) => setNewCustomers(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-white dark:bg-[#0c1228] p-8 border border-slate-100 dark:border-slate-800/80 shadow-md">
            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
              ROI projection (Annualized)
            </h4>

            <div className="space-y-6">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Annual Revenue Increase</span>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{annualRevIncrease.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Subscription Cost (Growth)</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{growthPlanPrice.toLocaleString()}/yr
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Net Profit Yield</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{(annualRevIncrease - growthPlanPrice).toLocaleString()}/yr
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-100/30">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                  🚀 Your reputation pays for itself! The Growth plan requires just{" "}
                  <strong className="font-extrabold text-indigo-900 dark:text-white">
                    {Math.ceil(growthPlanPrice / (ticketSize || 1))}
                  </strong>{" "}
                  new customer{Math.ceil(growthPlanPrice / (ticketSize || 1)) > 1 ? "s" : ""} in a full year to achieve break-even. That is a projected{" "}
                  <strong className="font-extrabold text-indigo-900 dark:text-white">{roiMultiplier}x return on investment</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Why only annual plans?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Reviews and search engine reputation compound over time. Businesses see the greatest ROI over 6–12 months of structured feedback acquisition. Annual commitments prevent monthly payment failure friction and enable us to invest more in premium developer assets and customer care for you.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              How does the Founding Member rate work?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We reward early adaptors. If you subscribe as one of the first 20 businesses, your subscription rate is permanently locked at ₹4,999/year. As long as you maintain an active yearly subscription, you will never be affected by future price changes.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Can I upgrade or switch plans later?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Yes, you can upgrade from Starter to Growth or Pro at any time. The difference in pricing will be calculated on a prorated basis for the remaining days of your active year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
