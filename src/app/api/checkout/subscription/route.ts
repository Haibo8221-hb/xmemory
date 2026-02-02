import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const { annual } = await request.json()
    
    // Price IDs from Stripe Dashboard
    // You need to create these products/prices in Stripe first
    const priceId = annual 
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID 
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID
    
    if (!priceId) {
      return NextResponse.json({ 
        error: 'Stripe price not configured. Please set STRIPE_PRO_MONTHLY_PRICE_ID and STRIPE_PRO_ANNUAL_PRICE_ID in environment variables.' 
      }, { status: 500 })
    }
    
    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (existingSub) {
      return NextResponse.json({ error: '您已经是 Pro 用户' }, { status: 400 })
    }
    
    // Create Stripe checkout session for subscription
    const session = await getStripe().checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: 'pro',
        billing: annual ? 'annual' : 'monthly',
      },
    })
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Subscription checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ 
      error: '创建订阅失败', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 })
  }
}
