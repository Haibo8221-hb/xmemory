import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint receives parsed email data from Cloudflare Email Worker
// Expected payload: { from, subject, text, html, attachments: [{filename, content, contentType}] }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
)

// Simple auth token for email worker
const EMAIL_UPLOAD_SECRET = process.env.EMAIL_UPLOAD_SECRET || 'xmemory-email-upload-2026'

interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  contentType: string
}

interface EmailPayload {
  from: string
  subject: string
  text: string
  html?: string
  attachments?: EmailAttachment[]
}

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${EMAIL_UPLOAD_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: EmailPayload = await request.json()
    const { from, subject, text, attachments } = payload

    if (!from) {
      return NextResponse.json({ error: 'Missing sender email' }, { status: 400 })
    }

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', from.toLowerCase())
      .single()

    // If user not found, try to find by auth email
    let userId = profile?.id
    if (!userId) {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const user = authUsers?.users?.find(u => u.email?.toLowerCase() === from.toLowerCase())
      userId = user?.id
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'User not found', 
        message: `No account found for ${from}. Please register first at xmemory.work` 
      }, { status: 404 })
    }

    // Determine content from attachments or email body
    let content = ''
    let filename = 'email-upload.txt'
    let contentType: 'memory' | 'skill' | 'profile' = 'memory'

    if (attachments && attachments.length > 0) {
      // Use first attachment
      const attachment = attachments[0]
      content = Buffer.from(attachment.content, 'base64').toString('utf-8')
      filename = attachment.filename

      // Detect content type from filename
      if (filename.endsWith('.skill') || filename.toLowerCase().includes('skill')) {
        contentType = 'skill'
      } else if (filename.toLowerCase().includes('profile') || filename.toLowerCase().includes('persona')) {
        contentType = 'profile'
      }
    } else if (text) {
      // Use email body as content
      content = text
    }

    if (!content) {
      return NextResponse.json({ error: 'No content found in email' }, { status: 400 })
    }

    // Generate title from subject or filename
    const title = subject || filename.replace(/\.[^/.]+$/, '') || 'Email Upload'

    // Detect platform from content
    let platform: 'chatgpt' | 'claude' | 'gemini' = 'chatgpt'
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('claude')) platform = 'claude'
    else if (lowerContent.includes('gemini')) platform = 'gemini'

    // Upload file to storage
    const filePath = `${userId}/${Date.now()}-${filename}`
    const fileBlob = new Blob([content], { type: 'text/plain' })
    
    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, fileBlob)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to store file' }, { status: 500 })
    }

    // Create memory record
    const previewLength = Math.min(500, content.length)
    const preview = content.slice(0, previewLength) + (content.length > previewLength ? '...' : '')

    const { data: memory, error: insertError } = await supabase
      .from('memories')
      .insert({
        seller_id: userId,
        title,
        description: `Uploaded via email from ${from}`,
        file_path: filePath,
        preview_content: preview,
        platform,
        content_type: contentType,
        status: 'draft', // Start as draft so user can review
        price: 0,
        tags: ['email-upload'],
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Content uploaded successfully',
      memory: {
        id: memory.id,
        title: memory.title,
        contentType,
        status: 'draft',
      }
    })

  } catch (error) {
    console.error('Email upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
