import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, calculateFees, MIN_PRICE_USD } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth (optional - not required for purchase)
    const { data: { user } } = await supabase.auth.getUser()
    
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
    
    // Can't buy your own memory (only check if logged in)
    if (user && memory.seller_id === user.id) {
      return NextResponse.json({ error: '不能购买自己的Memory' }, { status: 400 })
    }
    
    // Check if already purchased (only if logged in)
    if (user) {
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
    }
    
    // Check minimum price for paid items (Stripe requires at least $0.50)
    if (memory.price > 0 && memory.price < MIN_PRICE_USD) {
      return NextResponse.json({ 
        error: `价格必须至少 $${MIN_PRICE_USD.toFixed(2)} 或免费` 
      }, { status: 400 })
    }
    
    // Handle free memory - no login required, direct download
    if (memory.price === 0) {
      // Increment download count
      await supabase.rpc('increment_download_count', { memory_id: memoryId })
      
      // If logged in, record the order
      if (user) {
        // Ensure profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            username: user.email?.split('@')[0] || null,
          })
        }
        
        await supabase.from('orders').insert({
          buyer_id: user.id,
          memory_id: memoryId,
          amount: 0,
          platform_fee: 0,
          seller_amount: 0,
          status: 'completed',
        })
      }
      
      // Return file path for direct download
      return NextResponse.json({ 
        free: true, 
        memoryId,
        filePath: memory.file_path 
      })
    }
    
    // Paid items - create Stripe checkout (no login required)
    const { platformFee, sellerAmount } = calculateFees(memory.price)
    const priceInCents = Math.round(memory.price * 100)
    
    // Create Stripe checkout session
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
        memoryId: memoryId,
        buyerId: user?.id || 'guest',
        amount: memory.price.toString(),
        platformFee: platformFee.toString(),
        sellerAmount: sellerAmount.toString(),
      },
    })
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ 
      error: '支付创建失败', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 })
  }
}
