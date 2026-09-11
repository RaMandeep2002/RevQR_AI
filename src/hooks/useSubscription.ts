// hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SubscriptionFeatures {
  reviewScanLimit?: number;
  languages?: string[] | number | string;
  alerts?: string;
  qrStandee?: string;
  analytics?: string | boolean;
  locations?: number;
  qrCodes?: string;
  maxBusinesses?: number;
  
  // Legacy fields
  aiGenerationLimit?: number;
  prioritySupport?: boolean;
  maxStaticQRCodes?: number;
  maxDynamicQRCodes?: number;
  acrylicStandees?: number;
  voiceToText?: boolean;
  staffLeaderboard?: boolean;
  restApiAccess?: boolean;
  webhooks?: boolean;
  teamManagement?: boolean;
  liveChatSupport?: boolean;
  monthlyReports?: boolean;
  customDomain?: boolean;
  
  [key: string]: any;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  features: SubscriptionFeatures;
  current_period_end: string;
  interval: string;
  current_usage: {
    scansUsed: number;
    lastResetDate: string;
  };
  remaining_scans: number;
  is_active: boolean;
  is_expired: boolean;
  scan_limit: number;
  scans_used: number;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      const data = await response.json();

      if (data.success) {
        if (data.subscription) {
          setSubscription(data.subscription);
        } else if (data.plan) {
          // Normalize free plan to Subscription format
          setSubscription({
            id: 'free',
            user_id: '',
            plan_name: data.plan.name,
            status: data.plan.status,
            features: data.plan.features,
            current_period_end: '',
            interval: 'month',
            current_usage: { scansUsed: 0, lastResetDate: new Date().toISOString() },
            remaining_scans: data.plan.features?.reviewScanLimit || 0,
            is_active: true,
            is_expired: false,
            scan_limit: data.plan.features?.reviewScanLimit || 0,
            scans_used: 0
          } as Subscription);
        } else {
          setSubscription(null);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch subscription');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = (featureName: string): boolean => {
    if (!subscription) return false;
    const features = subscription.features;
    if (!features) return false;
    
    const value = features[featureName];
    
    // Check if the value implies "no access"
    if (value === undefined || value === null || value === false || value === 0 || value === 'None') {
      return false;
    }
    
    return true;
  };

  const checkRouteAccess = (path: string): boolean => {
    if (!subscription) return false;
    
    // Public routes
    const publicRoutes = [
      '/dashboard',
      '/dashboard/profile',
      '/dashboard/settings',
      '/dashboard/reviews',
      '/dashboard/qr-codes',
    ];

    if (publicRoutes.some(route => path.startsWith(route))) {
      return true;
    }

    // Premium routes
    const routeRequirements: Record<string, string[]> = {
      '/dashboard/analytics': ['analytics'],
      '/dashboard/reports': ['monthlyReports'],
      '/dashboard/team': ['teamManagement'],
      '/dashboard/staff-leaderboard': ['staffLeaderboard'],
      '/dashboard/webhooks': ['webhooks'],
      '/dashboard/api': ['restApiAccess'],
      '/dashboard/settings/custom-domain': ['customDomain'],
    };

    for (const [route, requirements] of Object.entries(routeRequirements)) {
      if (path.startsWith(route)) {
        return requirements.some(req => checkFeatureAccess(req));
      }
    }

    // Check QR code specific routes
    if (path.startsWith('/dashboard/qr-codes/dynamic')) {
      return checkFeatureAccess('maxDynamicQRCodes');
    }

    if (path.startsWith('/dashboard/businesses')) {
      return checkFeatureAccess('maxBusinesses');
    }

    return true; // Default allow
  };

  const redirectIfNoAccess = (path: string) => {
    if (!checkRouteAccess(path)) {
      router.push('/dashboard/upgrade?restricted=true');
    }
  };

  return {
    subscription,
    loading,
    error,
    checkFeatureAccess,
    checkRouteAccess,
    redirectIfNoAccess,
    refresh: fetchSubscription,
  };
}