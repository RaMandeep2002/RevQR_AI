// hooks/useBusinessLimit.ts
import { useEffect, useState } from "react";
import { BUSINESS_LIMITS, SUBSCRIPTION_PLANS, SubscriptionTier } from "@/lib/constants";

interface BusinessLimitData {
  userTier: SubscriptionTier;
  businessCount: number;
  limit: number;
  canAddBusiness: boolean;
  remaining: number;
  loading: boolean;
  nextTier: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS] | null;
  currentPlan: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
  isAtLimit: boolean;
  upgradeRequired: boolean;
}

export function useBusinessLimit(): BusinessLimitData {
  const [userTier, setUserTier] = useState<SubscriptionTier>("free");
  const [businessCount, setBusinessCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/subscription");
        const data = await response.json();
        setUserTier(data.subscription_tier || "free");
        setBusinessCount(data.business_count || 0);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getLimit = (): number => {
    switch (userTier) {
      case "pro":
        return BUSINESS_LIMITS.PRO;
      case "enterprise":
        return BUSINESS_LIMITS.ENTERPRISE;
      default:
        return BUSINESS_LIMITS.FREE;
    }
  };

  const limit = getLimit();
  const canAddBusiness = businessCount < limit;
  const remaining = Math.max(0, limit - businessCount);
  const isAtLimit = businessCount >= limit;
  const upgradeRequired = isAtLimit;

  const getNextTier = () => {
    if (userTier === "free") return SUBSCRIPTION_PLANS.PRO;
    if (userTier === "pro") return SUBSCRIPTION_PLANS.ENTERPRISE;
    return null;
  };

  const getCurrentPlan = () => {
    const tier = userTier.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS;
    return SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.FREE;
  };

  return {
    userTier,
    businessCount,
    limit,
    canAddBusiness,
    remaining,
    loading,
    nextTier: getNextTier(),
    currentPlan: getCurrentPlan(),
    isAtLimit,
    upgradeRequired,
  };
}