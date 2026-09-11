// lib/planConfig.ts
import { Sparkles, Zap, Crown } from 'lucide-react';
import { PlanConfig, PlanName, FeatureName } from '@/types/subscription';

export const PLAN_FEATURES: Record<PlanName, PlanConfig> = {
  STARTER: {
    name: 'Starter',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    price: '₹299',
    scanLimit: '100 scans/month',
    alert: 'Email Only',
    maxLocations: 1,
    maxScans: 100,
    idealFor: ['Single Kirana Stores', 'Salons & Clinics', 'Local service businesses'],
    features: ['basic_analytics', 'email_alerts', '1_language'],
    featureList: [
      '1 business location',
      'Up to 3 Static QR Codes',
      'PDF Printout QR Standee',
      'Basic Counter Analytics',
      'English + 1 Local Language',
      'Email Alerts for 1-3 Star Reviews'
    ]
  },
  GROWTH: {
    name: 'Growth',
    icon: Zap,
    color: 'from-blue-500 to-indigo-500',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    price: '₹699',
    scanLimit: '350 scans/month',
    alert: 'Email Only',
    maxLocations: 3,
    maxScans: 350,
    idealFor: ['Busy Cafés', 'Fine Dining Restaurants', 'Growing Businesses'],
    features: ['basic_analytics', 'email_alerts', 'multi_language', 'sentiment_analysis', 'priority_support'],
    featureList: [
      'Up to 3 business locations',
      'Unlimited Static QR Codes',
      'Up to 20 Dynamic QR Codes',
      '1 High-Quality Acrylic Standee',
      'Multi-language Auto-Detect',
      'Monthly Insights & Sentiment Report',
      'Priority support'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    icon: Crown,
    color: 'from-purple-500 to-indigo-500',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    price: '₹1,499',
    scanLimit: '1,000 scans/month',
    alert: 'Email Only',
    maxLocations: Infinity,
    maxScans: 1000,
    idealFor: ['Multi-branch chains', 'Hospitals', 'Large organizations'],
    features: ['basic_analytics', 'email_alerts', 'multi_language', 'sentiment_analysis', 'priority_support', 'voice_to_text', 'api_access', 'team_management', 'live_chat'],
    featureList: [
      'Unlimited business locations',
      'Unlimited Dynamic & Static QR Codes',
      '3 Acrylic Standees Included',
      'All Local Languages + Voice-to-Text',
      'Real-Time Staff Leaderboard',
      'REST API Access & Webhooks',
      'Role-based Team Management',
      '24/7 Live Chat Support'
    ]
  },
  FREE: {
    name: 'Free',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-500',
    badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    price: '₹0',
    scanLimit: '10 scans/month',
    alert: 'None',
    maxLocations: 1,
    maxScans: 10,
    idealFor: ['Testing & Evaluation'],
    features: [],
    featureList: [
      '1 business location',
      '1 Static QR Code',
      'Basic Analytics',
      'English Only'
    ]
  }
};

export const PLAN_ORDER: PlanName[] = ['FREE', 'STARTER', 'GROWTH', 'ENTERPRISE'];

export const PLAN_NAMES: Record<string, PlanName> = {
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  ENTERPRISE: 'ENTERPRISE',
  FREE: 'FREE'
};

export const getPlanByName = (name: string): PlanConfig | undefined => {
  const upperName = name.toUpperCase() as PlanName;
  return PLAN_FEATURES[upperName];
};

export const getPlanByKey = (key: PlanName): PlanConfig => {
  return PLAN_FEATURES[key] || PLAN_FEATURES.FREE;
};

export const getPlanOrder = (): PlanName[] => {
  return PLAN_ORDER;
};