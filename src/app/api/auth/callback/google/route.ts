import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    
    // Generate magic link token
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
    })
    
    if (linkError || !linkData) {
      console.error('Link generation failed:', linkError)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=session_failed`)
    }
    
    // Extract token from magic link
    const magicLinkUrl = new URL(linkData.properties.action_link)
    const token = magicLinkUrl.searchParams.get('token')
    const type = magicLinkUrl.searchParams.get('type') as 'magiclink'
    
    if (!token) {
      console.error('No token in magic link')
      return NextResponse.redirect(`${baseUrl}/auth/login?error=no_token`)
    }
    
    // Create a Supabase client that can set cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Verify the OTP token to establish session (this sets cookies automatically)
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'magiclink',
    })
    
    if (verifyError || !sessionData.session) {
      console.error('Session verification failed:', verifyError)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=verify_failed`)
    }
    
    // Create response with redirect
    const response = NextResponse.redirect(`${baseUrl}${redirectTo}`)
    
    // Manually set the session cookies on the response as well
    // This ensures they're sent with the redirect
    const { access_token, refresh_token } = sessionData.session
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    
    // Set Supabase auth cookies
    response.cookies.set('sb-access-token', access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge,
    })
    
    response.cookies.set('sb-refresh-token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge,
    })
    
    // Also set the combined auth token cookie that Supabase SSR expects
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)/)?.[1]
    if (projectRef) {
      const cookieName = `sb-${projectRef}-auth-token`
      const cookieValue = JSON.stringify({
        access_token,
        refresh_token,
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in,
        token_type: 'bearer',
        user: sessionData.session.user,
      })
      
      response.cookies.set(cookieName, cookieValue, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge,
      })
    }
    
    return response
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/login?error=unknown`)
  }
}
