// components/FeatureGate.tsx
import React from 'react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { PlanName, FeatureName } from '@/types/subscription';

interface FeatureGateProps {
  children: React.ReactNode;
  feature?: FeatureName;
  requiredPlan?: PlanName;
  fallback?: React.ReactNode | null;
}

export function FeatureGate({ 
  children, 
  feature,
  fallback = null,
  requiredPlan
}: FeatureGateProps): React.ReactElement | null {
  const { hasFeature, hasMinPlan, loading } = usePlanAccess();

  if (loading) {
    return null;
  }

  let hasAccess = true;

  if (requiredPlan) {
    hasAccess = hasMinPlan(requiredPlan);
  }

  if (hasAccess && feature) {
    hasAccess = hasFeature(feature);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}