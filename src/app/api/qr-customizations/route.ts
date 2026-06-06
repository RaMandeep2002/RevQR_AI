import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULTS = {
  dark_color: "#111827",
  light_color: "#ffffff",
  salt_value: "v1",
  template_id: "classic",
  logo_data_url: "",
  logo_size_percent: 22,
  logo_shape: "rounded"
};

const isHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId")?.trim();
  if (!businessId) return NextResponse.json({ error: "businessId is required." }, { status: 400 });

  const { data: business } = await supabase.from("businesses").select("id").eq("id", businessId).eq("owner_id", user.id).maybeSingle();
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("qr_customizations")
    .select("business_id,dark_color,light_color,salt_value,template_id,logo_data_url,logo_size_percent,logo_shape")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data ?? { business_id: businessId, ...DEFAULTS } });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const businessId = String(body.businessId || "").trim();
  const darkColor = String(body.darkColor || DEFAULTS.dark_color).trim();
  const lightColor = String(body.lightColor || DEFAULTS.light_color).trim();
  const saltValue = String(body.saltValue || DEFAULTS.salt_value).trim();
  const templateId = String(body.templateId || DEFAULTS.template_id).trim();
  const logoDataUrl = String(body.logoDataUrl || "").trim();
  const logoSizePercent = Number(body.logoSizePercent ?? DEFAULTS.logo_size_percent);
  const logoShape = String(body.logoShape || DEFAULTS.logo_shape).trim();

  if (!businessId) return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  if (!isHexColor(darkColor) || !isHexColor(lightColor)) return NextResponse.json({ error: "Colors must be valid hex values." }, { status: 400 });
  if (!saltValue) return NextResponse.json({ error: "Salt value is required." }, { status: 400 });
  if (!(logoSizePercent >= 10 && logoSizePercent <= 35)) return NextResponse.json({ error: "Logo size must be between 10 and 35." }, { status: 400 });
  if (!["square", "rounded", "circle"].includes(logoShape)) return NextResponse.json({ error: "Invalid logo shape." }, { status: 400 });

  const { data: business } = await supabase.from("businesses").select("id").eq("id", businessId).eq("owner_id", user.id).maybeSingle();
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("qr_customizations")
    .upsert(
      {
        business_id: businessId,
        dark_color: darkColor,
        light_color: lightColor,
        salt_value: saltValue,
        template_id: templateId,
        logo_data_url: logoDataUrl || null,
        logo_size_percent: logoSizePercent,
        logo_shape: logoShape,
        updated_at: new Date().toISOString()
      },
      { onConflict: "business_id" }
    )
    .select("business_id,dark_color,light_color,salt_value,template_id,logo_data_url,logo_size_percent,logo_shape")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
