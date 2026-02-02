import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/'

  // Get the correct origin from headers (nginx sets these)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'xmemory.work'
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const origin = `${proto}://${host}`

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
