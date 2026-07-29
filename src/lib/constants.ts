// lib/constants.ts
export const BUSINESS_LIMITS = {
  FREE: 2,
  PRO: 5,
  ENTERPRISE: 10,
};

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    tier: "free",
    businessLimit: 2,
    price: 0,
    priceId: "price_free",
    features: [
      "2 Businesses",
      "Basic QR Codes",
      "Standard Reviews",
      "Email Support",
    ],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    tier: "pro",
    businessLimit: 10,
    price: 29,
    priceId: "price_pro_monthly",
    features: [
      "10 Businesses",
      "Custom QR Codes",
      "Advanced Analytics",
      "Priority Support",
      "Multiple Templates",
    ],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    businessLimit: 50,
    price: 99,
    priceId: "price_enterprise_monthly",
    features: [
      "50 Businesses",
      "White-label QR",
      "API Access",
      "Dedicated Support",
      "Custom Branding",
      "Advanced Security",
    ],
  },
} as const;

export type SubscriptionTier = "free" | "pro" | "enterprise";