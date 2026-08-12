export const PLAN_IDS = {
  starter: process.env.RAZORPAY_STARTER_PLAN_ID!,
  growth: process.env.RAZORPAY_GROWTH_PLAN_ID!,
  enterprise: process.env.RAZORPAY_ENTERPRISE_PLAN_ID!,
} as const;

export type PlanType = keyof typeof PLAN_IDS;