// types/subscription.ts
export interface Subscription {
  id: string;
  user_id: string;
  razorpay_customer_id: string;
  razorpay_subscription_id: string;
  razorpay_payment_id?: string;
  plan_id: string;
  plan_name: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'free';
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeatures;
  current_usage: {
    scansUsed: number;
    lastResetDate: string | null;
  };
  current_period_start: string;
  current_period_end: string;
  remaining_scans: number;
  is_active: boolean;
  is_expired: boolean;
  scan_limit: number;
  scans_used: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  reviewScanLimit: number;
  languages: string[];
  alerts: string;
  qrStandee: string;
  analytics: string;
  locations: number | string;
  qrCodes: string;
}

export type PlanName = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'FREE';

export type FeatureName = 
  | 'basic_analytics'
  | 'email_alerts'
  | '1_language'
  | 'multi_language'
  | 'sentiment_analysis'
  | 'priority_support'
  | 'voice_to_text'
  | 'api_access'
  | 'team_management'
  | 'live_chat';

export interface PlanConfig {
  name: string;
  icon: any;
  color: string;
  badgeColor: string;
  price: string;
  scanLimit: string;
  alert: string;
  maxLocations: number;
  maxScans: number;
  idealFor: string[];
  features: FeatureName[];
  featureList: string[];
}