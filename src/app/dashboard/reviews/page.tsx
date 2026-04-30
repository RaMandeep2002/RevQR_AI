"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui";
import { Review } from "@/types";

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await fetch("/api/reviews");
      const json = await response.json();
      setReviews(json.data || []);
    };
    fetchReviews();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">All Reviews</h1>
        <p className="mt-1 font-medium text-slate-500">See every review submitted by customers.</p>
      </div>
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold uppercase text-slate-500">
                  {(review.customer_name || "A").charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900">{review.customer_name || "Anonymous Customer"}</p>
                  <p className="text-xs font-medium text-slate-500">{review.customer_email || "No email"}</p>
                  <p className="text-xs font-semibold text-slate-400">{review.businesses?.name || "Business"}</p>
                  <div className="mt-1 flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.stars ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400">{new Date(review.created_at || "").toLocaleDateString()}</span>
            </div>
            <p className="mt-4 border-l-4 border-slate-100 pl-4 text-sm italic leading-relaxed text-slate-600">{review.review_text}</p>
          </Card>
        ))}
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white py-12 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">No reviews found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
