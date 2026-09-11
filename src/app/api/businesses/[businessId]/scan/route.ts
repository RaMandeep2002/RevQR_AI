import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { parseJson, subscriptionIsActive } from "@/lib/subscription-access";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  console.log("=== SCAN RECORDING STARTED ===");
  console.log("Business ID:", businessId);

  try {
    const { data, error } = await adminClient
      .from("businesses")
      .select("owner_id")
      .eq("id", businessId)
      .single();

    console.log("Business Fetch Result:", { data, error });

    if (error || !data) {
      console.log("Error: Business not found");
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }


    const { data: subscription, error: subError } = await adminClient
      .from("subscriptions")
      .select("id, status, current_period_end, current_usage, features")
      .eq("user_id", data.owner_id)
      .in("status", ["active", "free", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("Subscription Fetch Result:", { subscription, subError });

    if (subscription && subscriptionIsActive(subscription)) {
      const features = parseJson<Record<string, unknown>>(subscription.features, {});
      
      console.log("Parsed Features:", features);
      
      const scanLimit = Number(features.reviewScanLimit || 0);

      const currentUsage =
        typeof subscription.current_usage === "string"
          ? JSON.parse(subscription.current_usage)
          : subscription.current_usage;
      
      const scansUsed = currentUsage?.scansUsed || 0;

      console.log("Scan Stats:", { scansUsed, scanLimit });

      if (scansUsed < scanLimit) {
        const newUsage = { ...currentUsage, scansUsed: scansUsed + 1 };
        console.log("Updating Subscription Usage:", newUsage);
        
        const { error: updateError } = await adminClient
          .from("subscriptions")
          .update({ current_usage: newUsage })
          .eq("id", subscription.id);
          
        if (updateError) {
          console.error("Failed to update usage:", updateError);
        } else {
          console.log("Usage updated successfully!");
        }
      } else {
        console.log("Scan limit reached, not incrementing.");
        return NextResponse.json({ error: "Review scan limit reached", code: "LIMIT_REACHED" }, { status: 403 });
      }
    } else {
      console.log("No active subscription found for user:", data.owner_id);
      return NextResponse.json({ error: "An active subscription is required", code: "FEATURE_RESTRICTED" }, { status: 403 });
    }

    console.log("=== SCAN RECORDING FINISHED ===");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exception during scan recording:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
