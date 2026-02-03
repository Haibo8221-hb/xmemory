import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Email Upload API
 * 
 * Receives parsed email data from Cloudflare Email Worker.
 * 
 * User identification (priority order):
 * 1. userId from subaddress (upload+userId@xmemory.work)
 * 2. from email matching user's registered email
 * 
 * Payload: {
 *   from: string,
 *   to: string,
 *   userId?: string,      // From subaddress
 *   subject: string,
 *   text: string,
 *   html?: string,
 *   attachments?: Array<{filename, content (base64), contentType}>
 * }
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMAIL_UPLOAD_SECRET = process.env.EMAIL_UPLOAD_SECRET || 'xmemory-email-upload-2026'

interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  contentType: string
}

interface EmailPayload {
  from: string
  to?: string
  userId?: string // From subaddress
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
    const { from, to, userId: subaddressUserId, subject, text, html, attachments } = payload

    if (!from) {
      return NextResponse.json({ error: 'Missing sender email' }, { status: 400 })
    }

    // Identify user
    let userId: string | null = null
    let identificationMethod = ''

    // Method 1: Direct userId from subaddress
    if (subaddressUserId) {
      // Validate this is a real user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', subaddressUserId)
        .single()

      if (profile) {
        userId = profile.id
        identificationMethod = 'subaddress'
      }
    }

    // Method 2: Match by sender email in profiles table
    if (!userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', from.toLowerCase())
        .single()

      if (profile) {
        userId = profile.id
        identificationMethod = 'profile_email'
      }
    }

    // Method 3: Match by auth email
    if (!userId) {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const user = authUsers?.users?.find(u => 
        u.email?.toLowerCase() === from.toLowerCase()
      )
      if (user) {
        userId = user.id
        identificationMethod = 'auth_email'
      }
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'User not found', 
        message: `No account found for ${from}. ` +
          `Either: 1) Register at xmemory.work with this email, or ` +
          `2) Send to upload+YOUR_USER_ID@xmemory.work (find your ID in dashboard settings)`,
        hint: 'Check your user ID in the xmemory dashboard settings page'
      }, { status: 404 })
    }

    console.log(`User identified via ${identificationMethod}: ${userId}`)

    // Extract content from attachments or email body
    let content = ''
    let filename = 'email-upload.txt'
    let contentType: 'memory' | 'skill' | 'profile' = 'memory'
    let processedAttachments: Array<{name: string, size: number}> = []

    if (attachments && attachments.length > 0) {
      // Process attachments
      for (const attachment of attachments) {
        try {
          const decodedContent = Buffer.from(attachment.content, 'base64').toString('utf-8')
          processedAttachments.push({
            name: attachment.filename,
            size: decodedContent.length
          })

          // Use first text-like attachment as main content
          if (!content && isTextFile(attachment.filename, attachment.contentType)) {
            content = decodedContent
            filename = attachment.filename

            // Detect content type from filename
            const lowerFilename = attachment.filename.toLowerCase()
            if (lowerFilename.includes('skill') || lowerFilename.endsWith('.skill')) {
              contentType = 'skill'
            } else if (lowerFilename.includes('profile') || lowerFilename.includes('persona')) {
              contentType = 'profile'
            }
          }
        } catch (e) {
          console.error(`Failed to decode attachment ${attachment.filename}:`, e)
        }
      }
    }

    // If no attachment content, use email body
    if (!content && text) {
      content = text
      // If subject hints at content type
      const lowerSubject = (subject || '').toLowerCase()
      if (lowerSubject.includes('skill')) {
        contentType = 'skill'
      } else if (lowerSubject.includes('profile') || lowerSubject.includes('persona')) {
        contentType = 'profile'
      }
    }

    if (!content) {
      return NextResponse.json({ 
        error: 'No content found', 
        message: 'Email must contain text content or a text file attachment' 
      }, { status: 400 })
    }

    // Generate title from subject or filename
    const title = subject || filename.replace(/\.[^/.]+$/, '') || 'Email Upload'

    // Detect platform from content
    let platform: 'chatgpt' | 'claude' | 'gemini' = 'chatgpt'
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('claude') || lowerContent.includes('anthropic')) {
      platform = 'claude'
    } else if (lowerContent.includes('gemini') || lowerContent.includes('google ai')) {
      platform = 'gemini'
    }

    // Upload file to storage
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${userId}/${timestamp}-${sanitizedFilename}`
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
        description: `Uploaded via email from ${from}${identificationMethod === 'subaddress' ? ' (subaddress)' : ''}`,
        file_path: filePath,
        preview_content: preview,
        platform,
        content_type: contentType,
        status: 'draft',
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
        platform,
        status: 'draft',
        contentLength: content.length,
      },
      identifiedBy: identificationMethod,
      attachmentsProcessed: processedAttachments.length,
    })

  } catch (error) {
    console.error('Email upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: check if file is text-based
function isTextFile(filename: string, contentType: string): boolean {
  const textExtensions = ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.ts', '.py', '.skill']
  const textMimeTypes = ['text/', 'application/json', 'application/xml']
  
  const lowerFilename = filename.toLowerCase()
  if (textExtensions.some(ext => lowerFilename.endsWith(ext))) {
    return true
  }
  
  if (textMimeTypes.some(type => contentType.toLowerCase().startsWith(type))) {
    return true
  }
  
  return false
}
