import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Platform fee percentage (20%)
export const PLATFORM_FEE_PERCENT = 20

export function calculateFees(price: number) {
  const platformFee = Math.round(price * PLATFORM_FEE_PERCENT / 100)
  const sellerAmount = price - platformFee
  return { platformFee, sellerAmount }
}
