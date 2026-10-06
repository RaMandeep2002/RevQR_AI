"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Download,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  Filter,
  ArrowUp,
  ArrowDown,
  Loader2,
  Mail,
  RefreshCw,
  Building2,
  Sparkles,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as Tool,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Types
interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  stars: number;
  review_text: string;
  created_at: string;
  generation_count?: number;
  is_successful?: boolean;
  businesses: {
    name: string;
  };
}

interface Business {
  id: string;
  name: string;
  user_id?: string;
}

interface ReviewStats {
  business_id: string;
  business_name: string;
  review_count: number;
  average_rating: number;
}

interface AnalyticsData {
  totalResponses: number;
  averageRating: number;
  positiveReviews: number;
  negativeReviews: number;
  totalAIGenerations: number;
  aiSuccessRate: number;
  ratingsOverTime: RatingData[];
  responseVolume: ResponseVolumeData[];
  ratingByForm: RatingByFormData[];
  reviewBreakdown: ReviewBreakdownData[];
  allReviews: Review[];
  ratingDistribution: RatingDistribution[];
}

interface RatingData {
  date: string;
  rating: number;
}

interface ResponseVolumeData {
  date: string;
  count: number;
}

interface RatingByFormData {
  formId: string;
  formName: string;
  rating: number;
  count: number;
}

interface ReviewBreakdownData {
  question: string;
  answers: { label: string; count: number }[];
}

interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

const COLORS = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

