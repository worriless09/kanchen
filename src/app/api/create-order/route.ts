// src/app/api/payment/create-order/route.ts

import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
})

export async function POST(req: Request) {
  try {
    const { amount, receipt, user_id, planId, email } = await req.json()

    // Validate required fields
    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'Amount and receipt are required' }, 
        { status: 400 }
      )
    }

    const options = {
      amount: Number(amount),
      currency: 'INR' as const,
      receipt: String(receipt),
      notes: {
        user_id: String(user_id || ''),
        plan_id: String(planId || ''),
        email: String(email || ''),
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID! // Frontend needs this
    })

  } catch (error) {
    console.error('Create order failed:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    )
  }
}
