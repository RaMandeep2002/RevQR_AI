import { NextResponse } from "next/server";
import { enforceWordLimit, sanitizeReviewText } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { stars, businessName, category, businessId } = await request.json();
    const rating = Number(stars);

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable." }, { status: 500 });
    }

    let settings = {
      keywords: "",
      language: "English",
      tone: "Professional",
      bill_items: ""
    };

    if (businessId) {
      const { data: business } = await adminClient.from("businesses").select("owner_id").eq("id", businessId).maybeSingle();
      if (business?.owner_id) {
        const { data: ownerSettings } = await adminClient
          .from("prompt_settings")
          .select("keywords,language,tone,bill_items")
          .eq("owner_id", business.owner_id)
          .maybeSingle();
        if (ownerSettings) settings = ownerSettings;
      }
    }

    // const prompt = `Act as a customer writing a review for a business.
    // Business Name: "${businessName || "this establishment"}"
    // Category: "${category || "Service"}"
    // Rating: ${rating} out of 5 stars.
    // Language: ${settings.language}
    // Tone: ${settings.tone}
    // Keywords to naturally include if relevant: ${settings.keywords || "none"}
    // Bill items/context to reference if relevant: ${settings.bill_items || "none"}

    // Generate 3 different review options that sound natural and are specific to this business category.
    // Keep each option under 50 words. 
    // Return them as a JSON array of strings: ["Review 1", "Review 2", "Review 3"]. 
    // Output ONLY the JSON array.`;
    const prompt = `Act as a customer writing a review for a business.
    Business Name: "${businessName || "this establishment"}"
    Category: "${category || "Service"}"
    Rating: ${rating} out of 5 stars.
    Language: Punglish
    Tone: ${settings.tone}
    Keywords to naturally include if relevant: ${settings.keywords || "none"}
    Bill items/context to reference if relevant: ${settings.bill_items || "none"}

    Generate 3 different review options that sound natural and are specific to this business category.
    Keep each option under 50 words. 
    Return them as a JSON array of strings: ["Review 1", "Review 2", "Review 3"]. 
    Output ONLY the JSON array.`;


    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
        //  maxOutputTokens: 120,
        topP: 0.9
      }
    });

    const usage = response.usageMetadata; const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    const totalTokens = usage?.totalTokenCount || 0;
    // Cost calculation
    const pricing = calculateGeminiCost(inputTokens, outputTokens);
    console.log("Input Tokens:", inputTokens);
    console.log("Output Tokens:", outputTokens);
    console.log("Total Tokens:", totalTokens);
    console.log("Estimated Cost USD:", pricing.totalCost);
    console.log({ inputCost: pricing.inputCost, outputCost: pricing.outputCost, totalCost: pricing.totalCost });

    const rawText = response.text || "[]";
    let options: string[] = [];
    try {
      options = JSON.parse(rawText);
    } catch {
      // Fallback if AI doesn't return valid JSON
      options = [rawText];
    }

    const sanitizedOptions = options.map(opt => enforceWordLimit(sanitizeReviewText(opt), 150));
    return NextResponse.json({ options: sanitizedOptions });
  } catch (error: unknown) {
    console.error("Gemini Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: `Failed to generate review: ${errorMessage}` }, { status: 500 });
  }
}


function calculateGeminiCost(
  inputTokens: number,
  outputTokens: number
) {
  // Gemini 2.5 Flash pricing
  // Update anytime from official pricing page

  const INPUT_PRICE_PER_1M = 0.35; // $0.35 per 1M input tokens
  const OUTPUT_PRICE_PER_1M = 1.05; // $1.05 per 1M output tokens

  const inputCost = (inputTokens / 1_000_000) * INPUT_PRICE_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
}
