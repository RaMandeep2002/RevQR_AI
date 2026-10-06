import { NextResponse } from "next/server";
import { enforceWordLimit, sanitizeReviewText } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { adminClient } from "@/lib/supabase/admin";

// Complete map of Indian language codes to full names
const LANGUAGE_MAP: Record<string, string> = {
  // Indian Languages
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
  ur: "Urdu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  pa: "Punjabi",
  as: "Assamese",
  mai: "Maithili",
  sat: "Santali",
  ks: "Kashmiri",
  ne: "Nepali",
  sd: "Sindhi",
  kok: "Konkani",
  doi: "Dogri",
  mni: "Manipuri",
  bodo: "Bodo",
  sa: "Sanskrit",
  // Common languages for fallback
  fr: "French",
  de: "German",
  es: "Spanish",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  ru: "Russian",
  pt: "Portuguese",
  it: "Italian",
  ko: "Korean",
};

// Language-specific instructions for better AI output
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  hi: "Use Devanagari script. Write in natural, conversational Hindi.",
  bn: "Use Bengali script. Write in natural, conversational Bengali.",
  te: "Use Telugu script. Write in natural, conversational Telugu.",
  mr: "Use Devanagari script. Write in natural, conversational Marathi.",
  ta: "Use Tamil script. Write in natural, conversational Tamil.",
  ur: "Use Urdu script (Nastaliq). Write in natural, conversational Urdu.",
  gu: "Use Gujarati script. Write in natural, conversational Gujarati.",
  kn: "Use Kannada script. Write in natural, conversational Kannada.",
  ml: "Use Malayalam script. Write in natural, conversational Malayalam.",
  or: "Use Odia script. Write in natural, conversational Odia.",
  pa: "Use Gurmukhi script. Write in natural, conversational Punjabi.",
  as: "Use Assamese script. Write in natural, conversational Assamese.",
  mai: "Use Devanagari script. Write in natural, conversational Maithili.",
  sat: "Use Ol Chiki script. Write in natural, conversational Santali.",
  ks: "Use Devanagari or Perso-Arabic script. Write in natural, conversational Kashmiri.",
  ne: "Use Devanagari script. Write in natural, conversational Nepali.",
  sd: "Use Perso-Arabic script. Write in natural, conversational Sindhi.",
  kok: "Use Devanagari script. Write in natural, conversational Konkani.",
  doi: "Use Devanagari script. Write in natural, conversational Dogri.",
  mni: "Use Meitei script. Write in natural, conversational Manipuri.",
  bodo: "Use Devanagari script. Write in natural, conversational Bodo.",
  sa: "Use Devanagari script. Write in natural, conversational Sanskrit.",
};

// Cap personalization fields to avoid abuse
const MAX_PERSONALIZATION_LENGTH = 200;

/**
 * Safely trims and caps a personalization string.
 * Returns undefined if empty after trimming.
 */
function sanitizePersonalization(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_PERSONALIZATION_LENGTH);
}

/**
 * Safely trims a string. Returns undefined if empty.
 */
