import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionAccess, limitResponse } from "@/lib/subscription-access";

const validEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

// Tone options
const TONES = ["Professional", "Friendly", "Enthusiastic", "Formal", "Casual"] as const;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  console.log(user)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }); 
}

export async function POST(request: Request) {
  console.log("=== POST /businesses START ===");
  
  const { access, response } = await getSubscriptionAccess();
  console.log("Access object:", { 
    access: {
      isActive: access?.isActive,
      features: access?.features,
      user: access?.user
    }, 
    response: response ? "Has response" : "No response" 
  });
  
  if (response) {
    console.log("Early response from getSubscriptionAccess:", response);
    return response;
  }
  
  const supabase = await createClient();
  console.log("Supabase client created");
  
  const { data: existingBusinesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", access.user.id);
  console.log("Existing businesses count:", existingBusinesses?.length ?? 0);
  console.log("Existing businesses data:", existingBusinesses);
  
  const limited = limitResponse(access, "maxBusinesses", existingBusinesses?.length ?? 0);
  console.log("Limit response result:", limited ? "LIMITED - error will be returned" : "Not limited - proceeding");
  
  if (limited) {
    console.log("Returning limit error:", limited);
    return limited;
  }
  
  const {
    data: { user }
  } = await supabase.auth.getUser();
  console.log("User from auth:", user?.id);

  if (!user) {
    console.log("No user found - returning 401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate request body
  const body = await request.json();
  console.log("Request body:", body);
  
  const name = body.name?.trim();
  const category = body.category?.trim();
  const googleBusinessUrl = body.googleBusinessUrl?.trim();
  const location = body.location?.trim();
  const languages = body.languages || ['en', 'hi'];
  const tone = body.tone || 'Professional';
  const keywords = body.keywords?.trim() || '';
  const email = body.email?.trim() || user?.email;
  
  console.log("Parsed fields:", { name, category, googleBusinessUrl, location, languages, tone, keywords, email });

  // Validation - removed email validation
  if (!name || !category || !googleBusinessUrl || !location) {
    console.log("Validation failed - missing required fields");
    return NextResponse.json(
      { error: "All fields are required. Name, category, Google Business URL, and location are required." },
      { status: 400 }
    );
  }

  // Validate tone
  if (!TONES.includes(tone as any)) {
    console.log("Validation failed - invalid tone:", tone);
    return NextResponse.json(
      { error: `Invalid tone. Must be one of: ${TONES.join(', ')}` },
      { status: 400 }
    );
  }

  if (!/^https?:\/\/.+/i.test(googleBusinessUrl)) {
    console.log("Validation failed - invalid URL:", googleBusinessUrl);
    return NextResponse.json(
      { error: "Google Business URL must be a valid URL." },
      { status: 400 }
    );
  }

  // Validate languages
  if (!Array.isArray(languages) || languages.length === 0) {
    console.log("Validation failed - no languages provided");
    return NextResponse.json(
      { error: "At least one language must be selected." },
      { status: 400 }
    );
  }

  // Validate language codes
  const validLanguageCodes = [
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml',
    'or', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'sd', 'kok',
    'doi', 'mni', 'bodo', 'sa'
  ];
  const invalidLanguages = languages.filter(code => !validLanguageCodes.includes(code));
  if (invalidLanguages.length > 0) {
    console.log("Validation failed - invalid languages:", invalidLanguages);
    return NextResponse.json(
      {
        error: `Invalid language codes: ${invalidLanguages.join(', ')}. Please select from supported languages.`
      },
      { status: 400 }
    );
  }

  // Check for duplicate business name
  console.log("Checking for duplicate business with name:", name);
  const { data: existingBusiness, error: checkError } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("name", name)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking for duplicate business:", checkError);
  }

  if (existingBusiness) {
    console.log("Duplicate business found:", existingBusiness);
    return NextResponse.json(
      { error: "A business with this name already exists." },
      { status: 409 }
    );
  }

  // Insert the new business with languages, tone, and keywords
  console.log("Inserting new business with data:", {
    name,
    category,
    google_business_url: googleBusinessUrl,
    location,
    languages,
    tone,
    keywords,
    owner_id: user.id
  });
  
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      name,
      category,
      google_business_url: googleBusinessUrl,
      location,
      languages,
      tone,
      keywords,
      email,
      owner_id: user.id
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error inserting business:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  console.log("Business created successfully:", data);
  console.log("=== POST /businesses END ===");
  
  return NextResponse.json(
    {
      data,
      message: "Business created successfully",
    },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log("PATCH request body:", body);
  
  const id = body.id?.trim();
  const name = body.name?.trim();
  const category = body.category?.trim();
  const googleBusinessUrl = body.googleBusinessUrl?.trim();
  const location = body.location?.trim();
  const languages = body.languages;
  const tone = body.tone || 'Professional';
  const keywords = body.keywords?.trim() || '';

  // Validate required fields - removed email validation
  if (!id || !name || !category || !googleBusinessUrl || !location) {
    return NextResponse.json(
      { error: "All fields are required. Name, category, Google Business URL, and location are required." }, 
      { status: 400 }
    );
  }

  // Validate tone
  if (!TONES.includes(tone as any)) {
    return NextResponse.json(
      { error: `Invalid tone. Must be one of: ${TONES.join(', ')}` },
      { status: 400 }
    );
  }

  // Validate URL
  if (!/^https?:\/\/.+/i.test(googleBusinessUrl)) {
    return NextResponse.json(
      { error: "Google Business URL must be a valid URL." }, 
      { status: 400 }
    );
  }

  // Validate languages
  if (!languages || !Array.isArray(languages) || languages.length === 0) {
    return NextResponse.json(
      { error: "At least one language must be selected." }, 
      { status: 400 }
    );
  }

  // Validate language codes
  const validLanguageCodes = [
    'en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 
    'or', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'sd', 'kok', 
    'doi', 'mni', 'bodo', 'sa'
  ];
  
  const invalidLanguages = languages.filter(code => !validLanguageCodes.includes(code));
  if (invalidLanguages.length > 0) {
    return NextResponse.json(
      { 
        error: `Invalid language codes: ${invalidLanguages.join(', ')}. Please select from supported languages.` 
      },
      { status: 400 }
    );
  }

  // Build update object with all fields - removed email
  const updateData = {
    name,
    category,
    google_business_url: googleBusinessUrl,
    location,
    languages,
    tone,
    keywords,
  };

  console.log("Updating business with data:", updateData);

  // Update the business
  const { data, error } = await supabase
    .from("businesses")
    .update(updateData)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update business" }, 
      { status: 500 }
    );
  }

  // If no data returned, business not found or not owned by user
  if (!data) {
    return NextResponse.json(
      { error: "Business not found or you don't have permission to update it." }, 
      { status: 404 }
    );
  }

  console.log("Business updated successfully:", data);

  return NextResponse.json({ 
    data,
    message: "Business updated successfully",
  });
}