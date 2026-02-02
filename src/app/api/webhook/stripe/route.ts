import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }
  
  let event: Stripe.Event
  
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      const orderId = session.metadata?.orderId
      const memoryId = session.metadata?.memoryId
      
      if (!orderId || !memoryId) {
        console.error('Missing metadata in session')
        break
      }
      
      // Update order status
      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('id', orderId)
      
      if (orderError) {
        console.error('Failed to update order:', orderError)
        break
      }
      
      // Increment download count
      await supabaseAdmin.rpc('increment_download_count', { memory_id: memoryId })
      
      console.log(`Order ${orderId} completed`)
      break
    }
    
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      
      if (orderId) {
        // Delete pending order
        await supabaseAdmin
          .from('orders')
          .delete()
          .eq('id', orderId)
          .eq('status', 'pending')
      }
      break
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  return NextResponse.json({ received: true })
}
