'use client';

import { useState } from 'react';

interface PaymentsButtonProps {
  planName: string;
  planPrice: number;
  planId: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

// Extend Window interface to include Razorpay with proper typing
declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

export default function PaymentsButton({ planName, planPrice, planId }: PaymentsButtonProps) {
  const [loading, setLoading] = useState(false);

  const createOrder = async (): Promise<OrderResponse> => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: planPrice * 100, // Convert to paise
        planId: planId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json() as Promise<OrderResponse>;
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const orderData = await createOrder();

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kanchen Academy',
        description: `${planName} Subscription`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: planId,
              }),
            });

            if (verifyResponse.ok) {
              alert('Payment successful!');
              // Redirect to success page or update UI
              window.location.href = '/dashboard?payment=success';
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            setLoading(false);
          },
        },
      };

      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      {loading ? 'Processing...' : `Subscribe to ${planName} - ₹${planPrice}`}
    </button>
  );
}
