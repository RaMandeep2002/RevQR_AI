// components/UpgradeButton.tsx
'use client';
import Script from 'next/script';

interface UpgradeButtonProps {
  userId: string;
  planId: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function UpgradeButton({ userId, planId }: UpgradeButtonProps) {
  const handleUpgrade = async (): Promise<void> => {
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, planId }),
      });

      if (!res.ok) {
        throw new Error('Failed to create subscription');
      }

      const { subscriptionId } = await res.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'Your App',
        description: 'Pro Plan Subscription',
        handler: function (response: RazorpayResponse): void {
          // payment success — but DON'T trust this alone, webhook confirms it
          window.location.href = '/dashboard?success=true';
        },
        theme: { color: '#000000' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Upgrade error:', error);
      // Handle error appropriately (show toast, redirect, etc.)
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
        onClick={handleUpgrade}
        className="your-button-styles" // Add your button styles here
      >
        Upgrade to Pro
      </button>
    </>
  );
}