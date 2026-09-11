import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { parseJson, subscriptionIsActive } from "@/lib/subscription-access";

export async function GET(_: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  
  const { data, error } = await adminClient
    .from("businesses")
    .select("id, name, category, google_business_url, location, languages, created_at, owner_id")
    .eq("id", businessId)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 404 }
    );
  }

  // Fetch the subscription of the owner
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("plan_name, current_usage, features")
    .eq("user_id", data.owner_id)
    .in("status", ["active", "free", "pending"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let limitExceeded = false;

  if (subscription && subscriptionIsActive(subscription)) {
    console.log("GET /businesses/[id] - Subscription found:", subscription);
    
    const features = parseJson<Record<string, unknown>>(subscription.features, {});
    console.log("GET /businesses/[id] - Parsed features:", features);
    
    const scanLimit = Number(features.reviewScanLimit || 0);
    console.log("GET /businesses/[id] - Initial scanLimit:", scanLimit);
    
    // For free or unset plan, use a default limit (e.g. 25)
    console.log("GET /businesses/[id] - Using subscription scanLimit:", scanLimit);

    const currentUsage = typeof subscription.current_usage === 'string' ? JSON.parse(subscription.current_usage) : subscription.current_usage;
    console.log("GET /businesses/[id] - Parsed currentUsage:", currentUsage);
    
    const scansUsed = currentUsage?.scansUsed || 0;
    console.log("GET /businesses/[id] - Parsed scansUsed:", scansUsed);

    if (scansUsed >= scanLimit) {
      limitExceeded = true;
      console.log("GET /businesses/[id] - limitExceeded set to true");
    } else {
      console.log("GET /businesses/[id] - limitExceeded remains false");
    }
  } else {
    console.log("GET /businesses/[id] - No subscription found");
  }

  // Transform the response to match frontend expectations
  const transformedData = {
    id: data.id,
    name: data.name,
    category: data.category,
    google_business_url: data.google_business_url,
    location: data.location,
    languages: data.languages || ['en', 'hi'],
    created_at: data.created_at,
    limitExceeded,
  };

  console.log("transformedData -----> ", transformedData)

  return NextResponse.json({ data: transformedData });
}
