// components/ProtectedRoute.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { useSubscription, SubscriptionFeatures } from "@/hooks/useSubscription";
import { Loader2, Lock, ArrowRight } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredFeatures?: Array<keyof SubscriptionFeatures | string>;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredFeatures = [],
  redirectTo = "/dashboard/upgrade",
}: ProtectedRouteProps) {
  const { subscription, loading, checkFeatureAccess } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  // Check if user has access to all required features
  const hasAccess = requiredFeatures.every((feature) =>
    checkFeatureAccess(feature as string),
  );
  console.log(hasAccess);
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 m-4 shadow-sm">
        <div className="p-4 mb-4 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Feature Locked
        </h2>
        <p className="max-w-md mb-6 text-slate-500 dark:text-slate-400">
          This feature is not available on your current plan. Upgrade your
          subscription to unlock this and many other advanced capabilities!
        </p>
        <Link
          href={redirectTo}
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
        >
          View Plans & Upgrade
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
