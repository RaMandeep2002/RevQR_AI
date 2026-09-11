// app/api/user/subscription/route.js
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // Get the current user from the session
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Subscription fetch error:", subscriptionError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to fetch subscription",
          error: subscriptionError.message 
        },
        { status: 500 }
      );
    }

    // If no subscription found, return free plan
    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        plan: {
          name: "Free",
          status: "free",
          features: {
            reviewScanLimit: 10,
            maxBusinesses: 1,
            maxStaticQRCodes: 1,
            maxDynamicQRCodes: 0,
            monthlyReports: false,
            languages: ["English"],
            alerts: "None",
            qrStandee: "None",
            analytics: "Basic",
            locations: 1,
            qrCodes: "1 Static"
          }
        }
      });
    }

    // Parse features if it's a string
    let features = subscription.features;
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        features = null;
      }
    }

    // Parse current_usage if it's a string
    let currentUsage = subscription.current_usage;
    if (typeof currentUsage === 'string') {
      try {
        currentUsage = JSON.parse(currentUsage);
      } catch (e) {
        currentUsage = { scansUsed: 0, lastResetDate: null };
      }
    }

    // Calculate remaining scans
    const scanLimit = features?.reviewScanLimit || 0;
    const scansUsed = currentUsage?.scansUsed || 0;
    const remainingScans = Math.max(0, scanLimit - scansUsed);

    // Check if subscription is active
    const isActive = subscription.status === 'active';
    const isExpired = subscription.status === 'expired' || 
                     (subscription.current_period_end && new Date(subscription.current_period_end) < new Date());

    console.log({
        ...subscription,
        features,
        current_usage: currentUsage,
        remaining_scans: remainingScans,
        is_active: isActive && !isExpired,
        is_expired: isExpired,
        scan_limit: scanLimit,
        scans_used: scansUsed
      })
    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        features,
        current_usage: currentUsage,
        remaining_scans: remainingScans,
        is_active: isActive && !isExpired,
        is_expired: isExpired,
        scan_limit: scanLimit,
        scans_used: scansUsed
      }
    });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
