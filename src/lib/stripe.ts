import Stripe from 'stripe'
import { PLATFORM_FEE_PERCENT } from './constants'

// Only initialize Stripe on server-side
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : null

// Helper to get stripe instance with type assertion (for server-side only)
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Missing STRIPE_SECRET_KEY.')
  }
  return stripe
}

export function calculateFees(price: number) {
  const platformFee = Math.round(price * PLATFORM_FEE_PERCENT / 100)
  const sellerAmount = price - platformFee
  return { platformFee, sellerAmount }
}

// Re-export constants for backward compatibility
export { PLATFORM_FEE_PERCENT, MIN_PRICE_USD } from './constants'
