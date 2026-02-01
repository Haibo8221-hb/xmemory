import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, calculateFees } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const { memoryId } = await request.json()
    if (!memoryId) {
      return NextResponse.json({ error: '缺少Memory ID' }, { status: 400 })
    }
    
    // Get memory details
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .select('*, seller:profiles(*)')
      .eq('id', memoryId)
      .eq('status', 'active')
      .single()
    
    if (memoryError || !memory) {
      return NextResponse.json({ error: 'Memory不存在' }, { status: 404 })
    }
    
    // Can't buy your own memory
    if (memory.seller_id === user.id) {
      return NextResponse.json({ error: '不能购买自己的Memory' }, { status: 400 })
    }
    
    // Check if already purchased
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('memory_id', memoryId)
      .eq('status', 'completed')
      .single()
    
    if (existingOrder) {
      return NextResponse.json({ error: '您已购买过此Memory' }, { status: 400 })
    }
    
    // Handle free memory
    if (memory.price === 0) {
      const { platformFee, sellerAmount } = calculateFees(0)
      
      // Create completed order directly
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          memory_id: memoryId,
          amount: 0,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          status: 'completed',
        })
      
      if (orderError) {
        console.error('Order error:', orderError)
        return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
      }
      
      // Increment download count
      await supabase.rpc('increment_download_count', { memory_id: memoryId })
      
      return NextResponse.json({ free: true, memoryId })
    }
    
    // Calculate fees
    const { platformFee, sellerAmount } = calculateFees(memory.price)
    
    // Create pending order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        memory_id: memoryId,
        amount: memory.price,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        status: 'pending',
      })
      .select()
      .single()
    
    if (orderError || !order) {
      console.error('Order error:', orderError)
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
    }
    
    // Create Stripe checkout session
    // Convert price from dollars to cents for Stripe
    const priceInCents = Math.round(memory.price * 100)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: memory.title,
              description: `AI Memory - ${memory.platform}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/memory/${memoryId}`,
      metadata: {
        orderId: order.id,
        memoryId: memoryId,
        buyerId: user.id,
      },
    })
    
    // Update order with stripe session id
    await supabase
      .from('orders')
      .update({ stripe_payment_id: session.id })
      .eq('id', order.id)
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: '支付创建失败' }, { status: 500 })
  }
}
