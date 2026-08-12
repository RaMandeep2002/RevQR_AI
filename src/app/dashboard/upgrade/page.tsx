"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
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
  Store,
  Coffee,
  HeartPulse,
  Languages,
  Scan,
  BarChart3,
  Users,
  MonitorSmartphone,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    email?: string;
    name?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface RazorpayPlan {
  id: string;
  entity: string;
  interval: number;
  period: string;
  item: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
  };
  notes: any[];
  created_at: number;
}

interface Plan {
  id: string;
  razorpayPlanId: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  buttonText: string;
  isPopular?: boolean;
  features: string[];
  suitableFor: string[];
  scanLimit: string;
  languages: string;
  alerts: string;
  standee: string;
  analytics: string;
}

// Map plan names from Razorpay to our internal plan structure
const planNameMap: Record<string, { 
  icon: any; 
  buttonText: string;
  suitableFor: string[];
  features: string[];
  isPopular?: boolean;
  badge?: string;
  badgeColor?: string;
}> = {
  "STARTER": {
    icon: Store,
    buttonText: "Start Starter Plan",
    suitableFor: ["Single Kirana Stores", "Salons & Clinics", "Local service businesses"],
    features: [
      "1 business location",
      "Up to 3 Static QR Codes",
      "PDF Printout QR Standee",
      "Basic Counter Analytics",
      "English + 1 Local Language",
      "Email Alerts for 1-3 Star Reviews",
    ],
  },
  "GROWTH": {
    icon: Coffee,
    buttonText: "Upgrade to Growth",
    suitableFor: ["Busy Cafés", "Fine Dining Restaurants", "Growing Businesses"],
    features: [
      "Up to 3 business locations",
      "Unlimited Static QR Codes",
      "Up to 20 Dynamic QR Codes",
      "1 High-Quality Acrylic Standee",
      "Multi-language Auto-Detect",
      "Monthly Insights & Sentiment Report",
      "Priority support",
    ],
    isPopular: true,
    badge: "Most Popular",
    badgeColor: "bg-indigo-600 text-white font-bold",
  },
  "ENTERPRISE": {
    icon: Building2,
    buttonText: "Upgrade to Enterprise",
    suitableFor: ["Multi-branch chains", "Hospitals", "Large organizations"],
    features: [
      "Unlimited business locations",
      "Unlimited Dynamic & Static QR Codes",
      "3 Acrylic Standees Included",
      "All Local Languages + Voice-to-Text",
      "Real-Time Staff Leaderboard",
      "REST API Access & Webhooks",
      "Role-based Team Management",
      "24/7 Live Chat Support",
    ],
  },
};

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedPlan, setSelectedPlan] = useState<string>("growth");
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [razorpayPlans, setRazorpayPlans] = useState<RazorpayPlan[]>([]);
  
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
  const growthPlanPrice = 699 * 12;
  const roiMultiplier = Math.max(1, Math.round(annualRevIncrease / growthPlanPrice));

  // Fetch Razorpay plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/razorpay-plans");
        if (!res.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await res.json();
        
        if (data.success && data.plans) {
          const items = data.plans.items || [];
          setRazorpayPlans(items);
          
          // Transform Razorpay plans to our Plan format
          const transformedPlans: Plan[] = items.map((razorplan: RazorpayPlan) => {
            const planName = razorplan.item.name;
            const planConfig = planNameMap[planName] || planNameMap["STARTER"];
            
            // Parse description to extract features
            const descLines = razorplan.item.description.split('\n');
            const scanLimit = descLines.find(line => line.includes('Review Scan Limit'))?.split(':')[1]?.trim() || "N/A";
            const languages = descLines.find(line => line.includes('Languages'))?.split(':')[1]?.trim() || "N/A";
            const alerts = descLines.find(line => line.includes('Alerts'))?.split(':')[1]?.trim() || "N/A";
            const standee = descLines.find(line => line.includes('QR Standee'))?.split(':')[1]?.trim() || "N/A";
            const analytics = descLines.find(line => line.includes('Analytics'))?.split(':')[1]?.trim() || "N/A";
            const targetSegment = descLines.find(line => line.includes('Target Segment'))?.split(':')[1]?.trim() || "";
            
            const priceInRupees = razorplan.item.amount / 100;
            
            return {
              id: razorplan.id,
              razorpayPlanId: razorplan.id,
              name: planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase(),
              price: priceInRupees,
              description: targetSegment || `${planName} Plan`,
              icon: planConfig.icon,
              buttonText: planConfig.buttonText,
              suitableFor: planConfig.suitableFor,
              features: planConfig.features,
              isPopular: planConfig.isPopular || false,
              badge: planConfig.badge,
              badgeColor: planConfig.badgeColor,
              scanLimit: scanLimit,
              languages: languages,
              alerts: alerts,
              standee: standee,
              analytics: analytics,
            };
          });
          
          // Sort plans by price
          transformedPlans.sort((a, b) => a.price - b.price);
          
          setPlans(transformedPlans);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        // Fallback to default plans if API fails
        setPlans(getDefaultPlans());
      }
    };

    fetchPlans();
  }, []);

  // Fallback default plans
  const getDefaultPlans = (): Plan[] => {
    return [
      {
        id: "starter",
        razorpayPlanId: "plan_TJHoiqvQuAqReO",
        name: "Starter",
        price: 299,
        description: "Essential feedback loops for single-location retail businesses.",
        icon: Store,
        buttonText: "Start Starter Plan",
        features: [
          "1 business location",
          "Up to 3 Static QR Codes",
          "PDF Printout QR Standee",
          "Basic Counter Analytics",
          "English + 1 Local Language",
          "Email Alerts for 1-3 Star Reviews",
        ],
        suitableFor: ["Single Kirana Stores", "Salons & Clinics", "Local service businesses"],
        scanLimit: "100 / month",
        languages: "English + 1 Local",
        alerts: "Email Only",
        standee: "PDF Printout Only",
        analytics: "Basic Counter",
      },
      {
        id: "growth",
        razorpayPlanId: "plan_TJHpIA86O2cSvI",
        name: "Growth",
        price: 699,
        description: "Advanced intelligence & tools to scale reputation rapidly.",
        badge: "Most Popular",
        badgeColor: "bg-indigo-600 text-white font-bold",
        icon: Coffee,
        buttonText: "Upgrade to Growth",
        isPopular: true,
        features: [
          "Up to 3 business locations",
          "Unlimited Static QR Codes",
          "Up to 20 Dynamic QR Codes",
          "1 High-Quality Acrylic Standee",
          "Multi-language Auto-Detect",
          "Monthly Insights & Sentiment Report",
          "Priority support",
        ],
        suitableFor: ["Busy Cafés", "Fine Dining Restaurants", "Growing Businesses"],
        scanLimit: "350 / month",
        languages: "Multi-language Auto-Detect",
        alerts: "Email Only",
        standee: "1 High-Quality Acrylic",
        analytics: "Monthly Insights & Sentiment Report",
      },
      {
        id: "enterprise",
        razorpayPlanId: "plan_TJZt7LOSrnIPTU",
        name: "Enterprise",
        price: 1499,
        description: "Full brand management suite for multi-branch organizations.",
        icon: Building2,
        buttonText: "Upgrade to Enterprise",
        features: [
          "Unlimited business locations",
          "Unlimited Dynamic & Static QR Codes",
          "3 Acrylic Standees Included",
          "All Local Languages + Voice-to-Text",
          "Real-Time Staff Leaderboard",
          "REST API Access & Webhooks",
          "Role-based Team Management",
          "24/7 Live Chat Support",
        ],
        suitableFor: ["Multi-branch chains", "Hospitals", "Large organizations"],
        scanLimit: "1,000 / month",
        languages: "All Local + Voice-to-Text",
        alerts: "Email Only",
        standee: "3 Acrylic Standees",
        analytics: "Real-Time Staff Leaderboard",
      },
    ];
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        } else if (user) {
          console.log("User data from Supabase Auth:", user);
          setUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "",
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase]);
  
  const handleRazorpayPayment = async (plan: Plan) => {
    if (!user) {
      router.push("/auth?redirect=/upgrade");
      return;
    }

    try {
      setCheckoutStep("loading");
      setErrorMessage("");

      const amount = isYearly ? plan.price * 12 : plan.price;

      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.razorpayPlanId || plan.id,
          planName: plan.name,
          customerEmail: user.email,
          userId: user.id,
          isYearly: isYearly,
          amount: amount,
          interval: isYearly ? "yearly" : "monthly",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Subscription creation failed");
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscription.id,
        name: "QReview",
        description: `${plan.name} Plan - ${isYearly ? "Annual" : "Monthly"} Subscription`,
        prefill: {
          email: user.email,
          name: user.name,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setCheckoutStep("idle");
          },
        },
        handler: function (response: RazorpayResponse) {
          console.log("Payment successful:", response);
          setCheckoutStep("success");
          
          setTimeout(() => {
            router.push("/dashboard?subscription=success");
          }, 2000);
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);
      setCheckoutStep("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan.id);
    setCheckoutStep("idle");
    setErrorMessage("");
  };

  if (isLoading || plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
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

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative h-6 w-12 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform ${
                  isYearly ? "translate-x-6 bg-indigo-600 dark:bg-indigo-500" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              Annual
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                SAVE 16%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mb-20">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = isYearly ? plan.price * 12 : plan.price;
            const pricePerMonth = isYearly ? Math.round(price / 12) : plan.price;
            
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className={`relative flex flex-col rounded-3xl p-8 cursor-pointer transition-all duration-300 border bg-white dark:bg-[#0d1631]
                  ${plan.isPopular 
                    ? "ring-2 ring-indigo-600 dark:ring-indigo-500 shadow-xl scale-[1.02] border-transparent" 
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
                    {plan.originalPrice && !isYearly && (
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 line-through mr-2">
                        ₹{plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ₹{pricePerMonth.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-slate-500 ml-1">/month</span>
                  </div>
                  {isYearly && (
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
                      Billed annually at ₹{price.toLocaleString()}
                    </div>
                  )}

                  {/* Key Specs Badges */}
                  <div className="grid grid-cols-2 gap-1.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <Scan className="h-3 w-3 text-indigo-400" />
                      <span>{plan.scanLimit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <Languages className="h-3 w-3 text-indigo-400" />
                      <span>{plan.languages}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <AlertCircle className="h-3 w-3 text-indigo-400" />
                      <span>{plan.alerts}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <MonitorSmartphone className="h-3 w-3 text-indigo-400" />
                      <span>{plan.standee}</span>
                    </div>
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
                          plan.isPopular ? "text-indigo-500" : "text-emerald-500"
                        }`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRazorpayPayment(plan);
                  }}
                  disabled={!user && !isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.isPopular 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                  }`}
                >
                  {!user ? "Sign In to Subscribe" : plan.buttonText}
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
                      {Math.ceil(growthPlanPrice / (ticketSize * 12 || 1))}
                    </strong>{" "}
                    new customer{Math.ceil(growthPlanPrice / (ticketSize * 12 || 1)) > 1 ? "s" : ""} in a full year to achieve break-even. That is a projected{" "}
                    <strong className="font-extrabold text-indigo-900 dark:text-white">{roiMultiplier}x return on investment</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1631] shadow-lg">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Comparison</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Compare features across all plans at a glance</p>
          </div>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Feature</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Starter</th>
                <th className="py-4 px-6 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Growth</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Price</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">₹299</td>
                <td className="py-4 px-6 text-sm font-bold text-indigo-600 dark:text-indigo-400">₹699</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">₹1,499</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Scan Limit</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">100 / month</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">350 / month</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">1,000 / month</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Languages</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">English + 1 Local</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Multi-language Auto-Detect</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">All Local + Voice-to-Text</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Alerts (1-3 Stars)</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Email Only</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Email Only</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Email Only</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">QR Standee</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">PDF Printout</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">1 High-Quality Acrylic</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">3 Acrylic Standees</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Analytics</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Basic Counter</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Insights & Sentiment</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Real-Time Staff Leaderboard</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Business Locations</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">1</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Up to 3</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">QR Codes</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Up to 3 Static</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">Unlimited Static + 20 Dynamic</td>
                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">Unlimited Static & Dynamic</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                What happens if I exceed my scan limit?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You'll receive a notification when you're approaching your limit. Additional scans are available as add-ons, or you can upgrade to a higher plan to accommodate your growing needs.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Can I upgrade or switch plans later?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes, you can upgrade from Starter to Growth or Enterprise at any time. The difference in pricing will be calculated on a prorated basis for the remaining days of your active month.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#0d1631]">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                What languages are supported?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Starter plan supports English + 1 local language of your choice. Growth plan includes multi-language auto-detection. Enterprise plan supports all local languages plus voice-to-text input for reviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {checkoutStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0d1631] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden">
            {checkoutStep === "loading" && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                <p className="text-slate-900 dark:text-white font-semibold text-lg">Processing your payment...</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Verifying subscription with Razorpay</p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                  <Check className="h-8 w-8 text-emerald-500 animate-bounce" />
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-xl">Payment Successful!</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 px-4">
                  Thank you! Your subscription is now active. Redirecting you to the dashboard...
                </p>
              </div>
            )}

            {checkoutStep === "error" && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-xl">Payment Failed</p>
                <p className="text-red-500 text-sm mt-2 px-4">{errorMessage}</p>
                <button
                  onClick={() => setCheckoutStep("idle")}
                  className="mt-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-800 dark:text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}