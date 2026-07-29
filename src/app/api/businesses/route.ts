import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const validEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's subscription tier and business count
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("subscription_tier, business_count")
    .eq("id", user.id)
    .single();

  if (userError) {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }

  // Determine business limit based on subscription tier
  const tier = userData?.subscription_tier || "free";
  const limit = tier === "pro" ? 10 : tier === "enterprise" ? 50 : 2;
  const currentCount = userData?.business_count || 0;

  // Check if user has reached their limit
  if (currentCount >= limit) {
    return NextResponse.json(
      {
        error: `Business limit reached (${limit}/${limit}). Please upgrade your plan to add more businesses.`,
        code: "LIMIT_REACHED",
        limit,
        current: currentCount,
        tier,
        upgradeRequired: true
      },
      { status: 403 }
    );
  }

  // Validate request body
  const body = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const category = body.category?.trim();
  const googleBusinessUrl = body.googleBusinessUrl?.trim();
  const location = body.location?.trim();

  // Validation
  if (!name || !email || !category || !googleBusinessUrl || !location) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (!validEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format." },
      { status: 400 }
    );
  }

  if (!/^https?:\/\/.+/i.test(googleBusinessUrl)) {
    return NextResponse.json(
      { error: "Google Business URL must be a valid URL." },
      { status: 400 }
    );
  }

  // Check for duplicate business name (optional but recommended)
  const { data: existingBusiness, error: checkError } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("name", name)
    .maybeSingle();

  if (checkError) {
    // Log error but continue - don't fail the request
    console.error("Error checking for duplicate business:", checkError);
  }

  if (existingBusiness) {
    return NextResponse.json(
      { error: "A business with this name already exists." },
      { status: 409 }
    );
  }

  // Insert the new business
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      name,
      email,
      category,
      google_business_url: googleBusinessUrl,
      location,
      owner_id: user.id
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Update business count in users table (trigger should handle this automatically)
  // But we'll do it explicitly to be safe
  const { error: updateError } = await supabase
    .from("users")
    .update({ business_count: currentCount + 1 })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update business count:", updateError);
    // Don't fail the request, the trigger will fix it
  }

  return NextResponse.json(
    {
      data,
      message: "Business created successfully",
      remaining: limit - (currentCount + 1)
    },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const id = body.id?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const category = body.category?.trim();
  const googleBusinessUrl = body.googleBusinessUrl?.trim();
  const location = body.location?.trim();

  if (!id || !name || !email || !category || !googleBusinessUrl || !location) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!validEmail(email)) return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  if (!/^https?:\/\/.+/i.test(googleBusinessUrl)) {
    return NextResponse.json({ error: "Google Business URL must be a valid URL." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("businesses")
    .update({
      name,
      email,
      category,
      google_business_url: googleBusinessUrl,
      location
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
