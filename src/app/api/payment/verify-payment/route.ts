import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
})
// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if variables exist
if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnon);


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json(
        { error: 'Missing required payment parameters' },
        { status: 400 }
      )
    }

    // Verify the payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not captured' },
        { status: 400 }
      )
    }

    // Save payment details to database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        plan_id: planId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'success',
        created_at: new Date().toISOString(),
        user_id: userId ?? null, // Adjust based on your app’s auth
      })

    if (paymentError) {
      console.error('Database error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to save payment' },
        { status: 500 }
      )
    }

    // Update user subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId ?? null,
          plan_id: planId,
          status: 'active',
          started_at: new Date().toISOString(),
          payment_id: razorpay_payment_id,
        },
        { onConflict: 'user_id' } // Replace with your actual unique constraint(s)
      )

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError)
      // Consider responding with error, but here we continue
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription updated',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
