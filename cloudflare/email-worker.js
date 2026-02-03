/**
 * xmemory Email Upload Worker
 * 
 * Cloudflare Email Worker that receives emails to upload@xmemory.work
 * and forwards them to the xmemory API for processing.
 * 
 * User identification (priority order):
 * 1. Subaddress: upload+用户ID@xmemory.work
 * 2. From email: match user's registered email
 * 
 * Setup:
 * 1. Deploy this worker via wrangler
 * 2. Add Email Routing for upload@xmemory.work -> this worker
 * 3. Set environment variable EMAIL_UPLOAD_SECRET
 * 4. Enable subaddressing in Cloudflare Email Routing settings
 */

export default {
  async email(message, env, ctx) {
    const API_URL = env.API_URL || 'https://xmemory.work/api/email-upload'
    const SECRET = env.EMAIL_UPLOAD_SECRET || 'xmemory-email-upload-2026'

    try {
      // Parse email headers
      const from = message.from
      const to = message.to
      const subject = message.headers.get('subject') || ''
      
      // Extract user ID from subaddress (upload+userId@xmemory.work)
      let userIdFromSubaddress = null
      const subaddressMatch = to.match(/upload\+([^@]+)@/i)
      if (subaddressMatch) {
        userIdFromSubaddress = subaddressMatch[1]
        console.log(`Subaddress user ID: ${userIdFromSubaddress}`)
      }

      // Read raw email
      const rawEmail = await new Response(message.raw).text()
      
      // Parse email content
      let textContent = ''
      let htmlContent = ''
      let attachments = []
      
      const contentType = message.headers.get('content-type') || ''
      
      if (contentType.includes('multipart')) {
        // Parse multipart email
        const boundary = contentType.match(/boundary="?([^";\s]+)"?/)?.[1]
        if (boundary) {
          const parts = rawEmail.split(`--${boundary}`)
          for (const part of parts) {
            const partContentType = part.match(/Content-Type:\s*([^;\r\n]+)/i)?.[1]?.toLowerCase() || ''
            
            if (partContentType.includes('text/plain') && !part.includes('Content-Disposition: attachment')) {
              // Extract text content (not attachment)
              const encoding = part.match(/Content-Transfer-Encoding:\s*(\S+)/i)?.[1]?.toLowerCase()
              const textMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--|$)/)
              if (textMatch) {
                let text = textMatch[1].trim()
                if (encoding === 'base64') {
                  text = decodeBase64(text)
                } else if (encoding === 'quoted-printable') {
                  text = decodeQuotedPrintable(text)
                }
                textContent = text
              }
            } else if (partContentType.includes('text/html') && !part.includes('Content-Disposition: attachment')) {
              // Extract HTML content
              const encoding = part.match(/Content-Transfer-Encoding:\s*(\S+)/i)?.[1]?.toLowerCase()
              const htmlMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--|$)/)
              if (htmlMatch) {
                let html = htmlMatch[1].trim()
                if (encoding === 'base64') {
                  html = decodeBase64(html)
                } else if (encoding === 'quoted-printable') {
                  html = decodeQuotedPrintable(html)
                }
                htmlContent = html
              }
            } else if (part.includes('Content-Disposition: attachment') || part.includes('Content-Disposition: inline')) {
              // Extract attachment
              const filenameMatch = part.match(/filename="?([^";\r\n]+)"?/i)
              const contentMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--|$)/)
              if (filenameMatch && contentMatch) {
                const encoding = part.match(/Content-Transfer-Encoding:\s*(\S+)/i)?.[1]?.toLowerCase()
                let content = contentMatch[1].trim()
                
                // Ensure base64 encoding
                if (encoding === 'base64') {
                  content = content.replace(/\s/g, '')
                } else {
                  // Convert to base64
                  content = btoa(unescape(encodeURIComponent(content)))
                }
                
                attachments.push({
                  filename: filenameMatch[1].trim(),
                  content: content,
                  contentType: partContentType || 'application/octet-stream'
                })
              }
            }
          }
        }
      } else {
        // Simple text email
        const bodyMatch = rawEmail.match(/\r\n\r\n([\s\S]*)$/)
        if (bodyMatch) {
          textContent = bodyMatch[1].trim()
        }
      }

      // If no text content but has HTML, extract text from HTML
      if (!textContent && htmlContent) {
        textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      }

      // Prepare payload
      const payload = {
        from,
        to,
        userId: userIdFromSubaddress, // May be null if no subaddress
        subject,
        text: textContent,
        html: htmlContent,
        attachments
      }

      console.log(`Processing email from ${from} to ${to}, subject: ${subject}`)
      console.log(`Attachments: ${attachments.length}, Text length: ${textContent.length}`)

      // Send to xmemory API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SECRET}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`Email upload successful: ${result.memory?.title}`)
      } else {
        console.error(`Email upload failed: ${result.error}`)
        // Forward to admin on failure
        await message.forward('bo.hai@foxmail.com')
      }

    } catch (error) {
      console.error('Email worker error:', error)
      // Forward to admin on error
      await message.forward('bo.hai@foxmail.com')
    }
  }
}

// Helper: decode base64
function decodeBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str.replace(/\s/g, ''))))
  } catch (e) {
    return atob(str.replace(/\s/g, ''))
  }
}

// Helper: decode quoted-printable
function decodeQuotedPrintable(str) {
  return str
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}
