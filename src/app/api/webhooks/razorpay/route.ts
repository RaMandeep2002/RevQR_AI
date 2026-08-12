// app/api/webhooks/razorpay/route.ts
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase client configuration
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only, bypasses RLS
);

// Type definitions
interface RazorpaySubscriptionEntity {
  id: string;
  current_end: number;
  notes?: {
    supabase_user_id?: string;
  };
  // Add other subscription properties as needed
}

interface RazorpayPayload {
  subscription?: {
    entity: RazorpaySubscriptionEntity;
  };
}

interface RazorpayWebhookEvent {
  event: string;
  payload: RazorpayPayload;
}

interface SubscriptionRecord {
  user_id: string | undefined;
  razorpay_subscription_id: string;
  status: 'active' | 'past_due' | 'cancelled';
  plan: 'pro' | 'free';
  current_end: Date;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const event: RazorpayWebhookEvent = JSON.parse(body);
    const sub = event.payload.subscription?.entity;

    if (!sub) {
      return new NextResponse('ok', { status: 200 });
    }

    const userId = sub.notes?.supabase_user_id;

    if (!userId) {
      console.error('User ID not found in subscription notes');
      return new NextResponse('User ID missing', { status: 400 });
    }

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscriptionData: SubscriptionRecord = {
          user_id: userId,
          razorpay_subscription_id: sub.id,
          status: 'active',
          plan: 'pro', // map plan_id -> your internal plan name
          current_end: new Date(sub.current_end * 1000),
        };

        await supabaseAdmin
          .from('subscriptions')
          .upsert(subscriptionData, { 
            onConflict: 'user_id' 
          });
        break;
      }

      case 'subscription.halted':
      case 'subscription.pending': {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('razorpay_subscription_id', sub.id);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed': {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', plan: 'free' })
          .eq('razorpay_subscription_id', sub.id);
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.event}`);
        // You might want to log this for monitoring
        break;
      }
    }

    return new NextResponse('ok', { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}