const ITEMS_PER_PAGE = 10;

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalResponses: 0,
    averageRating: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    totalAIGenerations: 0,
    aiSuccessRate: 0,
    ratingsOverTime: [],
    responseVolume: [],
    ratingByForm: [],
    reviewBreakdown: [],
    allReviews: [],
    ratingDistribution: [],
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data table states
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Review>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [tableRatingFilter, setTableRatingFilter] = useState<string>("all");

  // Fetch businesses and analytics data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch businesses from API
      const businessRes = await fetch("/api/businesses");
      const businessJson = await businessRes.json();

      const nextBusinesses = businessJson.data || [];
      setBusinesses(nextBusinesses);

      // If businesses exist, set selected business
      if (nextBusinesses.length > 0) {
        // Check URL params for businessId
        const params = new URLSearchParams(window.location.search);
        const requestedBusinessId = params.get("businessId");

        if (requestedBusinessId) {
          const requestedBusiness = nextBusinesses.find(
            (business: Business) => business.id === requestedBusinessId,
          );
          setSelectedBusiness(requestedBusiness?.id || nextBusinesses[0].id);
        } else {
          setSelectedBusiness(nextBusinesses[0].id);
        }
      } else {
        setSelectedBusiness("all");
        setIsLoading(false);
        return;
      }

      // Fetch analytics data for the selected business
      await fetchAnalyticsData(nextBusinesses);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async (businessList?: Business[]) => {
    try {
      const currentBusinesses = businessList || businesses;

      // Build query params
      const params = new URLSearchParams();
      if (selectedBusiness !== "all") {
        params.append("businessId", selectedBusiness);
      }
      if (timeRange) {
        params.append("timeRange", timeRange);
      }

      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?${params.toString()}`),
        fetch(`/api/reviews/stats?${params.toString()}`),
      ]);

      if (!reviewsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const reviewsData = await reviewsResponse.json();
      const statsData = await statsResponse.json();

      console.log("reviewsData -----> ", reviewsData);
      console.log("statsData -----> ", statsData);

      const reviews: Review[] = reviewsData.data || [];
      const stats: ReviewStats[] = statsData.data || [];

      const processedData = processAnalyticsData(reviews, stats);
      setData(processedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data. Please try again.");
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when business or time range changes
  useEffect(() => {
    if (businesses.length > 0) {
      fetchAnalyticsData();
    }
  }, [selectedBusiness, timeRange]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearchQuery, tableRatingFilter, sortField, sortDirection]);

  const processAnalyticsData = (
    reviews: Review[],
    stats: ReviewStats[],
  ): AnalyticsData => {
    const totalResponses = reviews.length;
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    const averageRating = totalResponses > 0 ? totalStars / totalResponses : 0;
    const positiveReviews = reviews.filter((r) => r.stars >= 4).length;
    const negativeReviews = reviews.filter((r) => r.stars <= 2).length;

    const reviewsWithAI = reviews.filter((r) => (r.generation_count || 0) > 0);
    const totalAIGenerations = reviewsWithAI.reduce(
      (sum, r) => sum + (r.generation_count || 0),
      0,
    );
    const aiSuccesses = reviewsWithAI.filter((r) => r.is_successful).length;
    const aiSuccessRate =
      totalAIGenerations > 0 ? (aiSuccesses / reviewsWithAI.length) * 100 : 0;

    // Rating distribution
    const distribution = [1, 2, 3, 4, 5].map((stars) => {
      const count = reviews.filter((r) => r.stars === stars).length;
      return {
        stars,
        count,
        percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      };
    });

    // Date maps for ratings over time
    const dateMap = new Map<string, { total: number; count: number }>();
    reviews.forEach((review) => {
      const date = new Date(review.created_at).toISOString().split("T")[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { total: 0, count: 0 });
      }
      const entry = dateMap.get(date)!;
      entry.total += review.stars;
      entry.count += 1;
    });

    const ratingsOverTime: RatingData[] = Array.from(dateMap.entries())
      .map(([date, { total, count }]) => ({
        date,
        rating: total / count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Response volume
    const volumeMap = new Map<string, number>();
    reviews.forEach((review) => {
      const date = new Date(review.created_at).toISOString().split("T")[0];
      volumeMap.set(date, (volumeMap.get(date) || 0) + 1);
    });

    const responseVolume: ResponseVolumeData[] = Array.from(volumeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Rating by form/business
    const formMap = new Map<
      string,
      { name: string; total: number; count: number }
    >();
    reviews.forEach((review) => {
      const formId = review.business_id;
      if (!formMap.has(formId)) {
        formMap.set(formId, {
          name: review.businesses?.name || `Form ${formId}`,
          total: 0,
          count: 0,
        });
      }
      const entry = formMap.get(formId)!;
      entry.total += review.stars;
      entry.count += 1;
    });

    const ratingByForm: RatingByFormData[] = Array.from(formMap.entries())
      .map(([formId, { name, total, count }]) => ({
        formId,
        formName: name,
        rating: total / count,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Simple review breakdown from review text
    const breakdownMap = new Map<string, Map<string, number>>();
    const keywords = {
      "Service Quality": ["excellent", "great", "good", "amazing", "wonderful"],
      "Product Quality": ["quality", "durable", "well-made", "premium"],
      "Customer Support": ["support", "helpful", "responsive", "friendly"],
      "Value for Money": ["worth", "price", "value", "affordable"],
      Delivery: ["fast", "quick", "shipping", "delivery"],
      Cleanliness: ["clean", "tidy", "organized", "neat"],
      Professionalism: ["professional", "knowledgeable", "expert"],
    };

    reviews.forEach((review) => {
      const text = review.review_text.toLowerCase();
      Object.entries(keywords).forEach(([category, words]) => {
        words.forEach((word) => {
          if (text.includes(word)) {
            if (!breakdownMap.has(category)) {
              breakdownMap.set(category, new Map());
            }
            const answers = breakdownMap.get(category)!;
            answers.set(word, (answers.get(word) || 0) + 1);
          }
        });
      });
    });

    const reviewBreakdown: ReviewBreakdownData[] = Array.from(
      breakdownMap.entries(),
    )
      .map(([question, answers]) => ({
        question,
        answers: Array.from(answers.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3),
      }))
      .filter((item) => item.answers.length > 0)
      .slice(0, 3);

    return {
      totalResponses,
      averageRating,
      positiveReviews,
      negativeReviews,
      totalAIGenerations,
      aiSuccessRate,
      ratingsOverTime,
      responseVolume,
      ratingByForm,
      reviewBreakdown,
      allReviews: reviews,
      ratingDistribution: distribution,
    };
  };

  const handleExportCSV = () => {
    if (data.allReviews.length === 0) {
      toast.error("No reviews to export.");
      return;
    }

    const cleanCustomerName = (name: string) => {
      if (!name) return "Anonymous";
      let cleaned = name.replace(/^\d+\s*/, "").trim();
      if (!cleaned) return "Anonymous";
      return cleaned
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    };

    const headers = [
      "Date",
      "Customer Name",
      "Customer Email",
      "Rating",
      "Review Text",
      "Business",
      "Generations",
      "AI Successful",
    ];

    const rows = data.allReviews.map((review) => {
      const date = new Date(review.created_at);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();
      const year = date.getFullYear();
      const formattedDate = `${month} ${day} ${year}`;

      const customerName = cleanCustomerName(review.customer_name);

      let reviewText = review.review_text || "";
      reviewText = reviewText.replace(/\s+/g, " ").trim();
      if (reviewText.length > 500) {
        reviewText = reviewText.substring(0, 497) + "...";
      }

      return [
        formattedDate,
        customerName,
        review.customer_email || "",
        review.stars.toString(),
        `"${reviewText.replace(/"/g, '""')}"`,
        review.businesses?.name || "",
        (review.generation_count || 0).toString(),
        review.is_successful ? "Yes" : "No",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reviews-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
  };

  const handleEmailCSV = async () => {
    if (data.allReviews.length === 0) {
      toast.error("No reviews to email.");
      return;
    }

    setIsSendingEmail(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        toast.error(
          "Could not retrieve your email. Please try logging in again.",
        );
        setIsSendingEmail(false);
        return;
      }

      const cleanCustomerName = (name: string) => {
        if (!name) return "Anonymous";
        let cleaned = name.replace(/^\d+\s*/, "").trim();
        if (!cleaned) return "Anonymous";
        return cleaned
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ");
      };

      const headers = [
        "Date",
        "Customer Name",
        "Customer Email",
        "Rating",
        "Review Text",
        "Business",
        "Generations",
        "AI Successful",
      ];

      const rows = data.allReviews.map((review) => {
        const date = new Date(review.created_at);
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        const formattedDate = `${month} ${day} ${year}`;

        const customerName = cleanCustomerName(review.customer_name);

        let reviewText = review.review_text || "";
        reviewText = reviewText.replace(/\s+/g, " ").trim();
        if (reviewText.length > 500) {
          reviewText = reviewText.substring(0, 497) + "...";
        }

        return [
          formattedDate,
          customerName,
          review.customer_email || "",
          review.stars.toString(),
          `"${reviewText.replace(/"/g, '""')}"`,
          review.businesses?.name || "",
          (review.generation_count || 0).toString(),
          review.is_successful ? "Yes" : "No",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const businessName =
        data.allReviews[0]?.businesses?.name || "DemoQR Business";

      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          csvContent,
          businessName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send email");
      }

      toast.success(`Report successfully emailed to ${user.email}!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send report via email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cleanCustomerName = (name: string) => {
    if (!name) return "Anonymous";
    let cleaned = name.replace(/^\d+\s*/, "").trim();
    if (!cleaned) return "Anonymous";
    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= stars
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter and sort reviews for the table
  const filteredAndSortedReviews = (() => {
    let filtered = [...data.allReviews];

    // Apply search filter
    if (tableSearchQuery.trim()) {
      const query = tableSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          cleanCustomerName(review.customer_name)
            .toLowerCase()
            .includes(query) ||
          review.customer_email?.toLowerCase().includes(query) ||
          review.review_text?.toLowerCase().includes(query) ||
          review.businesses?.name?.toLowerCase().includes(query),
      );
    }

    // Apply rating filter
    if (tableRatingFilter !== "all") {
      const ratingNum = parseInt(tableRatingFilter);
      filtered = filtered.filter((review) => review.stars === ratingNum);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle special cases
      if (sortField === "customer_name") {
        aVal = cleanCustomerName(a.customer_name);
        bVal = cleanCustomerName(b.customer_name);
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  })();

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedReviews.length / ITEMS_PER_PAGE,
  );
  const paginatedReviews = filteredAndSortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSort = (field: keyof Review) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    trend,
    trendLabel,
  }: {
    title: string;
    value: string | number;
    icon: any;
    subtitle?: string;
    trend?: number;
    trendLabel?: string;
  }) => (
    <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-800/80">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend >= 0 ? (
                <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {Math.abs(trend)}% {trendLabel || "vs last period"}
              </span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3">
          <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  // No businesses found
  if (businesses.length === 0 && !isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No Businesses Found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You don't have any businesses registered yet. Create your first
            business to start collecting reviews.
          </p>
          <Button
            onClick={() => (window.location.href = "/dashboard/businesses/new")}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Create Business
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Filter className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Failed to Load Data
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>
          <Button
            onClick={fetchData}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (data.totalResponses === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <Star className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No Reviews Yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {selectedBusiness === "all"
              ? "Start collecting reviews from your customers to see analytics here."
              : `No reviews found for ${businesses.find((b) => b.id === selectedBusiness)?.name || "this business"}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights from your customer feedback
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Business Selector */}
          <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
            <SelectTrigger className="w-48 border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
              <SelectValue placeholder="Select Business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.length > 1 && (
                <SelectItem value="all">All Businesses</SelectItem>
              )}
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportCSV}
            className="border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4 text-slate-500" />
            Export CSV
          </Button>
          <Button
            onClick={handleEmailCSV}
            disabled={isSendingEmail}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/40"
          >
            {isSendingEmail ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {isSendingEmail ? "Sending..." : "Email CSV"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Responses"
          value={data.totalResponses}
          icon={TrendingUp}
          trend={12}
          trendLabel="increase"
        />
        <StatCard
          title="Average Rating"
          value={data.averageRating.toFixed(1)}
          icon={Star}
          subtitle={`${"★".repeat(Math.round(data.averageRating))}${"☆".repeat(
            5 - Math.round(data.averageRating),
          )}`}
          trend={5}
          trendLabel="improvement"
        />
        <StatCard
          title="Positive Reviews"
          value={data.positiveReviews}
          icon={ThumbsUp}
          subtitle={`${
            data.totalResponses > 0
              ? Math.round((data.positiveReviews / data.totalResponses) * 100)
              : 0
          }% of total`}
          trend={8}
          trendLabel="increase"
        />
        <StatCard
          title="Negative Reviews"
          value={data.negativeReviews}
          icon={ThumbsDown}
          subtitle={`${
            data.totalResponses > 0
              ? Math.round((data.negativeReviews / data.totalResponses) * 100)
              : 0
          }% of total`}
          trend={-3}
          trendLabel="decrease"
        />
        <StatCard
          title="AI Generations"
          value={data.totalAIGenerations}
          icon={Sparkles}
          subtitle="Templates generated"
        />
        <StatCard
          title="AI Success Rate"
          value={`${Math.round(data.aiSuccessRate)}%`}
          icon={Target}
          subtitle="Publish rate with AI"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ratings Over Time */}
        <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Ratings Over Time
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily average star rating
          </p>
          <div className="mt-4 h-64">
            {data.ratingsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ratingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                    formatter={(value, name) => {
                      if (typeof value === "number") {
                        return [`${value.toFixed(1)} ⭐`, "Average Rating"];
                      }
                      return [value, name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Response Volume */}
        <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Response Volume
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Number of responses per day
          </p>
          <div className="mt-4 h-64">
            {data.responseVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.responseVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                    formatter={(value) => [value, "Responses"]}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Rating by Form */}
        {/* <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Rating by Form
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average star rating per form
          </p>
          <div className="mt-4 h-64">
            {data.ratingByForm.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ratingByForm}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="formName"
                    label={({ name, percent }) => {
                      if (!name || percent === undefined) return null;
                      return `${name} (${(percent * 100).toFixed(0)}%)`;
                    }}
                    labelLine={false}
                  >
                    {data.ratingByForm.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [value, "Responses"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.ratingByForm.map((item, index) => (
              <div
                key={item.formId}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {item.formName}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.rating.toFixed(1)} ⭐
                </span>
              </div>
            ))}
          </div>
        </Card> */}

        {/* Rating Distribution */}
        {/* <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Rating Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Number of reviews by star rating
          </p>
          <div className="mt-4 space-y-3">
            {data.ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex w-12 items-center gap-1">
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {item.stars}
                  </span>
                  <Star className="h-3 w-3 fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700" />
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: item.stars * 0.1 }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
            {data.ratingDistribution.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total Reviews
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {data.totalResponses}
                </span>
              </div>
            )}
          </div>
        </Card> */}
      </div>

      {/* Data Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                All Reviews
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredAndSortedReviews.length} review
                {filteredAndSortedReviews.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="h-9 w-48 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                />
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Rating Filter */}
              <Select
                value={tableRatingFilter}
                onValueChange={setTableRatingFilter}
              >
                <SelectTrigger className="h-9 w-32 border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(tableSearchQuery || tableRatingFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTableSearchQuery("");
                    setTableRatingFilter("all");
                  }}
                  className="h-9 border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === "created_at" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("customer_name")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {sortField === "customer_name" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("stars")}
                  >
                    <div className="flex items-center gap-1">
                      Rating
                      {sortField === "stars" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Review
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Business
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("generation_count")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      AI
                      {sortField === "generation_count" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {formatFullDate(review.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {cleanCustomerName(review.customer_name)}
                          </p>
                          {review.customer_email && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {review.customer_email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          {renderStars(review.stars)}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {review.stars}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-300"
                          title={review.review_text}
                        >
                          {review.review_text || "—"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {review.businesses?.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        {(review.generation_count || 0) > 0 ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {review.generation_count}
                            </span>
                            {review.is_successful && (
                              <TooltipProvider delayDuration={0}>
                                <Tool>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                      ✓
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="text-xs"
                                  >
                                    <p>AI response was successfully used</p>
                                  </TooltipContent>
                                </Tool>
                              </TooltipProvider>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-500">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No reviews match your filters
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTableSearchQuery("");
                            setTableRatingFilter("all");
                          }}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAndSortedReviews.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredAndSortedReviews.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {filteredAndSortedReviews.length}
                </span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 border-slate-200 dark:border-slate-700"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border-slate-200 dark:border-slate-700"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
