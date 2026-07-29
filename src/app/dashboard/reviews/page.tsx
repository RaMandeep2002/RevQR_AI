"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp,
  User,
  Mail,
  Building2,
  ChevronDown,
  Download,
  RefreshCw
} from "lucide-react";
import { Review } from "@/types";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const response = await fetch("/api/reviews");
      const json = await response.json();
      setReviews(json.data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.customer_name?.toLowerCase().includes(term) ||
          review.customer_email?.toLowerCase().includes(term) ||
          review.review_text?.toLowerCase().includes(term) ||
          review.businesses?.name?.toLowerCase().includes(term)
      );
    }

    // Rating filter
    if (filterRating !== null) {
      filtered = filtered.filter((review) => review.stars === filterRating);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "oldest":
        filtered.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case "highest":
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case "lowest":
        filtered.sort((a, b) => a.stars - b.stars);
        break;
    }

    return filtered;
  }, [reviews, searchTerm, filterRating, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total > 0 
      ? (reviews.reduce((acc, r) => acc + r.stars, 0) / total).toFixed(1)
      : "0.0";
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.stars >= 1 && r.stars <= 5) {
        ratingCounts[r.stars - 1]++;
      }
    });
    return { total, average, ratingCounts };
  }, [reviews]);

  // Rating distribution percentages
  const ratingPercentages = useMemo(() => {
    const total = stats.total || 1;
    return stats.ratingCounts.map((count) => (count / total) * 100);
  }, [stats]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg shadow-purple-500/20">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reviews
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage and analyze all customer feedback
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" />
            Export
          </button> */}
          <button 
            onClick={() => {
              setLoading(true);
              fetch("/api/reviews").then(res => res.json()).then(json => {
                setReviews(json.data || []);
                setLoading(false);
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 dark:from-purple-950/30 dark:to-purple-900/20">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Reviews</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 dark:from-amber-950/30 dark:to-amber-900/20">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Average Rating</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {stats.average} ⭐
          </p>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 dark:from-emerald-950/30 dark:to-emerald-900/20">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">5-Star Reviews</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {stats.ratingCounts[4]}
          </p>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 dark:from-blue-950/30 dark:to-blue-900/20">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Response Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {stats.total > 0 ? Math.round((stats.ratingCounts.reduce((a, b) => a + b, 0) / stats.total) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <Card className="border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Rating Distribution</h3>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const index = stars - 1;
              const percentage = ratingPercentages[index] || 0;
              const count = stats.ratingCounts[index] || 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex w-16 items-center gap-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stars}
                    </span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="relative flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filters Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/50 py-2 pl-9 pr-4 text-sm backdrop-blur-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
            />
          </div> */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={filterRating !== null ? filterRating.toString() : "all"}
              onValueChange={(val) => setFilterRating(val === "all" ? null : Number(val))}
            >
              <SelectTrigger className="w-[140px] rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy(val as any)}
          >
            <SelectTrigger className="w-[150px] rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {loading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 bg-white/50 p-6 backdrop-blur-sm dark:bg-slate-800/50">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </Card>
          ))
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <Card
              key={review.id}
              className="group border-0 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-800/50"
              // style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                    {(review.customer_name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {review.customer_name || "Anonymous Customer"}
                      </p>
                      {review.customer_email && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Mail className="h-3 w-3" />
                            {review.customer_email}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.stars
                                ? "fill-current"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {review.stars} {review.stars === 1 ? 'star' : 'stars'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Building2 className="h-3 w-3" />
                        {review.businesses?.name || "Business"}
                      </div>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(review.created_at || "").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    review.stars >= 4 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : review.stars >= 3
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {review.stars >= 4 ? "Positive" : review.stars >= 3 ? "Neutral" : "Negative"}
                  </span>
                </div>
              </div>
              {review.review_text && (
                <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:bg-slate-800/30">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    &quot;{review.review_text}&quot;
                  </p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="border-0 bg-white/50 p-12 text-center backdrop-blur-sm dark:bg-slate-800/50">
            <div className="mx-auto max-w-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {searchTerm || filterRating ? "No matching reviews" : "No reviews yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm || filterRating 
                  ? "Try adjusting your search or filters"
                  : "Start collecting reviews from your customers to see them here."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}