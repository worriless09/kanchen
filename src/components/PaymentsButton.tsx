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
  close: () => void;
}

export default function PaymentsButton({ planName, planPrice, planId }: PaymentsButtonProps) {
  const [loading, setLoading] = useState(false);

  const createOrder = async (): Promise<OrderResponse> => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: planPrice * 100, // paise
        planId,
        receipt: `receipt_${Date.now()}`,
      }),
    });
    if (!response.ok) throw new Error('Failed to create order');
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
            const verifyResponse = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });
            if (verifyResponse.ok) {
              alert('Payment successful!');
              window.location.href = '/dashboard?payment=success';
            } else {
              alert('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            setLoading(false);
          },
        },
      };

      if (typeof window !== 'undefined' && typeof window.Razorpay === 'function') {
        // Use local interface and type assertion for Razorpay instance, avoiding any
        const razorpay = new (window.Razorpay as new (opt: RazorpayOptions) => RazorpayInstance)(options);
        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
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
