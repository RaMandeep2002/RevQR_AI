import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();

    console.log(user);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const businessId = url.searchParams.get("businessId");

    // Get user's businesses
    const { data: businesses, error: bErr } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_id", user.id);

    if (bErr) {
        return NextResponse.json({ error: bErr.message }, { status: 500 });
    }

    if (!businesses?.length) {
        return NextResponse.json({ data: [] });
    }

    // Filter businesses if specific ID is provided
    let businessIds = businesses.map((b) => b.id);
    if (businessId) {
        businessIds = businessIds.filter(id => id === businessId);
        if (!businessIds.length) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }
    }

    // Fetch reviews and compute stats for all matched businesses
    const { data: reviews, error: rErr } = await adminClient
        .from("reviews")
        .select("business_id, stars")
        .in("business_id", businessIds);

    console.log(reviews);

    if (rErr) {
        return NextResponse.json({ error: rErr.message }, { status: 500 });
    }

    const stats = businesses
        .filter(b => businessIds.includes(b.id))
        .map((b) => {
            const list = reviews?.filter((r) => r.business_id === b.id) || [];
            const count = list.length;
            const avg = count
                ? (list.reduce((sum, item) => sum + item.stars, 0) / count).toFixed(2)
                : "0.00";
            const positive_reviews = list.filter((r) => r.stars >= 4).length;
            const negative_reviews = list.filter((r) => r.stars <= 2).length;
            return {
                business_id: b.id,
                business_name: b.name,
                review_count: count,
                average_rating: Number(avg),
                positive_reviews,
                negative_reviews,
            };
        });
    console.log("stats", stats)

    return NextResponse.json({ data: stats });
}