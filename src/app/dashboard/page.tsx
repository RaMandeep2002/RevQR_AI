"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Building2,
  // ChevronLeft,
  // ChevronRight,
  Download,
  Maximize,
  MessageSquare,
  Plus,
  QrCode,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { applyLogoToQr, generateProfessionalQrImage } from "@/lib/utils";
import { Business, Review } from "@/types";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewStat = {
  business_id: string;
  business_name: string;
  review_count: number;
  average_rating: number;
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
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  // const [aiInsight, setAiInsight] = useState("");
  // const [insightLoading, setInsightLoading] = useState(false);

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
      });
    };
    fetchCustomization();
  }, [selectedBusiness]);

  useEffect(() => {
    const generate = async () => {
      if (!selectedBusiness) return setQrDataUrl("");
      const business = businesses.find((b) => b.id === selectedBusiness);
      if (!business) return;
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const reviewUrl = `${base}/review/${selectedBusiness}?salt=${encodeURIComponent(qrConfig.salt_value || "v1")}`;
      const rawQrDataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 400,
        margin: 1,
        color: {
          dark: qrConfig.dark_color || "#111827",
          light: qrConfig.light_color || "#ffffff",
        },
      });
      const qrWithLogo = await applyLogoToQr({
        qrDataUrl: rawQrDataUrl,
        logoDataUrl: qrConfig.logo_data_url || "",
        logoSizePercent: Number(qrConfig.logo_size_percent || 22),
        logoShape:
          (qrConfig.logo_shape as "square" | "rounded" | "circle") || "rounded",
      });
      const posterDataUrl = await generateProfessionalQrImage(
        qrWithLogo,
        business.name,
        business.category,
      );
      setQrDataUrl(posterDataUrl);
    };
    generate();
  }, [selectedBusiness, businesses, qrConfig]);

//  const lastBusinessRef = useRef<string | null>(null);

// useEffect(() => {
//   const fetchInsight = async () => {
//     if (!selectedBusiness) {
//       setAiInsight("");
//       return;
//     }

//     // Prevent duplicate call
//     if (lastBusinessRef.current === selectedBusiness) return;

//     lastBusinessRef.current = selectedBusiness;

//     const business = businesses.find((b) => b.id === selectedBusiness);
//     if (!business) return;

//     setInsightLoading(true);

//     try {
//       const response = await fetch("/api/ai/genrating-insight", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           businessName: business.name,
//           category: business.category,
//         }),
//       });

//       const data = await response.json();

//       setAiInsight(
//         data.rawText?.length > 0
//           ? data.rawText.insight
//           : "No insight available for this business."
//       );
//     } catch (err) {
//       console.error("Error fetching AI insight", err);
//       setAiInsight("Unable to generate insight at this time.");
//     } finally {
//       setInsightLoading(false);
//     }
//   };

