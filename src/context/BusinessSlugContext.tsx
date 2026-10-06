"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { slugify } from "@/lib/utils";

interface BusinessSlugContextValue {
  /** The slug extracted from the URL (e.g. "demo-business") */
  slug: string;
  /** The resolved business ID, if lookup succeeded */
  businessId: string | null;
  /** Whether slug resolution is still loading */
  loading: boolean;
  /**
   * Given a dashboard sub-path (e.g. "/reviews"), returns the full slug-based URL.
   * e.g. getSlugPath("/reviews") → "/demo-business/reviews"
   */
  getSlugPath: (subPath?: string) => string;
  /** The raw list of businesses (populated after resolution) */
  businesses: Array<{ id: string; name: string; [k: string]: unknown }>;
}

const BusinessSlugContext = createContext<BusinessSlugContextValue>({
  slug: "",
  businessId: null,
  loading: true,
  getSlugPath: (sub = "") => `/dashboard${sub}`,
  businesses: [],
});

export function BusinessSlugProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<
    Array<{ id: string; name: string; [k: string]: unknown }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolve = async () => {
      try {
        const res = await fetch(`/api/businesses/by-slug/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const json = await res.json();
          setBusinessId(json.data?.id ?? null);
        }

        // Also load all businesses so navigation can switch slugs
        const allRes = await fetch("/api/businesses");
        if (allRes.ok) {
          const allJson = await allRes.json();
          setBusinesses(allJson.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) resolve();
    else setLoading(false);
  }, [slug]);

  const getSlugPath = (subPath = "") =>
    slug ? `/${slug}${subPath}` : `/dashboard${subPath}`;

  return (
    <BusinessSlugContext.Provider
      value={{ slug, businessId, loading, getSlugPath, businesses }}
    >
      {children}
    </BusinessSlugContext.Provider>
  );
}

export function useBusinessSlug() {
  return useContext(BusinessSlugContext);
}

/**
 * Given a business name, return its slug.
 * This is a pure helper — doesn't hit any API.
 */
export function businessNameToSlug(name: string): string {
  return slugify(name);
}
