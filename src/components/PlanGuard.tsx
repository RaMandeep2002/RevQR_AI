// components/PlanGuard.tsx
import React from 'react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { PlanName, FeatureName } from '@/types/subscription';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface PlanGuardProps {
  children: React.ReactNode;
  requiredPlan?: PlanName;
  requiredFeature?: FeatureName;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function PlanGuard({ 
  children, 
  requiredPlan, 
  requiredFeature,
  fallback,
  showUpgrade = true 
}: PlanGuardProps): React.ReactElement {
  const router = useRouter();
  const { currentPlan, loading, hasMinPlan, hasFeature, planData } = usePlanAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Check if user has required plan
  let hasAccess = true;
  let requirement = '';

  if (requiredPlan) {
    hasAccess = hasMinPlan(requiredPlan);
    requirement = requiredPlan;
  }

  if (requiredFeature && hasAccess) {
    hasAccess = hasFeature(requiredFeature);
    requirement = requiredFeature;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {requiredPlan ? `This feature requires ${planData?.name || 'higher'} plan` : 'Feature Locked'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {requiredPlan 
              ? `Upgrade to ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1).toLowerCase()} plan to access this feature.`
              : 'This feature is not available on your current plan. Please upgrade to access it.'}
          </p>
          {showUpgrade && (
            <Button 
              onClick={() => router.push('/dashboard/upgrade')}
              className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}