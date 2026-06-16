import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 6), 1), 20);

  const { data: business, error: businessError } = await adminClient
    .from("businesses")
    .select("id,name,category,location")
    .eq("id", businessId)
    .single();

  if (businessError) {
    return NextResponse.json(
      { error: "Business not found." },
      { status: 404, headers: corsHeaders },
    );
  }

  const { data: reviews, error: reviewError } = await adminClient
    .from("reviews")
    .select("id,customer_name,stars,review_text,created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reviewError) {
    return NextResponse.json(
      { error: reviewError.message },
      { status: 500, headers: corsHeaders },
    );
  }

  return NextResponse.json(
    {
      data: {
        business,
        reviews: reviews || [],
        widget: {
          source: "QReview",
          businessId,
          limit,
        },
      },
    },
    { headers: corsHeaders },
  );
}
