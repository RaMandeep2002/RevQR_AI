import { NextResponse } from "next/server";
import { enforceWordLimit, sanitizeReviewText } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
    try {
        const { businessName, category } = await request.json();

        // console.log(request.json());

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable." }, { status: 500 });
        }

        const insightPrompt = `Act as a business growth assistant generating a short actionable insight.

                    Business Name: "${businessName || "this business"}"
                    Category: "${category || "Service"}"

                    Generate 1 short business insight that:
                    - Sounds data-driven and premium
                    - Feels useful to the business owner
                    - Is under 25 words
                    - Mentions customer behavior, reviews, QR usage, ratings, upsells, or retention
                    - Avoid generic wording

                    Examples:
                    - "Customers mentioning friendly staff are 3x more likely to leave 5-star reviews."
                    - "Businesses displaying QR codes near billing counters see higher repeat engagement."
                    - "Reviews mentioning butter chicken increase restaurant discovery rates significantly."

                    Return ONLY the insight text.`;


        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: insightPrompt,
            config: {
                responseMimeType: "application/json",
                // temperature: 0.8,
                // maxOutputTokens: 120,
                // topP: 0.9
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
        console.log(rawText)

        return NextResponse.json({ rawText });
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