function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export async function POST(request: Request) {
  let requestBusinessId: string | undefined = undefined;
  try {
    console.log("=== GENERATE REVIEW API START ===");

    const {
      stars,
      businessName: rawBusinessName,
      category: rawCategory,
      businessId,
      language: userSelectedLanguage,
      // NEW: personalised touch fields
      enjoyedDishes: rawEnjoyedDishes,
      serviceComments: rawServiceComments,
    } = await request.json();

    requestBusinessId = businessId;

    // No generic placeholders — omit if missing
    const businessName = cleanString(rawBusinessName);
    const category = cleanString(rawCategory);

    const enjoyedDishes = sanitizePersonalization(rawEnjoyedDishes);
    const serviceComments = sanitizePersonalization(rawServiceComments);
    const hasPersonalization = Boolean(enjoyedDishes || serviceComments);

    console.log("Request payload:", {
      stars,
      businessName,
      category,
      businessId,
      userSelectedLanguage,
      hasPersonalization,
      enjoyedDishes: enjoyedDishes ? `${enjoyedDishes.substring(0, 60)}...` : undefined,
      serviceComments: serviceComments ? `${serviceComments.substring(0, 60)}...` : undefined,
    });

    const rating = Number(stars);

    if (![1, 2, 3, 4, 5].includes(rating)) {
      console.log("Validation failed - invalid rating:", rating);
      return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY environment variable");
      return NextResponse.json({
        error: "Missing GEMINI_API_KEY environment variable."
      }, { status: 500 });
    }

    // Get business settings directly from businesses table
    let businessSettings = {
      tone: "Professional",
      keywords: "",
      languages: ['en', 'hi'],
    };

    console.log("Fetching business settings for businessId:", businessId);

    if (businessId) {
      const { data: business, error } = await adminClient
        .from("businesses")
        .select("tone, keywords, languages")
        .eq("id", businessId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching business:", error);
      }

      if (business) {
        businessSettings.tone = business.tone || "Professional";
        businessSettings.keywords = business.keywords || "";
        businessSettings.languages = business.languages || ['en', 'hi'];
        console.log("Business settings fetched:", businessSettings);
      } else {
        console.log("No business found with ID:", businessId);
      }
    } else {
      console.log("No businessId provided, using default settings");
    }

    // Determine final language with priority:
    // 1. User selected language (from review page)
    // 2. Business's first language
    // 3. Default to English
    let finalLanguage = "English";
    let languageCode = "en";

    console.log("Determining language...");
    console.log("User selected language:", userSelectedLanguage);
    console.log("Business languages:", businessSettings.languages);

    if (userSelectedLanguage) {
      const mappedLanguage = LANGUAGE_MAP[userSelectedLanguage];
      if (mappedLanguage) {
        finalLanguage = mappedLanguage;
        languageCode = userSelectedLanguage;
        console.log(`User selected language "${userSelectedLanguage}" mapped to "${finalLanguage}"`);
      } else {
        console.log(`User selected language "${userSelectedLanguage}" not supported, falling back to business language or English`);
        const firstBusinessLang = businessSettings.languages[0] || "en";
        const mappedBusinessLang = LANGUAGE_MAP[firstBusinessLang];
        if (mappedBusinessLang) {
          finalLanguage = mappedBusinessLang;
          languageCode = firstBusinessLang;
          console.log(`Falling back to business language: "${finalLanguage}" (${languageCode})`);
        } else {
          finalLanguage = "English";
          languageCode = "en";
          console.log("Falling back to English");
        }
      }
    } else if (businessSettings.languages && businessSettings.languages.length > 0) {
      const firstLanguage = businessSettings.languages[0];
      const mappedLanguage = LANGUAGE_MAP[firstLanguage];
      if (mappedLanguage) {
        finalLanguage = mappedLanguage;
        languageCode = firstLanguage;
        console.log(`Using business's first language: "${finalLanguage}" (${languageCode})`);
      } else {
        console.log(`Business language "${firstLanguage}" not supported, falling back to English`);
        finalLanguage = "English";
        languageCode = "en";
      }
    } else {
      console.log("No language found, defaulting to English");
      finalLanguage = "English";
      languageCode = "en";
    }

    // Build language instruction for AI
    let languageInstruction = `IMPORTANT: Write the ENTIRE review in ${finalLanguage} language.`;

    const scriptInstruction = LANGUAGE_INSTRUCTIONS[languageCode];
    if (scriptInstruction) {
      languageInstruction += ` ${scriptInstruction}`;
    }

    if (languageCode !== "en") {
      languageInstruction += ` The response must be completely in ${finalLanguage}. Do NOT use English except for business names and technical terms.`;
    }

    console.log("Language instruction:", languageInstruction);

    // ===== Build business context lines (omit if missing) =====
    const businessContextLines: string[] = [];
    if (businessName) {
      businessContextLines.push(`Business Name: "${businessName}"`);
    }
    if (category) {
      businessContextLines.push(`Category: "${category}"`);
    }
    const businessContext = businessContextLines.join("\n    ");

    // ===== Build personalization block for the prompt =====
    let personalizationBlock = "";
    if (hasPersonalization) {
      personalizationBlock = `
    ===== CUSTOMER'S PERSONAL DETAILS (weave these in naturally) =====
    The customer has shared specific details about their experience. You MUST naturally incorporate these into the review to make it authentic and personal. Do NOT just list them — write them into the narrative.`;

      if (enjoyedDishes) {
        personalizationBlock += `
    - Dishes/Items they enjoyed: "${enjoyedDishes}"
      (Mention these specific items by name in at least one of the review options.)`;
      }

      if (serviceComments) {
        personalizationBlock += `
    - Comments on service: "${serviceComments}"
      (Reflect this sentiment in the review — whether positive or constructive.)`;
      }

      personalizationBlock += `
    ===== END CUSTOMER DETAILS =====
    `;
    } else {
      personalizationBlock = `
    ===== NO PERSONAL DETAILS PROVIDED =====
    The customer did not share specific details. Write natural, category-appropriate reviews.
    `;
    }

    const prompt = `Act as a customer writing a review for a business.
    ${businessContext ? businessContext + "\n    " : ""}Rating: ${rating} out of 5 stars (use this ONLY to set the overall tone — do NOT mention the star rating or number of stars in the review text).
    ${languageInstruction}
    Tone: ${businessSettings.tone}
    Keywords to naturally include if relevant: ${businessSettings.keywords || "none"}
    ${personalizationBlock}

    CRITICAL RULES:
    - Do NOT mention the star rating, number of stars, or phrases like "I'd give it X stars", "I'm rating this X stars", "four stars", "five stars", etc.
    - Do NOT include phrases like "I'd happily give it", "I would rate this", "my rating is", "stars" anywhere in the review.
    - The rating is submitted separately — just write a natural review that reflects the sentiment of a ${rating}-star experience.
    - Sound like a real customer sharing their experience, not a template.

    Generate 3 different review options that sound natural and are specific to this business category.  
    ${hasPersonalization ? "Each option must include at least one of the customer's personal details above." : ""}
    Keep each option under 50 words.
    Return them as a JSON array of strings: ["Review 1", "Review 2", "Review 3"].
    Output ONLY the JSON array.`;

    console.log("=== PROMPT SENT TO GEMINI ===");
    console.log("Full prompt:");
    console.log("----------------------------------------");
    console.log(prompt);
    console.log("----------------------------------------");
    console.log("Prompt details:");
    console.log("- Business Name:", businessName || "(not provided)");
    console.log("- Category:", category || "(not provided)");
    console.log("- Rating:", rating);
    console.log("- Language:", finalLanguage);
    console.log("- Language Code:", languageCode);
    console.log("- Tone:", businessSettings.tone);
    console.log("- Keywords:", businessSettings.keywords || "none");
    console.log("- Has personalization:", hasPersonalization);
    if (enjoyedDishes) console.log("- Enjoyed dishes:", enjoyedDishes);
    if (serviceComments) console.log("- Service comments:", serviceComments);
    console.log("=== END PROMPT ===");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("Calling Gemini API...");
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
        topP: 0.9
      }
    });

    const endTime = Date.now();
    console.log(`Gemini API response time: ${endTime - startTime}ms`);

    const usage = response.usageMetadata;
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    const totalTokens = usage?.totalTokenCount || 0;

    const pricing = calculateGeminiCost(inputTokens, outputTokens);

    console.log("=== GEMINI RESPONSE METADATA ===");
    console.log("Language used:", finalLanguage);
    console.log("Language Code:", languageCode);
    console.log("Input Tokens:", inputTokens);
    console.log("Output Tokens:", outputTokens);
    console.log("Total Tokens:", totalTokens);
    console.log("Estimated Cost USD:", pricing.totalCost);
    console.log("Cost breakdown:", {
      inputCost: pricing.inputCost,
      outputCost: pricing.outputCost,
      totalCost: pricing.totalCost
    });
    console.log("Tone used:", businessSettings.tone);
    console.log("Keywords used:", businessSettings.keywords);
    console.log("Personalization applied:", hasPersonalization);
    console.log("=== END METADATA ===");

    const rawText = response.text || "[]";
    console.log("Raw response from Gemini:", rawText.substring(0, 200) + (rawText.length > 200 ? "..." : ""));

    let options: string[] = [];
    try {
      options = JSON.parse(rawText);
      if (!Array.isArray(options)) {
        console.log("Response is not an array, wrapping in array");
        options = [rawText];
      }
      console.log(`Parsed ${options.length} review options`);
    } catch (error) {
      console.error("Failed to parse Gemini response as JSON:", error);
      options = [rawText];
    }

    const sanitizedOptions = options.map((opt, index) => {
      const sanitized = enforceWordLimit(sanitizeReviewText(opt), 150);
      console.log(`Option ${index + 1} (${opt.length} chars -> ${sanitized.length} chars after sanitization):`, sanitized.substring(0, 100) + "...");
      return sanitized;
    });

    console.log("=== GENERATE REVIEW API END ===");

    if (requestBusinessId) {
      console.log(`Incrementing successful generation stats for business: ${requestBusinessId}`);
      const { error: rpcError } = await adminClient.rpc("increment_generation_stats", {
        p_business_id: requestBusinessId,
        p_is_successful: true
      });
      if (rpcError) {
        console.error("Failed to increment generation stats:", rpcError);
      }
    }

    return NextResponse.json({
      options: sanitizedOptions,
      language: finalLanguage,
      languageCode: languageCode,
      tone: businessSettings.tone,
      keywords: businessSettings.keywords,
      personalizationApplied: hasPersonalization,
    });
  } catch (error: unknown) {
    console.error("Gemini Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error message:", errorMessage);
    
    if (requestBusinessId) {
      console.log(`Incrementing failed generation stats for business: ${requestBusinessId}`);
      await adminClient.rpc("increment_generation_stats", {
        p_business_id: requestBusinessId,
        p_is_successful: false
      });
    }

    return NextResponse.json(
      { error: `Failed to generate review: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function calculateGeminiCost(
  inputTokens: number,
  outputTokens: number
) {
  const INPUT_PRICE_PER_1M = 0.10; // $0.10 per 1M input tokens (Gemini 2.0 Flash)
  const OUTPUT_PRICE_PER_1M = 0.40; // $0.40 per 1M output tokens (Gemini 2.0 Flash)

  const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
}