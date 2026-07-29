import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULTS = {
  dark_color: "#111827",
  light_color: "#ffffff",
  dark_color_dark_mode: "#e5e7eb",
  light_color_dark_mode: "#1f2937",
  salt_value: "v1",
  template_id: "classic",
  template_id_dark_mode: "classic-dark",
  dot_style: "dots",
  logo_data_url: "",
  logo_size_percent: 22,
  logo_shape: "rounded"
};

const isHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);
const isValidDotStyle = (value: string) => ["square", "rounded", "dots", "classy"].includes(value);
const isValidLogoShape = (value: string) => ["square", "rounded", "circle"].includes(value);

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId")?.trim();
  const all = searchParams.get("all") === "true";

  if (all) {
    const { data: businesses, error: busErr } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id);
      
    if (busErr) return NextResponse.json({ error: busErr.message }, { status: 500 });
    
    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ data: [] });
    }
    
    const businessIds = businesses.map(b => b.id);
    
    const { data, error } = await supabase
      .from("qr_customizations")
      .select(`
        business_id,
        dark_color,
        light_color,
        dark_color_dark_mode,
        light_color_dark_mode,
        salt_value,
        template_id,
        template_id_dark_mode,
        dot_style,
        logo_data_url,
        logo_size_percent,
        logo_shape
      `)
      .in("business_id", businessIds);
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] });
  }

  if (!businessId) return NextResponse.json({ error: "businessId is required." }, { status: 400 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();
  
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("qr_customizations")
    .select(`
      business_id,
      dark_color,
      light_color,
      dark_color_dark_mode,
      light_color_dark_mode,
      salt_value,
      template_id,
      template_id_dark_mode,
      dot_style,
      logo_data_url,
      logo_size_percent,
      logo_shape
    `)
    .eq("business_id", businessId)
    .maybeSingle();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ 
    data: data ?? { 
      business_id: businessId, 
      ...DEFAULTS 
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
  
  // Light mode colors
  const darkColor = String(body.darkColor || DEFAULTS.dark_color).trim();
  const lightColor = String(body.lightColor || DEFAULTS.light_color).trim();
  
  // Dark mode colors
  const darkColorDarkMode = String(body.darkColorDarkMode || DEFAULTS.dark_color_dark_mode).trim();
  const lightColorDarkMode = String(body.lightColorDarkMode || DEFAULTS.light_color_dark_mode).trim();
  
  const saltValue = String(body.saltValue || DEFAULTS.salt_value).trim();
  const templateId = String(body.templateId || DEFAULTS.template_id).trim();
  const templateIdDarkMode = String(body.templateIdDarkMode || DEFAULTS.template_id_dark_mode).trim();
  const dotStyle = String(body.dotStyle || DEFAULTS.dot_style).trim();
  const logoDataUrl = String(body.logoDataUrl || "").trim();
  const logoSizePercent = Number(body.logoSizePercent ?? DEFAULTS.logo_size_percent);
  const logoShape = String(body.logoShape || DEFAULTS.logo_shape).trim();
  
  // Get businessId - support both camelCase and snake_case
  const businessId = String(body.businessId || body.business_id || "").trim();

  // Validation
  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  // Validate light mode colors
  if (!isHexColor(darkColor) || !isHexColor(lightColor)) {
    return NextResponse.json({ 
      error: "Light mode colors must be valid hex values." 
    }, { status: 400 });
  }

  // Validate dark mode colors
  if (!isHexColor(darkColorDarkMode) || !isHexColor(lightColorDarkMode)) {
    return NextResponse.json({ 
      error: "Dark mode colors must be valid hex values." 
    }, { status: 400 });
  }

  if (!saltValue) {
    return NextResponse.json({ error: "Salt value is required." }, { status: 400 });
  }

  if (!isValidDotStyle(dotStyle)) {
    return NextResponse.json({ 
      error: "Invalid dot style. Must be: square, rounded, dots, or classy." 
    }, { status: 400 });
  }

  if (!(logoSizePercent >= 10 && logoSizePercent <= 35)) {
    return NextResponse.json({ 
      error: "Logo size must be between 10 and 35." 
    }, { status: 400 });
  }

  if (!isValidLogoShape(logoShape)) {
    return NextResponse.json({ 
      error: "Invalid logo shape. Must be: square, rounded, or circle." 
    }, { status: 400 });
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();
  
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  // Upsert customization
  const { data, error } = await supabase
    .from("qr_customizations")
    .upsert(
      {
        business_id: businessId,
        dark_color: darkColor,
        light_color: lightColor,
        dark_color_dark_mode: darkColorDarkMode,
        light_color_dark_mode: lightColorDarkMode,
        salt_value: saltValue,
        template_id: templateId,
        template_id_dark_mode: templateIdDarkMode,
        dot_style: dotStyle,
        logo_data_url: logoDataUrl || null,
        logo_size_percent: logoSizePercent,
        logo_shape: logoShape,
        updated_at: new Date().toISOString()
      },
      { onConflict: "business_id" }
    )
    .select(`
      business_id,
      dark_color,
      light_color,
      dark_color_dark_mode,
      light_color_dark_mode,
      salt_value,
      template_id,
      template_id_dark_mode,
      dot_style,
      logo_data_url,
      logo_size_percent,
      logo_shape
    `)
    .single();

  if (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// Optional: DELETE endpoint if needed
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId")?.trim();
  
  if (!businessId) {
    return NextResponse.json({ error: "businessId is required." }, { status: 400 });
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();
  
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("qr_customizations")
    .delete()
    .eq("business_id", businessId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}