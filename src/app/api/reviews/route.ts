import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sanitizeReviewText, wordCount } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ownerBusinesses } = await supabase.from("businesses").select("id").eq("owner_id", user.id);
  const businessIds = ownerBusinesses?.map((b) => b.id) || [];

  if (!businessIds.length) return NextResponse.json({ data: [] });
  const { data, error } = await adminClient
    .from("reviews")
    .select("id,business_id,stars,review_text,created_at,businesses(name)")
    .in("business_id", businessIds)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const businessId = body.businessId?.trim();
  const stars = Number(body.stars);
  const reviewText = sanitizeReviewText(String(body.reviewText || ""));

  if (!businessId || ![1, 2, 3, 4, 5].includes(stars)) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  if (!reviewText) return NextResponse.json({ error: "Review cannot be empty." }, { status: 400 });
  if (wordCount(reviewText) > 150) return NextResponse.json({ error: "Review must be 150 words or less." }, { status: 400 });

  const { data, error } = await adminClient.from("reviews").insert({ business_id: businessId, stars, review_text: reviewText }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
