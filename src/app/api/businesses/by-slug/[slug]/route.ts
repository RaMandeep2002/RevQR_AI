import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/**
 * GET /api/businesses/by-slug/:slug
 * Resolves a URL slug to a business record owned by the authenticated user.
 * Returns { data: { id, name, slug, ... } } or 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all businesses for this user and find the one whose slug matches.
  // We do this in app-code rather than a DB column so no migration is required.
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const match = (businesses ?? []).find(
    (b) => slugify(b.name) === slug
  );

  if (!match) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { ...match, slug } });
}
