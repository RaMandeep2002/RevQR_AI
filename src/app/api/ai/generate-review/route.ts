import { NextResponse } from "next/server";
import { enforceWordLimit, sanitizeReviewText } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { stars } = await request.json();
    const rating = Number(stars);
    if (![1, 2, 3, 4, 5].includes(rating)) {
      return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable." }, { status: 500 });
    }

    const prompt = `Generate 3 different customer review options for a business based on this star rating: ${rating} stars. 
    Keep each option under 150 words. 
    Return them as a JSON array of strings: ["Review 1", "Review 2", "Review 3"]. 
    Output ONLY the JSON array.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

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
