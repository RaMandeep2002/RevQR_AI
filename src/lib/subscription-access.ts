import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionFeatures = Record<string, unknown>;

const FREE_FEATURES: SubscriptionFeatures = {
  reviewScanLimit: 10,
  maxBusinesses: 1,
  maxStaticQRCodes: 1,
  maxDynamicQRCodes: 0,
  analytics: false,
  monthlyReports: false,
  voiceToText: false,
  staffLeaderboard: false,
  restApiAccess: false,
  webhooks: false,
  teamManagement: false,
  liveChatSupport: false,
};

export interface SubscriptionAccess {
  user: { id: string };
  subscription: Record<string, any> | null;
  features: SubscriptionFeatures;
  isActive: boolean;
}

export function parseJson<T>(value: T | string | null | undefined, fallback: T): T {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function featureEnabled(features: SubscriptionFeatures, name: string): boolean {
  const value = features[name];
  return value !== undefined && value !== null && value !== false && value !== 0 && value !== "None";
}

export function pathMatches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function subscriptionIsActive(subscription: Record<string, any> | null): boolean {
  if (!subscription || subscription.status !== "active") return false;
  if (!subscription.current_period_end) return true;
  return new Date(subscription.current_period_end).getTime() >= Date.now();
}

export async function getSubscriptionAccess(): Promise<
  | { access: SubscriptionAccess; response?: never }
  | { access?: never; response: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log(subscription)

  if (error) {
    console.error("Subscription fetch error:", error);
    return { response: NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 }) };
  }

  const storedFeatures = parseJson<SubscriptionFeatures>(subscription?.features, {});
  const features = { ...FREE_FEATURES, ...storedFeatures };

  return {
    access: {
      user: { id: user.id },
      subscription,
      features,
      isActive: subscriptionIsActive(subscription),
    },
  };
}

export function featureResponse(access: SubscriptionAccess, feature: string): NextResponse | null {
  if (access.isActive && featureEnabled(access.features, feature)) return null;
  return NextResponse.json(
    { error: "This feature is not available on your current subscription.", feature, code: "FEATURE_RESTRICTED" },
    { status: 403 },
  );
}

export function limitResponse(access: SubscriptionAccess, feature: string, current: number): NextResponse | null {
  console.log("limitResponse called with:", { access, feature, current });
    console.log("access.features['maxBusinesses']:", access?.features?.['maxBusinesses']);
  
  const limit = Number(access.features[feature]);
  console.log("Parsed limit:", limit);

  console.log({current, limit})
  
  console.log("Checking conditions - isActive:", access.isActive, "isFinite(limit):", Number.isFinite(limit), "current < limit:", current < limit);
  
  if (Number.isFinite(limit) && current < limit) {
    console.log("Condition met - returning null (request allowed)");
    return null;
  }
  
  console.log("Condition failed - returning error response");
  return NextResponse.json(
    { error: "Subscription limit reached.", feature, limit: Number.isFinite(limit) ? limit : 0, current, code: "LIMIT_REACHED" },
    { status: 403 },
  );
}
