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
import { useTheme } from "next-themes";

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
  const { theme, setTheme } = useTheme();
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
      <div className={`${theme === "dark" ? "magicpattern" : ""} relative flex min-h-dvh flex-col bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white transition-colors duration-300`}>
      {/* Fixed background layers */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Grid Pattern - Light/Dark adaptive */}
        {/* <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--grid-color, #e5e7eb) 1px, transparent 1px),
              linear-gradient(to bottom, var(--grid-color, #e5e7eb) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
         */}
        {/* Glow Effect - Light/Dark adaptive */}
        <div
          className="absolute left-1/2 top-[-10rem] h-[32rem] w-[70rem] -translate-x-1/2 rounded-full blur-3xl transition-all duration-500"
          style={{
            background: "var(--brand-glow)",
            opacity: "var(--glow-opacity, 0.35)",
          }}
        />
        
        {/* Additional Light Theme Glow */}
        <div
          className="absolute right-1/4 bottom-[-10rem] h-[24rem] w-[50rem] rounded-full blur-3xl transition-all duration-500 dark:opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />
        
        {/* Additional Dark Theme Glow */}
        <div
          className="absolute left-1/4 top-1/2 h-[20rem] w-[40rem] rounded-full blur-3xl transition-all duration-500 opacity-0 dark:opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)",
          }}
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
    </div>
  );
}
