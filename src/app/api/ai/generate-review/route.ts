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

export async function POST(request: Request) {
  try {
    console.log("=== GENERATE REVIEW API START ===");
    
    const { 
      stars, 
      businessName, 
      category, 
      businessId, 
      language: userSelectedLanguage 
    } = await request.json();
    
    console.log("Request payload:", { stars, businessName, category, businessId, userSelectedLanguage });
    
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
      // Check if the language is supported
      const mappedLanguage = LANGUAGE_MAP[userSelectedLanguage];
      if (mappedLanguage) {
        finalLanguage = mappedLanguage;
        languageCode = userSelectedLanguage;
        console.log(`User selected language "${userSelectedLanguage}" mapped to "${finalLanguage}"`);
      } else {
        console.log(`User selected language "${userSelectedLanguage}" not supported, falling back to business language or English`);
        // Fallback to first business language or English
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
      // Use the first language from business settings
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
    
    // Add script-specific instruction if available
    const scriptInstruction = LANGUAGE_INSTRUCTIONS[languageCode];
    if (scriptInstruction) {
      languageInstruction += ` ${scriptInstruction}`;
    }
    
    // If writing in a non-English language, emphasize it more
    if (languageCode !== "en") {
      languageInstruction += ` The response must be completely in ${finalLanguage}. Do NOT use English except for business names and technical terms.`;
    }

    console.log("Language instruction:", languageInstruction);

    // Build the prompt with tone and keywords from business
    const prompt = `Act as a customer writing a review for a business.
    Business Name: "${businessName || "this establishment"}"
    Category: "${category || "Service"}"
    Rating: ${rating} out of 5 stars.
    ${languageInstruction}
    Tone: ${businessSettings.tone}
    Keywords to naturally include if relevant: ${businessSettings.keywords || "none"}

    Generate 3 different review options that sound natural and are specific to this business category.
    Keep each option under 50 words. 
    Return them as a JSON array of strings: ["Review 1", "Review 2", "Review 3"]. 
    Output ONLY the JSON array.`;

    console.log("=== PROMPT SENT TO GEMINI ===");
    console.log("Full prompt:");
    console.log("----------------------------------------");
    console.log(prompt);
    console.log("----------------------------------------");
    console.log("Prompt details:");
    console.log("- Business Name:", businessName || "this establishment");
    console.log("- Category:", category || "Service");
    console.log("- Rating:", rating);
    console.log("- Language:", finalLanguage);
    console.log("- Language Code:", languageCode);
    console.log("- Tone:", businessSettings.tone);
    console.log("- Keywords:", businessSettings.keywords || "none");
    console.log("=== END PROMPT ===");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("Calling Gemini API...");
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    // Cost calculation
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
    console.log("=== END METADATA ===");

    const rawText = response.text || "[]";
    console.log("Raw response from Gemini:", rawText.substring(0, 200) + (rawText.length > 200 ? "..." : ""));
    
    let options: string[] = [];
    try {
      options = JSON.parse(rawText);
      // Validate that we got an array
      if (!Array.isArray(options)) {
        console.log("Response is not an array, wrapping in array");
        options = [rawText];
      }
      console.log(`Parsed ${options.length} review options`);
    } catch (error) {
      console.error("Failed to parse Gemini response as JSON:", error);
      // Fallback if AI doesn't return valid JSON
      options = [rawText];
    }

    const sanitizedOptions = options.map((opt, index) => {
      const sanitized = enforceWordLimit(sanitizeReviewText(opt), 150);
      console.log(`Option ${index + 1} (${opt.length} chars -> ${sanitized.length} chars after sanitization):`, sanitized.substring(0, 100) + "...");
      return sanitized;
    });

    console.log("=== GENERATE REVIEW API END ===");

    return NextResponse.json({
      options: sanitizedOptions,
      language: finalLanguage,
      languageCode: languageCode,
      tone: businessSettings.tone,
      keywords: businessSettings.keywords,
    });
  } catch (error: unknown) {
    console.error("Gemini Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error message:", errorMessage);
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
  // Gemini 2.0 Flash pricing (updated)
  // Update anytime from official pricing page

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