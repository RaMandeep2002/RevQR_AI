import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: businesses, error: bErr } = await supabase.from("businesses").select("id,name").eq("owner_id", user.id);
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  if (!businesses?.length) return NextResponse.json({ data: [] });
  const businessIds = businesses.map((b) => b.id);

  const { data: reviews, error: rErr } = await adminClient.from("reviews").select("business_id,stars").in("business_id", businessIds);
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const data = businesses.map((b) => {
    const list = reviews?.filter((r) => r.business_id === b.id) || [];
    const count = list.length;
    const avg = count ? (list.reduce((sum, item) => sum + item.stars, 0) / count).toFixed(2) : "0.00";
    return { business_id: b.id, business_name: b.name, review_count: count, average_rating: Number(avg) };
  });

  return NextResponse.json({ data });
}
