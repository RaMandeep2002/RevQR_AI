import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LANGUAGES = ["English", "Hindi", "Hinglish"];
const TONES = ["Professional", "Friendly", "Enthusiastic"];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("prompt_settings")
    .select("keywords,language,tone,bill_items")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: data ?? {
      keywords: "",
      language: "English",
      tone: "Professional",
      bill_items: ""
    }
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const keywords = String(body.keywords ?? "").trim();
  const language = String(body.language ?? "English").trim();
  const tone = String(body.tone ?? "Professional").trim();
  const billItems = String(body.billItems ?? "").trim();

  if (!LANGUAGES.includes(language)) return NextResponse.json({ error: "Invalid language." }, { status: 400 });
  if (!TONES.includes(tone)) return NextResponse.json({ error: "Invalid tone." }, { status: 400 });

  const { data, error } = await supabase
    .from("prompt_settings")
    .upsert(
      {
        owner_id: user.id,
        keywords,
        language,
        tone,
        bill_items: billItems,
        updated_at: new Date().toISOString()
      },
      { onConflict: "owner_id" }
    )
    .select("keywords,language,tone,bill_items")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
