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
    .select("id,business_id,customer_name,customer_email,stars,review_text,created_at,generation_count,is_successful,businesses(name)")
    .in("business_id", businessIds)
    .order("created_at", { ascending: false });
    console.log({data})
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  //  console.log(data);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const reviewId = body.reviewId?.trim();
  const businessId = body.businessId?.trim();
  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail?.trim();
  const stars = Number(body.stars);
  const reviewText = sanitizeReviewText(String(body.reviewText || ""));
  const generationCount = typeof body.generationCount === 'number' ? body.generationCount : 0;
  const isSuccessful = body.isSuccessful === true;
  
  const validEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  if (!businessId || ![1, 2, 3, 4, 5].includes(stars)) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  if (!customerName) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
  
  if (isSuccessful) {
    if (!reviewText) return NextResponse.json({ error: "Review cannot be empty." }, { status: 400 });
    if (wordCount(reviewText) > 150) return NextResponse.json({ error: "Review must be 150 words or less." }, { status: 400 });
  }

  const payload = { 
    business_id: businessId, 
    customer_name: customerName, 
    customer_email: customerEmail, 
    stars, 
    review_text: reviewText,
    generation_count: generationCount,
    is_successful: isSuccessful
  };

  let query = adminClient.from("reviews");
  
  let response;
  if (reviewId) {
    response = await query.update(payload).eq('id', reviewId).select("*").single();
  } else {
    response = await query.insert(payload).select("*").single();
  }

  const { data, error } = response;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  console.log(data);
  return NextResponse.json({ data }, { status: 201 });
}
