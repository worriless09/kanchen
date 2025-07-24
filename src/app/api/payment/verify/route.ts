import { NextResponse } from 'next/server'
import { createServerSupabase } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { trackUserConversion } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType,
      amount 
    } = await request.json()

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabase({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate subscription end date
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + (planType === 'annual' ? 12 : 1))

    // Update user subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_type: planType,
        status: 'active',
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        razorpay_payment_id,
        razorpay_order_id,
        amount_paid: amount
      })

    if (subscriptionError) {
      console.error('Subscription update failed:', subscriptionError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Track conversion
    trackUserConversion(planType)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
