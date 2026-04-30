"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Building2,
  // ChevronLeft,
  // ChevronRight,
  Download,
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
import { generateProfessionalQrImage } from "@/lib/utils";
import { Business, Review } from "@/types";

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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setBusinesses(businessJson.data || []);
    setReviews(reviewJson.data || []);
    setStats(statJson.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const generate = async () => {
      if (!selectedBusiness) return setQrDataUrl("");
      const business = businesses.find((b) => b.id === selectedBusiness);
      if (!business) return;
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const reviewUrl = `${base}/review/${selectedBusiness}`;
      const rawQrDataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 400,
        margin: 1,
      });
      const posterDataUrl = await generateProfessionalQrImage(
        rawQrDataUrl,
        business.name,
        business.category,
      );
      setQrDataUrl(posterDataUrl);
    };
    generate();
  }, [selectedBusiness, businesses]);

  const filteredReviews = useMemo(() => {
    if (!selectedBusiness) return reviews;
    return reviews.filter((r) => r.business_id === selectedBusiness);
  }, [reviews, selectedBusiness]);

  const selectedStat = stats.find((s) => s.business_id === selectedBusiness);
  const selectedBusinessInfo = businesses.find((b) => b.id === selectedBusiness);
  // const selectedBusinessIndex = businesses.findIndex((b) => b.id === selectedBusiness);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok)
      return setError(json.error || "Failed to register business");
    setSelectedBusiness(json.data.id);
    setForm({
      name: "",
      email: "",
      category: "",
      googleBusinessUrl: "",
      location: "",
    });
    setShowSuccessModal(true);
    await fetchData();
  };

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

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Welcome back, manager. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button
          className="border border-slate-200 text-slate-900 shadow-sm"
          onClick={fetchData}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total Businesses",
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
            className="flex items-center gap-5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-current/20`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {stat.label}
              </p>
              <p className="mt-0.5 text-2xl font-black text-slate-900">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card className="relative overflow-hidden p-8">
            <div className="absolute right-0 top-0 -z-0 p-8 text-brand-100 opacity-10">
              <QrCode size={200} />
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">
                  QR Marketing Toolkit
                </h2>
                <div className="flex items-center gap-2">
                  {/* <button
                    onClick={goToPreviousBusiness}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Previous business"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button> */}
                  <select
                    className="rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500/20"
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                  >
                    <option value="">Select Business</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {/* <button
                    onClick={goToNextBusiness}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Next business"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button> */}
                </div>
              </div>
              {qrDataUrl ? (
                <div className="flex flex-col items-center gap-8 md:flex-row">
                  <div className="group relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-slate-200">
                    <img
                      src={qrDataUrl}
                      alt="QR Poster"
                      className="h-auto w-48"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <a
                        href={qrDataUrl || "#"}
                        download={`qr-${selectedBusiness || "business"}.png`}
                        className="rounded-full bg-white p-3 text-slate-900 shadow-xl transition-transform hover:scale-110"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                  <div className="w-full space-y-4 md:max-w-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Selected Business
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-900">
                        {selectedBusinessInfo?.name || "Business"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {selectedBusinessInfo?.location || "No location"}
                      </p>
                    </div>
                    <a
                      href={qrDataUrl || "#"}
                      download={`qr-${selectedBusiness || "business"}.png`}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Poster
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
                  <QrCode className="h-8 w-8" />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    Select a business to generate QR
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">
                Recent Feedback
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {filteredReviews.length} reviews
              </span>
            </div>
            <div className="grid gap-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.slice(0, 5).map((review) => (
                  <Card
                    key={review.id}
                    className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-black uppercase text-brand-700">
                          {(review.customer_name || "A").charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">
                            {review.customer_name || "Anonymous Customer"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {review.customer_email || "No email"}
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {review.businesses?.name || "Business"}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.stars ? "fill-current" : "text-slate-200"}`}
                        />
                      ))}
                    </div>

                    <p className="mt-4 rounded-r-xl border-l-4 border-brand-100 bg-slate-50 px-4 py-3 text-sm italic leading-relaxed text-slate-700">
                      &quot;{review.review_text}&quot;

                    </p>
                  </Card>
                ))
              ) : (
                <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                    No reviews found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-md bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
            <h2 className="mb-1 text-xl text-black">New Business</h2>
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              Expand your portfolio
            </p>
            <form className="space-y-4" onSubmit={handleRegister}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-12 rounded-xl border-white/10 text-black placeholder:text-slate-500"
              />
              <Input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-12 rounded-xl border-white/10 text-black placeholder:text-slate-500"
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="h-12 rounded-xl border-white/10 text-black placeholder:text-slate-500"
              />
              <Input
                placeholder="Google Business ID URL"
                type="url"
                value={form.googleBusinessUrl}
                onChange={(e) =>
                  setForm({ ...form, googleBusinessUrl: e.target.value })
                }
                required
                className="h-12 rounded-xl border-white/10 text-black placeholder:text-slate-500"
              />
              <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className="h-12 rounded-xl border-white/10 text-black placeholder:text-slate-500"
              />
              {error && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                loading={loading}
                className="h-12 w-full rounded-xl bg-brand-500 text-sm font-black hover:bg-brand-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Business
              </Button>
            </form>
          </Card>
          <Card className="border-brand-100 bg-brand-50/30 p-6">
            <div className="mb-4 flex items-center gap-3 text-brand-700">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                AI Insight
              </h3>
            </div>
            <p className="text-sm font-medium leading-relaxed text-brand-900">
              Businesses with clear QR codes at checkout see a{" "}
              <span className="font-black">340% increase</span> in review
              volume.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="py-4 text-center">
          <p className="font-bold text-slate-900">
            Business created successfully.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Select it in the dashboard to generate your QR kit.
          </p>
        </div>
      </Modal>
    </div>
  );
}
