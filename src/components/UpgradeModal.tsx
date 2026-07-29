// components/UpgradeModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/lib/constants";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  businessCount: number;
  limit: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  businessCount,
  limit,
}: UpgradeModalProps) {
  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
    }
  };

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white dark:bg-slate-900">
        {/* Close Button */}
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:ring-offset-slate-950 dark:focus:ring-indigo-400 dark:data-[state=open]:bg-slate-800">
          <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="p-6 md:p-8">
          {/* Header */}
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-white">
              Upgrade Your Plan
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Choose the perfect plan for your business needs
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Usage */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Usage
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {businessCount} / {limit} businesses
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg shadow-indigo-500/20">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-800/50">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(businessCount / limit) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  {businessCount >= limit
                    ? "🚀 You've reached your business limit!"
                    : `📊 You can add ${limit - businessCount} more business${
                        limit - businessCount > 1 ? "es" : ""
                      }`}
                </p>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round((businessCount / limit) * 100)}% used
                </span>
              </div>
            </div>

            {/* Plan Options */}
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan = plan.tier === currentTier;
                const isPopular = plan.id === "pro";
                const isDisabled = isCurrentPlan;

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={!isDisabled ? { y: -4 } : {}}
                    className={`relative rounded-xl border-2 p-4 transition-all ${
                      isCurrentPlan
                        ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                        : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/50"
                    } ${isDisabled ? "opacity-75" : "cursor-pointer"}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-0.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                        <Zap className="inline h-3 w-3 mr-1" />
                        POPULAR
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/20">
                        ACTIVE
                      </div>
                    )}
                    <div className="mt-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          /mo
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {plan.businessLimit} businesses included
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                          >
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`mt-4 w-full ${
                          isCurrentPlan
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        } transition-all duration-300`}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "✓ Current Plan" : "Upgrade Now"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                🔒 All plans include a 14-day free trial. Cancel anytime.
                <br />
                <span className="text-[10px]">
                  No credit card required for free trial
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}