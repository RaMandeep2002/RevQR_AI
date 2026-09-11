    // components/PlanBadge.tsx
import React from 'react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { PLAN_FEATURES } from '@/lib/planConfig';
import { LucideIcon } from 'lucide-react';

interface PlanBadgeProps {
  showIcon?: boolean;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

export function PlanBadge({ 
  showIcon = true, 
  showLabel = true,
  variant = 'default',
  className = ''
}: PlanBadgeProps): React.ReactElement {
  const { currentPlan, planData, loading } = usePlanAccess();

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}>
        Loading...
      </span>
    );
  }

  const planConfig = PLAN_FEATURES[currentPlan];
  const Icon = planConfig?.icon as LucideIcon | undefined;
  const colorClass = planConfig?.badgeColor || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${colorClass} px-2 py-0.5 text-xs font-medium ${className}`}>
        {showIcon && Icon && <Icon className="h-3 w-3" />}
        {showLabel && planConfig?.name}
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full ${colorClass} px-3 py-1.5 text-sm font-medium ${className}`}>
        {showIcon && Icon && <Icon className="h-4 w-4" />}
        <span>{planConfig?.name} Plan</span>
        <span className="text-xs opacity-75">{planConfig?.maxScans} scans/month</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${colorClass} px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {showIcon && Icon && <Icon className="h-3.5 w-3.5" />}
      {showLabel && planConfig?.name}
    </span>
  );
}