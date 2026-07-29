// app/dashboard/analytics/page.tsx
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
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
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
} from "lucide-react";
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
  businesses: {
    name: string;
  };
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
  ratingsOverTime: RatingData[];
  responseVolume: ResponseVolumeData[];
  ratingByForm: RatingByFormData[];
  reviewBreakdown: ReviewBreakdownData[];
  allReviews: Review[];
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

const COLORS = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalResponses: 0,
    averageRating: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    ratingsOverTime: [],
    responseVolume: [],
    ratingByForm: [],
    reviewBreakdown: [],
    allReviews: [],
  });
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch("/api/reviews"),
        fetch("/api/reviews?stats=true"),
      ]);

      if (!reviewsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const reviewsData = await reviewsResponse.json();
      const statsData = await statsResponse.json();

      const reviews: Review[] = reviewsData.data || [];
      const stats: ReviewStats[] = statsData.data || [];

      const processedData = processAnalyticsData(reviews, stats);
      setData(processedData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (
    reviews: Review[],
    stats: ReviewStats[],
  ): AnalyticsData => {
    const totalResponses = reviews.length;
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    const averageRating = totalResponses > 0 ? totalStars / totalResponses : 0;
    const positiveReviews = reviews.filter((r) => r.stars >= 4).length;
    const negativeReviews = reviews.filter((r) => r.stars <= 2).length;

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

    const volumeMap = new Map<string, number>();
    reviews.forEach((review) => {
      const date = new Date(review.created_at).toISOString().split("T")[0];
      volumeMap.set(date, (volumeMap.get(date) || 0) + 1);
    });

    const responseVolume: ResponseVolumeData[] = Array.from(volumeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

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

    const reviewBreakdown: ReviewBreakdownData[] = [];

    return {
      totalResponses,
      averageRating,
      positiveReviews,
      negativeReviews,
      ratingsOverTime,
      responseVolume,
      ratingByForm,
      reviewBreakdown,
      allReviews: reviews,
    };
  };

  const handleExportCSV = () => {
    if (data.allReviews.length === 0) {
      alert("No reviews to export.");
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
  };

  const handleEmailCSV = async () => {
    if (data.allReviews.length === 0) {
      alert("No reviews to email.");
      return;
    }

    setIsSendingEmail(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        alert("Could not retrieve your email. Please try logging in again.");
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
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const businessName =
        data.allReviews[0]?.businesses?.name || "QReview Business";

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
      alert(err.message || "Failed to send report via email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
            onClick={fetchAnalyticsData}
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
            Start collecting reviews from your customers to see analytics here.
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
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      backgroundColor: "rgba(255,255,255,0.9)",
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
                      backgroundColor: "rgba(255,255,255,0.9)",
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
        <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
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
                      backgroundColor: "rgba(255,255,255,0.9)",
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
        </Card>

        {/* Review Breakdown */}
        <Card className="border-0 bg-white/80 p-6 backdrop-blur-sm dark:bg-slate-800/80">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Review Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Most common responses from choice questions
          </p>
          <div className="mt-4 flex h-64 items-center justify-center">
            {data.reviewBreakdown.length > 0 ? (
              <div className="w-full space-y-4">
                {data.reviewBreakdown.map((item, index) => (
                  <div key={index}>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.question}
                    </p>
                    <div className="space-y-2">
                      {item.answers.map((answer, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[100px]">
                            {answer.label}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{
                                width: `${(answer.count / item.answers.reduce((sum, a) => sum + a.count, 0)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[30px]">
                            {answer.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  <Filter className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No choice answers yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Responses will appear here once collected
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