//   fetchInsight();
// }, [selectedBusiness, businesses]);

  const filteredReviews = useMemo(() => {
    if (!selectedBusiness) return reviews;
    return reviews.filter((r) => r.business_id === selectedBusiness);
  }, [reviews, selectedBusiness]);

  const selectedStat = stats.find((s) => s.business_id === selectedBusiness);
  const selectedBusinessInfo = businesses.find(
    (b) => b.id === selectedBusiness,
  );

  // const selectedBusinessIndex = businesses.findIndex((b) => b.id === selectedBusiness);

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");
  //   const response = await fetch("/api/businesses", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(form),
  //   });
  //   const json = await response.json();
  //   setLoading(false);
  //   if (!response.ok)
  //     return setError(json.error || "Failed to register business");
  //   setSelectedBusiness(json.data.id);
  //   setForm({
  //     name: "",
  //     email: "",
  //     category: "",
  //     googleBusinessUrl: "",
  //     location: "",
  //   });
  //   setShowSuccessModal(true);
  //   await fetchData();
  // };

  // const goToPreviousBusiness = () => {
  //   if (!businesses.length) return;
  //   if (selectedBusinessIndex <= 0) {
  //     setSelectedBusiness(businesses[businesses.length - 1].id);
  //     return;
  //   }
  //   setSelectedBusiness(businesses[selectedBusinessIndex - 1].id);
  // };

  // const goToNextBusiness = () => {
  //   if (!businesses.length) return;
  //   if (selectedBusinessIndex === -1 || selectedBusinessIndex >= businesses.length - 1) {
  //     setSelectedBusiness(businesses[0].id);
  //     return;
  //   }
  //   setSelectedBusiness(businesses[selectedBusinessIndex + 1].id);
  // };

  // const genrateInsights = async () =>{
  //   setError("");
  //   setSuccess("");
  //   setLoading(true);

  //   const response = await fetch("/api/ai/genrating-insight", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       businessName,
  //       category: businessCategory,
  //       businessId
  //     }),
  //   });
  // }

  return (
    <div className="mx-auto w-full  space-y-8 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1 font-medium text-slate-500 dark:text-slate-300">
            Welcome back, manager. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button
          className="border border-slate-200 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-[#CB3CFF] dark:text-white dark:hover:bg-[#CB3CFF]/80"
          onClick={fetchData}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total Business",
            value: businesses.length,
            icon: Building2,
            color: "bg-blue-500",
          },
          {
            label: "Total Reviews",
            value: reviews.length,
            icon: MessageSquare,
            color: "bg-purple-500",
          },
          {
            label: "Average Rating",
            value: selectedStat?.average_rating?.toFixed(1) ?? "0.0",
            icon: Star,
            color: "bg-amber-500",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="flex items-center gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-[#0B1739] border border-[#343B4F]/80"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-current/20`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#AEB9E1]">
                {stat.label}
              </p>
              <p className="mt-0.5 text-2xl font-black text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-3">
          <Card className="relative overflow-hidden p-8 dark:bg-[#0B1739] border-[#343B4F]/80">
            <div className="absolute right-0 top-0 -z-0 p-8 text-brand-100 opacity-10 dark:text-brand-900">
              <QrCode size={200} />
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  QR Marketing Toolkit
                </h2>
                <div className="flex items-center gap-2">
                  {/* <select
                    className="rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                  >
                    <option value="">Select Business</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select> */}

                  <Select
                    value={selectedBusiness}
                    onValueChange={setSelectedBusiness}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <SelectValue placeholder="Select Business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {qrDataUrl ? (
                <div className="flex flex-col items-center gap-8 md:flex-row">
                  <div className="group relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-slate-200 dark:border-slate-700 dark:shadow-slate-800">
                    <img
                      src={qrDataUrl}
                      alt="QR Poster"
                      className="h-auto w-48"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="rounded-full bg-white p-3 text-slate-900 shadow-xl transition-transform hover:scale-110 dark:bg-slate-800 dark:text-white"
                      >
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full space-y-4 md:max-w-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-200">
                        Selected Business
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                        {selectedBusinessInfo?.name || "Business"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {selectedBusinessInfo?.location || "No location"}
                      </p>
                    </div>
                    <a
                      href={qrDataUrl || "#"}
                      download={`qr-${selectedBusiness || "business"}.png`}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 dark:bg-[#CB3CFF] px-4 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 dark:hover:bg-[#CB3CFF]/80"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Poster
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  <QrCode className="h-8 w-8" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {businesses.length
                      ? "Select a business to generate QR"
                      : "Create your first business setup"}
                  </p>
                  {!businesses.length && (
                    <Link
                      href="/onboarding"
                      className="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      Start onboarding
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Recent Feedback
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {filteredReviews.length} reviews
              </span>
            </div>
            <div className="grid gap-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.slice(0, 5).map((review) => (
                  <Card
                    key={review.id}
                    className="rounded-2xl  bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-[#0B1739] border border-[#343B4F]/80"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-black uppercase text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {(review.customer_name || "A").charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">
                            {review.customer_name || "Anonymous Customer"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {review.customer_email || "No email"}
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {review.businesses?.name || "Business"}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.stars ? "fill-current" : "text-slate-200 dark:text-slate-700"}`}
                        />
                      ))}
                    </div>

                    <p className="mt-4 rounded-r-xl border-l-4 border-brand-100 bg-slate-50 px-4 py-3 text-sm italic leading-relaxed text-slate-700 dark:border-brand-800 dark:bg-slate-800/30 dark:text-slate-300">
                      &quot;{review.review_text}&quot;
                    </p>
                  </Card>
                ))
              ) : (
                <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    No reviews found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <div className="space-y-8">
          <Card className="bg-brand-50/30 dark:dark:bg-[#0B1739] border-[#343B4F]/80 p-6 dark:border-brand-800 dark:bg-brand-900/20">
            <div className="mb-4 flex items-center gap-3 text-brand-700 dark:text-gray-300">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                AI Insight
              </h3>
            </div>
            <div className="text-sm font-medium leading-relaxed text-brand-900 dark:text-brand-100 min-h-[40px]">
              {insightLoading ? (
                <div className="flex items-center gap-2 text-brand-500/70">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating personalized insight...
                </div>
              ) : aiInsight ? (
                <p>{aiInsight}</p>
              ) : (
                <p>Select a business to generate AI insights.</p>
              )}
            </div>
          </Card>
        </div> */}
      </div>

      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="py-4 text-center">
          <p className="font-bold text-slate-900 dark:text-white">
            Business created successfully.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your QR kit is ready in the dashboard.
          </p>
        </div>
      </Modal>

      <Modal
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="QR Code Preview"
      >
        <div className="flex flex-col items-center py-4 text-center">
          <img
            src={qrDataUrl}
            alt="QR Poster"
            className="h-auto w-64 rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
          />
          <p className="mt-6 text-lg font-black text-slate-900 dark:text-white">
            {selectedBusinessInfo?.name || "Business"}
          </p>
          <p className="mb-6 mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Preview of your generated QR Poster.
          </p>
          <a
            href={qrDataUrl || "#"}
            download={`qr-${selectedBusiness || "business"}.png`}
            className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            onClick={() => setShowQrModal(false)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Now
          </a>
        </div>
      </Modal>
    </div>
  );
}
