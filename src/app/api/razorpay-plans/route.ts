import { razorpay } from "@/lib/razorpay";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const plans = await razorpay.plans.all();

        // Filter out the GROWTHENTERPRISE plan
        const filteredPlans = {
            ...plans,
            items: plans.items.filter(item => item.item.name !== "GROWTHENTERPRISE"),
            count: plans.items.filter(item => item.item.name !== "GROWTHENTERPRISE").length
        };

        return NextResponse.json({
            success: true,
            plans: filteredPlans
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            error: 'Unable to connect to Razorpay'
        },
            { status: 500 })
    }
}