// hooks/usePlanAccess.ts
import { useState, useEffect, useCallback } from 'react';
import { Subscription, PlanName, FeatureName, PlanConfig } from '@/types/subscription';
import { PLAN_FEATURES, PLAN_ORDER, getPlanByKey } from '@/lib/planConfig';

interface UsePlanAccessReturn {
  subscription: Subscription | null;
  currentPlan: PlanName;
  loading: boolean;
  error: string | null;
  planData: PlanConfig;
  hasPlan: (planName: PlanName) => boolean;
  hasMinPlan: (minPlan: PlanName) => boolean;
  hasFeature: (featureName: FeatureName) => boolean;
  getMaxLocations: () => number;
  getMaxScans: () => number;
  canAddBusiness: (currentBusinessCount: number) => boolean;
  getRemainingScans: (scansUsed?: number) => number;
  refetch: () => Promise<void>;
  isStarter: boolean;
  isGrowth: boolean;
  isEnterprise: boolean;
  isFree: boolean;
}

export function usePlanAccess(): UsePlanAccessReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanName>('FREE');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription');
      const data = await response.json();
      
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        const planName = data.subscription.plan_name?.toUpperCase() as PlanName;
        
        // Check if plan exists in PLAN_FEATURES
        if (planName && PLAN_FEATURES[planName]) {
          setCurrentPlan(planName);
        } else {
          setCurrentPlan('FREE');
        }
      } else {
        // No subscription found, default to FREE
        setCurrentPlan('FREE');
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setCurrentPlan('FREE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check if user has a specific plan
  const hasPlan = useCallback((planName: PlanName): boolean => {
    return currentPlan === planName;
  }, [currentPlan]);

  // Check if user has at least the minimum plan
  const hasMinPlan = useCallback((minPlan: PlanName): boolean => {
    const currentIndex = PLAN_ORDER.indexOf(currentPlan);
    const requiredIndex = PLAN_ORDER.indexOf(minPlan);
    return currentIndex >= requiredIndex;
  }, [currentPlan]);

  // Check if user has access to a specific feature
  const hasFeature = useCallback((featureName: FeatureName): boolean => {
    const features = (subscription?.features || {}) as Record<string, unknown>;
    const aliases: Record<FeatureName, string[]> = {
      basic_analytics: ['analytics'],
      email_alerts: ['alerts'],
      '1_language': ['languages'],
      multi_language: ['languages'],
      sentiment_analysis: ['monthlyReports'],
      priority_support: ['prioritySupport'],
      voice_to_text: ['voiceToText'],
      api_access: ['restApiAccess'],
      team_management: ['teamManagement'],
      live_chat: ['liveChatSupport'],
    };
    return (aliases[featureName] || [featureName]).some((name) => {
      const value = features[name];
      if (value === undefined || value === null || value === false || value === 0 || value === 'None') return false;
      if (name === 'languages' && typeof value === 'number') return value >= (featureName === 'multi_language' ? 3 : 1);
      return true;
    });
  }, [subscription]);

  // Get max locations for current plan
  const getMaxLocations = useCallback((): number => {
    const features = (subscription?.features || {}) as Record<string, unknown>;
    const value = features.locations ?? features.maxBusinesses;
    return typeof value === 'number' ? value : PLAN_FEATURES[currentPlan]?.maxLocations || 1;
  }, [currentPlan, subscription]);

  // Get max scans for current plan
  const getMaxScans = useCallback((): number => {
    const value = subscription?.features?.reviewScanLimit;
    return typeof value === 'number' ? value : PLAN_FEATURES[currentPlan]?.maxScans || 10;
  }, [currentPlan, subscription]);

  // Check if user can add more businesses
  const canAddBusiness = useCallback((currentBusinessCount: number): boolean => {
    const maxLocations = getMaxLocations();
    return currentBusinessCount < maxLocations;
  }, [getMaxLocations]);

  // Get remaining scans
  const getRemainingScans = useCallback((scansUsed: number = 0): number => {
    const maxScans = getMaxScans();
    return Math.max(0, maxScans - scansUsed);
  }, [getMaxScans]);

  const planData = getPlanByKey(currentPlan);

  return {
    subscription,
    currentPlan,
    loading,
    error,
    planData,
    hasPlan,
    hasMinPlan,
    hasFeature,
    getMaxLocations,
    getMaxScans,
    canAddBusiness,
    getRemainingScans,
    refetch: fetchSubscription,
    isStarter: currentPlan === 'STARTER',
    isGrowth: currentPlan === 'GROWTH',
    isEnterprise: currentPlan === 'ENTERPRISE',
    isFree: currentPlan === 'FREE'
  };
}
