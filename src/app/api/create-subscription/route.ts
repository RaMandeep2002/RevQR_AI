import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();
    let customerId;

    // Check for existing customer
    const { data: existingCustomer } = await supabase
      .from("subscriptions")
      .select("razorpay_customer_id")
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCustomer?.razorpay_customer_id) {
      customerId = existingCustomer.razorpay_customer_id;
      console.log("Using existing customer:", customerId);
    } else {
      // Create new customer in Razorpay
      try {
        const customer = await razorpay.customers.create({
          name: customerEmail.split('@')[0] || 'Customer',
          email: customerEmail,
          contact: '9999999999', // You should collect this from user
        });
        customerId = customer.id;
        console.log("Created new customer:", customerId);
        
        // Save customer ID to user's subscription record
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            razorpay_customer_id: customerId,
            plan_name: planName,
            status: 'pending',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
      } catch (customerError) {
        console.error("Error creating customer:", customerError);
        
        // Try to find existing customer by email
        try {
          const customers = await razorpay.customers.all({ 
            email: customerEmail 
          });
          
          // Fix: Check if customers.items exists and has items
          if (customers && customers.items && customers.items.length > 0) {
            customerId = customers.items[0].id;
            console.log("Found existing customer by email:", customerId);
          } else {
            throw new Error("No customer found with this email");
          }
        } catch (findError) {
          console.error("Error finding customer:", findError);
          throw new Error("Failed to create or find customer");
        }
      }
    }

    console.log("Creating subscription with planId:", planId);
    console.log("Customer ID:", customerId);

    // Create subscription with proper parameters
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: isYearly ? 12 : 1,
      quantity: 1,
      start_at: Math.floor(Date.now() / 1000) + 120, // 2 minutes buffer
      expire_by: Math.floor(Date.now() / 1000) + (isYearly ? 365 : 30) * 24 * 60 * 60,
      notes: {
        userId: userId,
        planName: planName,
        isYearly: isYearly ? 'true' : 'false',
        customerEmail: customerEmail
      }
    });

    console.log("Subscription created:", subscription.id);

   const getPlanFeatures = (planName: string, isYearly: boolean) => {
  const features = {
    reviewScanLimit: 25, // Default for FREE plan
    aiGenerationLimit: 2, // Default for FREE plan
    prioritySupport: false,
    maxBusinesses: 1,
    maxStaticQRCodes: 3,
    maxDynamicQRCodes: 0,
    qrCodes: 1, // Default for FREE plan
    acrylicStandees: 0,
    languages: 2, // English + 1 local language
    voiceToText: false,
    staffLeaderboard: false,
    restApiAccess: false,
    webhooks: false,
    teamManagement: false,
    liveChatSupport: false,
    monthlyReports: false,
    analytics: false,
    customDomain: false,
  };

  // Update features based on plan
  switch (planName) {
    case 'Starter':
      features.reviewScanLimit = isYearly ? 1200 : 100;
      features.aiGenerationLimit = isYearly ? 24 : 2;
      features.prioritySupport = false;
      features.maxBusinesses = 1;
      features.maxStaticQRCodes = 3;
      features.maxDynamicQRCodes = 0;
      features.qrCodes = 3;
      features.acrylicStandees = 0;
      features.languages = 2; // English + 1 local language
      features.voiceToText = false;
      features.staffLeaderboard = false;
      features.restApiAccess = false;
      features.webhooks = false;
      features.teamManagement = false;
      features.liveChatSupport = false;
      features.monthlyReports = false;
      features.analytics = true; // Basic Counter Analytics
      features.customDomain = false;
      break;

    case 'Growth':
      features.reviewScanLimit = isYearly ? 4200 : 350;
      features.aiGenerationLimit = isYearly ? 24 : 2;
      features.prioritySupport = true; // Priority support
      features.maxBusinesses = 3;
      features.maxStaticQRCodes = 999; // Unlimited
      features.maxDynamicQRCodes = 20;
      features.qrCodes = 999; // Unlimited
      features.acrylicStandees = 1;
      features.languages = 999; // Multi-language Auto-Detect
      features.voiceToText = false;
      features.staffLeaderboard = false;
      features.restApiAccess = false;
      features.webhooks = false;
      features.teamManagement = false;
      features.liveChatSupport = false;
      features.monthlyReports = true; // Monthly Insights & Sentiment Report
      features.analytics = true;
      features.customDomain = false;
      break;

    case 'Enterprise':
      features.reviewScanLimit = isYearly ? 12000 : 1000;
      features.aiGenerationLimit = isYearly ? 240 : 20;
      features.prioritySupport = true;
      features.maxBusinesses = 999; // Unlimited
      features.maxStaticQRCodes = 999; // Unlimited
      features.maxDynamicQRCodes = 999; // Unlimited
      features.qrCodes = 999; // Unlimited
      features.acrylicStandees = 3;
      features.languages = 999; // All Local Languages
      features.voiceToText = true; // Voice-to-Text
      features.staffLeaderboard = true; // Real-Time Staff Leaderboard
      features.restApiAccess = true; // REST API Access
      features.webhooks = true; // Webhooks
      features.teamManagement = true; // Role-based Team Management
      features.liveChatSupport = true; // 24/7 Live Chat Support
      features.monthlyReports = true;
      features.analytics = true;
      features.customDomain = false;
      break;

    case 'FREE':
    default:
      features.reviewScanLimit = 25;
      features.aiGenerationLimit = 2;
      features.prioritySupport = false;
      features.maxBusinesses = 1;
      features.maxStaticQRCodes = 1;
      features.maxDynamicQRCodes = 0;
      features.qrCodes = 1;
      features.acrylicStandees = 0;
      features.languages = 1;
      features.voiceToText = false;
      features.staffLeaderboard = false;
      features.restApiAccess = false;
      features.webhooks = false;
      features.teamManagement = false;
      features.liveChatSupport = false;
      features.monthlyReports = false;
      features.analytics = false;
      features.customDomain = false;
      break;
  }

  return features;
};
    const planFeatures = getPlanFeatures(planName, isYearly);

    // Save subscription to database
    const { error: dbError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        razorpay_customer_id: customerId,
        razorpay_subscription_id: subscription.id,
        plan_id: planId,
        plan_name: planName,
        status: 'active',
        amount: amount ? amount : null,
        interval: isYearly ? 'yearly' : 'monthly',
        current_period_start: subscription.start_at ? new Date(subscription.start_at * 1000).toISOString() : null,
        current_period_end: subscription.expire_by ? new Date(subscription.expire_by * 1000).toISOString() : null,
        // ✅ Initialize current_usage with proper structure
        current_usage: {
          scansUsed: 0,
          reviewsGenerated: 0,
          lastResetDate: new Date().toISOString()
        },
        // ✅ Set features with appropriate scan limit based on plan
        features: planFeatures,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'razorpay_subscription_id'
      });

     if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if DB save fails, just log it
      // The webhook will update the subscription status later
    }

    // Log success with subscription details
    console.log("Subscription saved successfully:", {
      userId,
      subscriptionId: subscription.id,
      plan: planName,
      features: planFeatures,
      current_usage: {
        scansUsed: 0,
        reviewsGenerated: 0
      }
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        customer_id: subscription.customer_id,
        start_at: subscription.start_at,
        expire_by: subscription.expire_by
      },
      // features: planFeatures
    });


  } catch (error: any) {
    console.error("Full error:", error);
    
    // Log the detailed error from Razorpay
    if (error.error) {
      console.error("Razorpay error details:", JSON.stringify(error.error, null, 2));
    }

    // Check for specific Razorpay error codes
    let errorMessage = "Something went wrong";
    let errorCode = 500;
    
    if (error.error) {
      switch (error.error.code) {
        case 'BAD_REQUEST_ERROR':
          errorMessage = error.error.description || "Invalid request to Razorpay";
          errorCode = 400;
          break;
        case 'AUTHENTICATION_ERROR':
          errorMessage = "Authentication failed with Razorpay";
          errorCode = 401;
          break;
        case 'NOT_FOUND_ERROR':
          errorMessage = "Plan not found. Please check the plan ID.";
          errorCode = 404;
          break;
        case 'RATE_LIMIT_ERROR':
          errorMessage = "Too many requests. Please try again later.";
          errorCode = 429;
          break;
        default:
          errorMessage = error.error.description || error.error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.error : undefined,
      },
      { status: errorCode }
    );
  }
}