"use client";

import { useEffect, useMemo, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Download,
  Maximize,
  MessageSquare,
  Plus,
  QrCode,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Settings,
  Zap,
  Tag,
  X,
  ChevronDown,
  Link2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { applyLogoToQr, generateProfessionalQrImage } from "@/lib/utils";
import { Business, Review } from "@/types";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNextStep } from "nextstepjs";

type ReviewStat = {
  business_id: string;
  business_name: string;
  review_count: number;
  average_rating: number;
};

// New Business Form Data Type
type NewBusinessData = {
  name: string;
  email: string;
  category: string;
  googleBusinessUrl: string;
  location: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function DashboardOverviewPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStat[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrConfig, setQrConfig] = useState({
    dark_color: "#111827",
    light_color: "#ffffff",
    salt_value: "v1",
    logo_data_url: "",
    logo_size_percent: 22,
    logo_shape: "rounded",
    dot_style: "dots" as "square" | "rounded" | "dots" | "classy",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

  // Tour State
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const { startNextStep } = useNextStep();

  // New Business Form State
  const [newBusinessData, setNewBusinessData] = useState<NewBusinessData>({
    name: "",
    email: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
  });

  const fetchData = async () => {
    const [businessRes, reviewRes, statRes] = await Promise.all([
      fetch("/api/businesses"),
      fetch("/api/reviews"),
      fetch("/api/reviews/stats"),
    ]);

    const [businessJson, reviewJson, statJson] = await Promise.all([
      businessRes.json(),
      reviewRes.json(),
      statRes.json(),
    ]);

    const nextBusinesses = businessJson.data || [];
    setBusinesses(nextBusinesses);
    setReviews(reviewJson.data || []);
    setStats(statJson.data || []);

    const params = new URLSearchParams(window.location.search);
    const requestedBusinessId = params.get("businessId");
    if (!selectedBusiness && nextBusinesses.length) {
      const requestedBusiness = nextBusinesses.find(
        (business: Business) => business.id === requestedBusinessId,
      );
      setSelectedBusiness(requestedBusiness?.id || nextBusinesses[0].id);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check if user has seen the tour
  useEffect(() => {
    const tourSeen = localStorage.getItem("dashboardTour");
    console.log("tourSeen", tourSeen);

    if (!tourSeen) {
      // First time user - mark tour as seen and start it
      localStorage.setItem("dashboardTour", "true");
      setHasSeenTour(false);

      // Start tour after data loads with a delay
      const timer = setTimeout(() => {
        startNextStep("dashboardTour");
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Returning user - tour already seen
      setHasSeenTour(true);
    }
  }, [businesses, startNextStep]);

  useEffect(() => {
    const fetchCustomization = async () => {
      if (!selectedBusiness) return;
      const response = await fetch(
        `/api/qr-customizations?businessId=${selectedBusiness}`,
      );
      const json = await response.json();
      if (!response.ok) return;
      setQrConfig({
        dark_color: json.data.dark_color || "#111827",
        light_color: json.data.light_color || "#ffffff",
        salt_value: json.data.salt_value || "v1",
        logo_data_url: json.data.logo_data_url || "",
        logo_size_percent: Number(json.data.logo_size_percent || 22),
        logo_shape: json.data.logo_shape || "rounded",
        dot_style: json.data.dot_style || "dots",
      });
    };
    fetchCustomization();
  }, [selectedBusiness]);

  useEffect(() => {
    const generateStyledQR = async () => {
      if (!selectedBusiness) {
        setQrDataUrl("");
        return;
      }

      setIsGenerating(true);

      try {
        const business = businesses.find((b) => b.id === selectedBusiness);
        if (!business) return;

        const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const reviewUrl = `${base}/review/${selectedBusiness}?salt=${encodeURIComponent(qrConfig.salt_value || "v1")}`;

        // Create styled QR code
        const qrCode = new QRCodeStyling({
          width: 400,
          height: 400,
          data: reviewUrl,
          margin: 10,
          dotsOptions: {
            color: qrConfig.dark_color || "#111827",
            type: qrConfig.dot_style || "dots",
          },
          backgroundOptions: {
            color: qrConfig.light_color || "#ffffff",
          },
          cornersSquareOptions: {
            type: qrConfig.dot_style === "dots" ? "dot" : "extra-rounded",
          },
          cornersDotOptions: {
            type: qrConfig.dot_style === "dots" ? "dot" : "square",
          },
          image: qrConfig.logo_data_url || undefined,
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: qrConfig.logo_size_percent / 100,
            margin: 5,
            crossOrigin: "anonymous",
          },
        });

        console.log("qrcode ----> ", qrCode);

        // Get QR code as data URL
        const blob = await qrCode.getRawData("png");
        if (!blob) throw new Error("Failed to generate QR");

        const rawQrDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;

          let blobData: Blob;
          if (blob instanceof Blob) {
            blobData = blob;
          } else if (blob instanceof ArrayBuffer) {
            blobData = new Blob([new Uint8Array([...new Uint8Array(blob)])], {
              type: "image/png",
            });
          } else if (ArrayBuffer.isView(blob)) {
            const array = Array.from(
              new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength),
            );
            blobData = new Blob([new Uint8Array(array)], { type: "image/png" });
          } else {
            blobData = new Blob([blob as any], { type: "image/png" });
          }

          reader.readAsDataURL(blobData);
        });

        // Apply logo and generate professional poster
        const qrWithLogo = await applyLogoToQr({
          qrDataUrl: rawQrDataUrl,
          logoDataUrl: qrConfig.logo_data_url || "",
          logoSizePercent: Number(qrConfig.logo_size_percent || 22),
          logoShape:
            (qrConfig.logo_shape as "square" | "rounded" | "circle") ||
            "rounded",
        });

        const posterDataUrl = await generateProfessionalQrImage(
          qrWithLogo,
          business.name,
          business.category,
        );

        setQrDataUrl(posterDataUrl);
      } catch (error) {
        console.error("Error generating QR:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateStyledQR();
  }, [selectedBusiness, businesses, qrConfig]);

  // Handle New Business Submission
  const handleNewBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBusinessData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      setShowNewBusinessModal(false);
      setNewBusinessData({
        name: "",
        email: "",
        category: "",
        googleBusinessUrl: "",
        location: "",
      });
      setShowSuccessModal(true);
      await fetchData();
      if (data.data?.id) {
        setSelectedBusiness(data.data.id);
      }
    } catch (error) {
      console.error("Error creating business:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create business",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (!selectedBusiness) return reviews;
    return reviews.filter((r) => r.business_id === selectedBusiness);
  }, [reviews, selectedBusiness]);

  const selectedStat = stats.find((s) => s.business_id === selectedBusiness);
  const selectedBusinessInfo = businesses.find(
    (b) => b.id === selectedBusiness,
  );

  const reviewGrowth = filteredReviews.length > 0 ? "+12%" : "0%";
  const isPositiveGrowth = true;

  const ratingDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0];
    filteredReviews.forEach((review) => {
      if (review.stars >= 1 && review.stars <= 5) {
        distribution[review.stars - 1]++;
      }
    });
    return distribution;
  }, [filteredReviews]);

  const totalReviews = filteredReviews.length;
  const averageRating = selectedStat?.average_rating || 0;

  return (
   <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="mx-auto w-full space-y-8 px-4 py-4 sm:px-6 lg:px-8"
    >
      {/* Header Section with Business Selector */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative"
      >
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg shadow-indigo-500/20"
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </motion.div>
            <div id="tour-welcome">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Header Actions */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center gap-3"
        >
          {businesses.length > 0 && (
            <div id="business-selector" className="relative min-w-[200px]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200/50 bg-white/70 px-4 py-2.5 text-left backdrop-blur-sm transition-all duration-200 hover:bg-white/90 dark:border-slate-700/50 dark:bg-slate-800/70 dark:hover:bg-slate-800/90"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {selectedBusinessInfo?.name || "Select business"}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isBusinessDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isBusinessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-50 min-w-[240px] max-h-60 overflow-y-auto rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/50 dark:bg-slate-900/95 dark:border-slate-700/50 py-1"
                  >
                    {businesses.map((business) => (
                      <motion.button
                        key={business.id}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                        onClick={() => {
                          setSelectedBusiness(business.id);
                          setIsBusinessDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          selectedBusiness === business.id
                            ? "bg-indigo-50 dark:bg-indigo-950/30"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <motion.div
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              selectedBusiness === business.id
                                ? "bg-emerald-400"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                            animate={{
                              scale: selectedBusiness === business.id ? [1, 1.5, 1] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {business.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {business.category}
                            </p>
                          </div>
                        </div>
                        {selectedBusiness === business.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              onClick={fetchData}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => setShowNewBusinessModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Business
            </Button>
          </motion.div>

          {hasSeenTour && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                onClick={() => {
                  startNextStep("dashboardTour");
                }}
              >
                <HelpCircle className="mr-1 h-4 w-4" />
                Tour
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        id="stats-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: "Total Businesses",
            value: businesses.length,
            icon: Building2,
            change: "+2",
            isPositive: true,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/30",
            iconColor: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Total Reviews",
            value: reviews.length,
            icon: MessageSquare,
            change: reviewGrowth,
            isPositive: isPositiveGrowth,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/30",
            iconColor: "text-purple-600 dark:text-purple-400",
          },
          {
            label: "Average Rating",
            value: averageRating ? averageRating.toFixed(1) : "0.0",
            icon: Star,
            change: "+0.3",
            isPositive: true,
            color: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-50 dark:bg-amber-950/30",
            iconColor: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Active Reviews",
            value: filteredReviews.length,
            icon: Users,
            change: "Today",
            isPositive: true,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
            iconColor: "text-emerald-600 dark:text-emerald-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="group relative overflow-hidden border-0 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
              <motion.div
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-5 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${stat.color})` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.05, 0.08, 0.05],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {stat.label}
                  </p>
                  <motion.p
                    key={stat.value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    {stat.value}
                  </motion.p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {stat.change && (
                      <>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-xs font-medium ${stat.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {stat.isPositive ? (
                            <ArrowUpRight className="inline h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="inline h-3 w-3" />
                          )}
                          {stat.change}
                        </motion.span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          vs last month
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`rounded-2xl ${stat.bgColor} p-3`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Rating Distribution & Quick Actions Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div id="rating-distribution" variants={fadeInUp}>
          {isGenerating ? (
            <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Rating Distribution
              </h3>
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex w-12 items-center gap-1">
                      <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        {star}
                      </span>
                      <Star className="h-3 w-3 fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 60 + 20}%` }}
                        transition={{ duration: 1, delay: star * 0.1 }}
                      />
                    </div>
                    <div className="w-12 h-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Loading rating data...
                  </span>
                </div>
              </div>
            </Card>
          ) : filteredReviews.length > 0 ? (
            <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rating Distribution
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {ratingDistribution.map((count, index) => {
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  const stars = index + 1;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex w-12 items-center gap-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {stars}
                        </span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          whileHover={{ scaleX: 1.1 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
                        {count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              {totalReviews > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Average rating
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {averageRating ? averageRating.toFixed(1) : "0.0"} ⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      Positive reviews (4-5 stars)
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {Math.round(
                        ((ratingDistribution[3] + ratingDistribution[4]) /
                          totalReviews) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </motion.div>
              )}
            </Card>
          ) : (
            <Card className="border-0 bg-white/50 p-8 backdrop-blur-sm dark:bg-slate-800/50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                  <Star className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No Reviews Yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Start collecting reviews to see your rating distribution
                  </p>
                </div>
              </motion.div>
            </Card>
          )}
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="group border-0 bg-gradient-to-br from-white/80 to-slate-50/80 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:from-slate-800/80 dark:to-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quick Actions
              </h3>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="rounded-lg bg-purple-100 p-1.5 dark:bg-purple-900/30"
              >
                <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </motion.div>
            </div>

            <div className="mt-4 space-y-2">
              {[
                {
                  href: "/dashboard/reviews",
                  label: "View All Reviews",
                  icon: MessageSquare,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40",
                },
                {
                  href: "/dashboard/qr-customizer",
                  label: "Customize QR",
                  icon: QrCode,
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40",
                },
                {
                  href: "/dashboard/settings",
                  label: "Settings",
                  icon: Settings,
                  color: "text-slate-600 dark:text-slate-400",
                  bg: "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50",
                },
              ].map((action, index) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={action.href as any}
                    className={`group/action flex items-center justify-between rounded-xl ${action.bg} px-4 py-3 transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {action.label}
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-3 dark:from-indigo-950/30 dark:to-purple-950/30"
            >
              <p className="text-xs text-slate-600 dark:text-slate-400">
                💡 Tip: Customize your QR code design in the QR Customizer for
                better brand visibility.
              </p>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* QR Marketing Toolkit */}
        <motion.div id="qr-toolkit" variants={fadeInUp}>
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/40 p-6 backdrop-blur-sm dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20">
            {/* Animated background elements */}
            <motion.div
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/15 to-indigo-500/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
            />
            <motion.div
              className="absolute top-20 right-20 h-2 w-2 rounded-full bg-indigo-400/30"
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-32 left-16 h-3 w-3 rounded-full bg-purple-400/20"
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
            <motion.div
              className="absolute top-40 left-24 h-1.5 w-1.5 rounded-full bg-pink-400/25"
              animate={{
                y: [0, -8, 0],
                opacity: [0.25, 0.5, 0.25],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
            />

            <div className="relative">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg shadow-indigo-500/20"
                    >
                      <QrCode className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        QR Marketing Toolkit
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        Generate and download QR codes for your business
                      </p>
                    </div>
                  </div>
                </div>
                {selectedBusinessInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur-sm dark:bg-slate-800/60"
                  >
                    <motion.div
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Active
                    </span>
                  </motion.div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex h-80 flex-col items-center justify-center gap-4 rounded-2xl bg-white/40 backdrop-blur-sm dark:bg-slate-800/30"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-20"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <RefreshCw className="relative h-12 w-12 animate-spin text-indigo-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        Generating your QR code...
                      </p>
                      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                        This may take a few moments
                      </p>
                    </div>
                  </motion.div>
                ) : qrDataUrl ? (
                  <motion.div
                    key="qr-ready"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-8"
                  >
                    {/* QR Code */}
                    <motion.div
                      className="group relative flex-shrink-0"
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div
                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl"
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="relative overflow-hidden rounded-2xl border-2 border-white/80 bg-white shadow-2xl shadow-indigo-500/20 transition-all duration-300 group-hover:shadow-indigo-500/40 dark:border-slate-700/50">
                        <motion.img
                          src={qrDataUrl}
                          alt="QR Poster"
                          className="h-auto w-52"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/70 via-purple-900/70 to-pink-900/70 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm"
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowQrModal(true)}
                            className="rounded-full bg-white/90 p-3.5 text-indigo-600 shadow-xl transition-all duration-300 hover:bg-white dark:bg-slate-800/90 dark:text-purple-400"
                          >
                            <Maximize className="h-5 w-5" />
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Business Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-md space-y-5"
                    >
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="rounded-xl bg-white/70 p-5 backdrop-blur-md shadow-lg shadow-slate-200/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:bg-slate-800/70 dark:shadow-none"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Selected Business
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {selectedBusinessInfo?.name || "Business"}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Building2 className="h-3 w-3" />
                                {selectedBusinessInfo?.category || "N/A"}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                • {selectedBusinessInfo?.location || "No location"}
                              </span>
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 dark:bg-emerald-900/20"
                          >
                            <motion.div
                              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                              animate={{
                                scale: [1, 1.5, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Live
                            </span>
                          </motion.div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 border-t border-slate-200/50 pt-3 dark:border-slate-700/50">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {averageRating ? averageRating.toFixed(1) : "0.0"}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {filteredReviews.length} reviews
                            </span>
                          </div>
                        </div>

                        {/* Copy Review Link */}
                        <div
                          id="copy-link"
                          className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50"
                        >
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={async () => {
                                const base =
                                  process.env.NEXT_PUBLIC_APP_URL ||
                                  window.location.origin;
                                const reviewLink = `${base}/review/${selectedBusiness}`;
                                try {
                                  await navigator.clipboard.writeText(reviewLink);
                                  const toast = document.createElement("div");
                                  toast.className =
                                    "fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-in slide-in-from-bottom-4 duration-300";
                                  toast.textContent =
                                    "✅ Review link copied to clipboard!";
                                  document.body.appendChild(toast);
                                  setTimeout(() => {
                                    toast.remove();
                                  }, 3000);
                                } catch (err) {
                                  console.error("Failed to copy:", err);
                                }
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all duration-200 hover:bg-indigo-100 hover:scale-[1.02] active:scale-95 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                            >
                              <Link2 className="h-4 w-4" />
                              Copy Review Link
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const base =
                                  process.env.NEXT_PUBLIC_APP_URL ||
                                  window.location.origin;
                                const reviewLink = `${base}/review/${selectedBusiness}`;
                                window.open(reviewLink, "_blank");
                              }}
                              className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200 hover:scale-[1.02] active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </motion.button>
                          </div>
                          <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                            Share this link with customers to collect reviews instantly
                          </p>
                        </div>
                      </motion.div>

                      <div className="flex flex-col gap-3">
                        <motion.a
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={qrDataUrl || "#"}
                          download={`qr-${selectedBusiness || "business"}.png`}
                          className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50"
                        >
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.7 }}
                          />
                          <Download className="mr-2 h-4 w-4" />
                          Download QR Poster
                        </motion.a>
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowQrModal(true)}
                            className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white dark:hover:bg-slate-700/50"
                          >
                            <Maximize className="mr-2 h-4 w-4" />
                            Preview
                          </motion.button>
                          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              href="/dashboard/qr-customizer"
                              className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white dark:hover:bg-slate-700/50"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Customize
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="qr-empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex h-80 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-indigo-200/50 bg-white/40 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300/70 dark:border-slate-700/50 dark:bg-slate-800/30"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-10"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.15, 0.1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="relative rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-5 dark:from-indigo-900/30 dark:to-purple-900/30">
                        <QrCode className="h-10 w-10 text-indigo-500 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="text-center max-w-sm">
                      <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {businesses.length
                          ? "Ready to Generate Your QR Code"
                          : "Create Your First Business"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {businesses.length
                          ? "Select a business from the dropdown above to generate a professional QR poster"
                          : "Start onboarding to generate QR codes and collect reviews"}
                      </p>
                    </div>
                    {!businesses.length && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={"/onboarding" as any}
                          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/50"
                        >
                          <motion.span
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Plus className="h-4 w-4" />
                          </motion.span>
                          Start Onboarding
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <Card className="group border-0 bg-gradient-to-br from-white/80 to-slate-50/80 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:from-slate-800/80 dark:to-slate-900/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quick Stats
              </h3>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="rounded-lg bg-indigo-100 p-1.5 dark:bg-indigo-900/30"
              >
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
            </div>

            <div className="mt-4 space-y-4">
              {[
                {
                  label: "Total Reviews",
                  value: filteredReviews.length,
                  icon: MessageSquare,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-900/20",
                },
                {
                  label: "Average Rating",
                  value: averageRating ? averageRating.toFixed(1) : "0.0",
                  icon: Star,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-900/20",
                  suffix: "⭐",
                },
                {
                  label: "Business",
                  value: selectedBusinessInfo?.name || "N/A",
                  icon: Building2,
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-50 dark:bg-purple-900/20",
                },
                {
                  label: "Category",
                  value: selectedBusinessInfo?.category || "N/A",
                  icon: Tag,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-900/20",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`rounded-lg ${stat.bg} p-2`}
                    >
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </motion.div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </span>
                  </div>
                  <motion.span
                    key={stat.value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    {stat.value} {stat.suffix || ""}
                  </motion.span>
                </motion.div>
              ))}
            </div>

            {filteredReviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Rating Distribution
                  </span>
                  <motion.span
                    key={Math.round(
                      (filteredReviews.filter((r) => r.stars >= 4).length /
                        filteredReviews.length) *
                        100,
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-slate-500 dark:text-slate-400"
                  >
                    {Math.round(
                      (filteredReviews.filter((r) => r.stars >= 4).length /
                        filteredReviews.length) *
                        100,
                    )}
                    % positive
                  </motion.span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(filteredReviews.filter((r) => r.stars >= 4).length / filteredReviews.length) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Modals with animations */}
      <AnimatePresence>
        {showSuccessModal && (
          <Modal
            open={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Success!"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                <Check className="h-8 w-8" />
              </motion.div>
              <p className="font-bold text-slate-900 dark:text-white">
                Business created successfully.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your QR kit is ready in the dashboard.
              </p>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQrModal && (
          <Modal
            open={showQrModal}
            onClose={() => setShowQrModal(false)}
            title="QR Code Preview"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border-4 border-white shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:shadow-slate-800/50"
              >
                <img src={qrDataUrl} alt="QR Poster" className="h-auto w-64" />
              </motion.div>
              <p className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                {selectedBusinessInfo?.name || "Business"}
              </p>
              <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">
                Preview of your generated QR Poster with {qrConfig.dot_style} dots.
              </p>
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={qrDataUrl || "#"}
                download={`qr-${selectedBusiness || "business"}.png`}
                className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40"
                onClick={() => setShowQrModal(false)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Now
              </motion.a>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* New Business Modal */}
      <AnimatePresence>
        {showNewBusinessModal && (
          <Modal
            open={showNewBusinessModal}
            onClose={() => {
              setShowNewBusinessModal(false);
              setNewBusinessData({
                name: "",
                email: "",
                category: "",
                googleBusinessUrl: "",
                location: "",
              });
            }}
            title="Create New Business"
          >
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleNewBusinessSubmit}
              className="space-y-4 py-4"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter business name"
                  value={newBusinessData.name}
                  onChange={(e) =>
                    setNewBusinessData({ ...newBusinessData, name: e.target.value })
                  }
                  required
                  className="w-full"
                  disabled={isSubmitting}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Restaurant, Retail, Healthcare"
                  value={newBusinessData.category}
                  onChange={(e) =>
                    setNewBusinessData({
                      ...newBusinessData,
                      category: e.target.value,
                    })
                  }
                  required
                  className="w-full"
                  disabled={isSubmitting}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <Input
                  type="text"
                  placeholder="Enter Email"
                  value={newBusinessData.email}
                  onChange={(e) =>
                    setNewBusinessData({
                      ...newBusinessData,
                      email: e.target.value,
                    })
                  }
                  className="w-full"
                  disabled={isSubmitting}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Google Business Url
                </label>
                <Input
                  type="text"
                  placeholder="Enter business URL"
                  value={newBusinessData.googleBusinessUrl}
                  onChange={(e) =>
                    setNewBusinessData({
                      ...newBusinessData,
                      googleBusinessUrl: e.target.value,
                    })
                  }
                  className="w-full"
                  disabled={isSubmitting}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="Enter business address or city"
                  value={newBusinessData.location}
                  onChange={(e) =>
                    setNewBusinessData({
                      ...newBusinessData,
                      location: e.target.value,
                    })
                  }
                  className="w-full"
                  disabled={isSubmitting}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewBusinessModal(false);
                    setNewBusinessData({
                      name: "",
                      email: "",
                      category: "",
                      googleBusinessUrl: "",
                      location: "",
                    });
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Business
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
