import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true });
}
