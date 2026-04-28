"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, LogOut, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Business, Review } from "@/types";
import { Button, Card, Input } from "@/components/ui";
import { Modal } from "@/components/modal";
import { generateProfessionalQrImage } from "@/lib/utils";

type ReviewStat = { business_id: string; business_name: string; review_count: number; average_rating: number };

export default function DashboardPage() {
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStat[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", category: "", address: "" });
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchData = async () => {
    try {
      const [businessRes, reviewRes, statRes] = await Promise.all([
        fetch("/api/businesses"),
        fetch("/api/reviews"),
        fetch("/api/reviews/stats")
      ]);

      const handleRes = async (res: Response, name: string) => {
        const text = await res.text();
        if (!res.ok) {
          console.error(`Error fetching ${name}:`, res.status, text);
          throw new Error(`Failed to fetch ${name}: ${res.status}`);
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error(`Failed to parse JSON for ${name}:`, text);
          throw e;
        }
      };

      const businessJson = await handleRes(businessRes, "businesses");
      const reviewJson = await handleRes(reviewRes, "reviews");
      const statJson = await handleRes(statRes, "stats");

      setBusinesses(businessJson.data || []);
      setReviews(reviewJson.data || []);
      setStats(statJson.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data";
      console.error("Dashboard fetchData error:", err);
      setError(message);
    }

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

      console.log("reviewUrl ---------> ", reviewUrl)

      // Generate the raw QR code first
      const rawQrDataUrl = await QRCode.toDataURL(reviewUrl, { width: 400, margin: 1 });

      // Enhance it with business branding
      const posterDataUrl = await generateProfessionalQrImage(
        rawQrDataUrl,
        business.name,
        business.category
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) return setError(json.error || "Failed to register business");
    setSelectedBusiness(json.data.id);
    setForm({ name: "", email: "", category: "", address: "" });
    setShowSuccessModal(true);
    await fetchData();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button className="bg-slate-700 hover:bg-slate-800" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Business Registration</h2>
          <form className="mt-4 space-y-3" onSubmit={handleRegister}>
            <Input placeholder="Business name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Business email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" loading={loading}>
              Register Business
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">QR Code</h2>
          <label className="mt-3 block text-sm text-slate-700">Choose business</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
          >
            <option value="">Select a business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.id})
              </option>
            ))}
          </select>
          {qrDataUrl ? (
            <div className="mt-4 space-y-3">
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                <img src={qrDataUrl} alt="Business review poster" className="h-auto w-64 p-1" />
              </div>
              <a 
                href={qrDataUrl} 
                download={`review-poster-${selectedBusiness}.png`} 
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
              >
                <Download className="h-4 w-4" />
                Download Poster PNG
              </a>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="mt-2 text-3xl font-bold">{selectedStat?.average_rating ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total reviews</p>
          <p className="mt-2 text-3xl font-bold">{selectedStat?.review_count ?? reviews.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Registered businesses</p>
          <p className="mt-2 text-3xl font-bold">{businesses.length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Review List</h2>
        <div className="mt-4 space-y-3">
          {filteredReviews.map((review) => (
            <div key={review.id} className="rounded-md border border-slate-200 p-3">
              <p className="text-sm font-semibold">{review.businesses?.name || "Business"}</p>
              <p className="text-sm text-amber-600">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</p>
              <p className="mt-1 text-sm text-slate-700">{review.review_text}</p>
            </div>
          ))}
          {filteredReviews.length === 0 ? <p className="text-sm text-slate-500">No reviews available for this selection.</p> : null}
        </div>
      </Card>
      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Business Registered">
        Your business was created successfully. Select it in the QR section to download its review QR code.
      </Modal>
    </main>
  );
}
