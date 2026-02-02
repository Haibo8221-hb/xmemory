import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`

// Admin client to manage users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Parse redirect URL from state
  let redirectTo = '/dashboard'
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      redirectTo = stateData.redirectTo || '/dashboard'
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  if (error) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`)
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=token_exchange_failed`)
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    
    if (!userResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=user_info_failed`)
    }
    
    const googleUser = await userResponse.json()
    
    // Check if user exists in Supabase
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === googleUser.email)
    
    let userId: string
    
    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
        user_metadata: {
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: 'google',
        },
      })
      
      if (createError || !newUser.user) {
        console.error('User creation failed:', createError)
        return NextResponse.redirect(`${baseUrl}/auth/login?error=user_creation_failed`)
      }
      
      userId = newUser.user.id
    }
    
    // Generate a session link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
      options: {
        redirectTo: `${baseUrl}${redirectTo}`,
      },
    })
    
    if (linkError || !linkData) {
      console.error('Link generation failed:', linkError)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=session_failed`)
    }
    
    // Extract token from magic link and redirect
    const magicLinkUrl = new URL(linkData.properties.action_link)
    const token = magicLinkUrl.searchParams.get('token')
    const type = magicLinkUrl.searchParams.get('type')
    
    // Redirect to Supabase auth callback to establish session
    const callbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${encodeURIComponent(baseUrl + redirectTo)}`
    
    return NextResponse.redirect(callbackUrl)
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/login?error=unknown`)
  }
}
