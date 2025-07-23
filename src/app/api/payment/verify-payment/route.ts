import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId // Now we'll actually use this
    } = body

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

    // Save payment details to database using planId
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        plan_id: planId, // Using planId here
        amount: payment.amount,
        currency: payment.currency,
        status: 'success',
        created_at: new Date().toISOString(),
      })

    if (paymentError) {
      console.error('Database error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to save payment' },
        { status: 500 }
      )
    }

    // Update user subscription based on planId
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        plan_id: planId, // Using planId here
        status: 'active',
        started_at: new Date().toISOString(),
        payment_id: razorpay_payment_id
      })

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      planId: planId // Return planId in response
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
