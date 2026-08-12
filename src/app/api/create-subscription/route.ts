import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const {
      planId,
      planName,
      customerEmail,
      userId,
      isYearly,
      amount,
      interval,
    } = body;

    if (!planId || !customerEmail || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    console.log("Creating subscription with planId:", planId);

    // Create subscription with proper parameters
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: isYearly ? 12 : 1, // Fix: 12 for yearly, 1 for monthly
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId,
        email: customerEmail,
        planName,
        amount: amount?.toString(),
        interval,
        yearly: isYearly ? "true" : "false",
      },
    });

    console.log("Subscription created:", subscription.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        // amount: subscription.amount,
        planId:planId,
        status: subscription.status,
      },
    });
  } catch (error: any) {
    console.error("Full error:", error);
    
    // Log the detailed error from Razorpay
    if (error.error) {
      console.error("Razorpay error details:", error.error);
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.error?.description || 
                 error?.error?.message ||
                 error.message || 
                 "Something went wrong",
        details: error?.error || null,
      },
      { status: 500 }
    );
  }
}