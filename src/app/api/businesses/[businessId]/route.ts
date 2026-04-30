import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const { data, error } = await adminClient
    .from("businesses")
    .select("id,name,category,google_business_url")
    .eq("id", businessId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}
