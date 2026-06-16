"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Globe2,
  Package,
  Plug,
  Star,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Business } from "@/types";

type Platform = {
  id: "nextjs" | "react" | "angular" | "wordpress";
  label: string;
  badge: string;
  description: string;
};

const platforms: Platform[] = [
  {
    id: "nextjs",
    label: "Next.js",
    badge: "App Router ready",
    description: "Server or client component snippet for business websites.",
  },
  {
    id: "react",
    label: "React",
    badge: "SPA widget",
    description: "Drop-in component for Vite, CRA, and custom React apps.",
  },
  {
    id: "angular",
    label: "Angular",
    badge: "Service + template",
    description: "Fetch reviews through HttpClient and render them in a card grid.",
  },
  {
    id: "wordpress",
    label: "WordPress",
    badge: "Plugin roadmap",
    description: "Shortcode-first integration for sites managed in WordPress.",
  },
];

const getSnippet = (platform: Platform["id"], endpoint: string) => {
  if (platform === "nextjs") {
    return `export default async function ReviewsWidget() {
  const response = await fetch("${endpoint}", { next: { revalidate: 60 } });
  const { data } = await response.json();

  return (
    <section>
      <h2>{data.business.name} reviews</h2>
      {data.reviews.map((review) => (
        <article key={review.id}>
          <strong>{review.customer_name}</strong>
          <span>{review.stars}/5 stars</span>
          <p>{review.review_text}</p>
        </article>
      ))}
    </section>
  );
}`;
  }

  if (platform === "react") {
    return `import { useEffect, useState } from "react";

export function QReviewWidget() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("${endpoint}")
      .then((response) => response.json())
      .then((json) => setReviews(json.data.reviews || []));
  }, []);

  return reviews.map((review) => (
    <article key={review.id}>
      <strong>{review.customer_name}</strong>
      <span>{review.stars}/5 stars</span>
      <p>{review.review_text}</p>
    </article>
  ));
}`;
  }

  if (platform === "angular") {
    return `// reviews.service.ts
getReviews() {
  return this.http.get("${endpoint}");
}

// reviews.component.html
@for (review of reviews; track review.id) {
  <article>
    <strong>{{ review.customer_name }}</strong>
    <span>{{ review.stars }}/5 stars</span>
    <p>{{ review.review_text }}</p>
  </article>
}`;
  }

  return `[qreview_widget endpoint="${endpoint}"]

Future plugin flow:
1. Install the QReview WordPress plugin.
2. Paste your business endpoint in plugin settings.
3. Place the shortcode on any page.`;
};

export default function DashboardIntegrationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform["id"]>("nextjs");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

    const fetchBusinesses = async () => {
      const response = await fetch("/api/businesses");
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Failed to load businesses.");
        return;
      }

      const nextBusinesses = json.data || [];
      setBusinesses(nextBusinesses);
      setSelectedBusinessId(nextBusinesses[0]?.id || "");
    };

    fetchBusinesses();
  }, []);

  const endpoint = selectedBusinessId
    ? `${origin}/api/public/reviews/${selectedBusinessId}?limit=6`
    : "";
  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId,
  );
  const snippet = useMemo(
    () => getSnippet(selectedPlatform, endpoint || "YOUR_QREVIEW_ENDPOINT"),
    [endpoint, selectedPlatform],
  );

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Plug className="h-3.5 w-3.5" />
            Website publishing
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Integrations
          </h1>
          <p className="mt-1 max-w-2xl font-medium text-slate-500 dark:text-slate-300">
            Connect business reviews to websites through embeddable feeds for
            Next.js, React, Angular, and WordPress.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <Globe2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Public review feed
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card className="bg-white p-6 dark:bg-slate-800/50">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Choose Business
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              The selected business controls which reviews are published.
            </p>
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="mt-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50"
            >
              <option value="">Select business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
            {selectedBusiness ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedBusiness.name}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedBusiness.category} · {selectedBusiness.location}
                </p>
              </div>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {platforms.map((platform) => {
              const active = selectedPlatform === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-900 dark:text-white">
                      {platform.label}
                    </p>
                    {active ? (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {platform.badge}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {platform.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="overflow-hidden bg-white p-0 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Install Snippet
                </h2>
              </div>
              <p className="mt-1 break-all text-xs font-semibold text-slate-500 dark:text-slate-400">
                {endpoint || "Select a business to create an endpoint."}
              </p>
            </div>
            <Button
              onClick={copySnippet}
              disabled={!selectedBusinessId}
              className="h-10 rounded-xl bg-slate-900 px-4 font-bold hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="max-h-[520px] overflow-auto bg-slate-950 p-5 text-sm leading-6 text-slate-100">
            <code>{snippet}</code>
          </pre>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Star,
            title: "Auto-sync reviews",
            text: "Widgets read from the live public feed, so new business reviews can appear on connected websites.",
          },
          {
            icon: Package,
            title: "Plugin-ready API",
            text: "The endpoint is stable enough to power future npm packages and a WordPress plugin.",
          },
          {
            icon: ExternalLink,
            title: "Controlled rollout",
            text: "Start with snippets now, then ship polished extensions for each platform when packaging is ready.",
          },
        ].map((item) => (
          <Card key={item.title} className="bg-white p-5 dark:bg-slate-800/50">
            <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            <h3 className="mt-3 font-black text-slate-900 dark:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {item.text}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
