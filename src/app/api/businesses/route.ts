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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim();
  const category = body.category?.trim();
  const googleBusinessUrl = body.googleBusinessUrl?.trim();
  const location = body.location?.trim();

  if (!name || !email || !category || !googleBusinessUrl || !location) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!validEmail(email)) return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  if (!/^https?:\/\/.+/i.test(googleBusinessUrl)) {
    return NextResponse.json({ error: "Google Business URL must be a valid URL." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({ name, email, category, google_business_url: googleBusinessUrl, location, owner_id: user.id })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
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
