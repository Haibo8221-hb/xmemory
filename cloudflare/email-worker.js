/**
 * xmemory Email Upload Worker
 * 
 * Cloudflare Email Worker that receives emails to upload@xmemory.work
 * and forwards them to the xmemory API for processing.
 * 
 * Setup:
 * 1. Create Worker in Cloudflare Dashboard
 * 2. Add Email Routing for upload@xmemory.work -> this worker
 * 3. Set environment variable EMAIL_UPLOAD_SECRET
 */

export default {
  async email(message, env, ctx) {
    const API_URL = 'https://xmemory.work/api/email-upload'
    const SECRET = env.EMAIL_UPLOAD_SECRET || 'xmemory-email-upload-2026'

    try {
      // Parse email
      const from = message.from
      const to = message.to
      const subject = message.headers.get('subject') || ''
      
      // Read email body
      const rawEmail = await new Response(message.raw).text()
      
      // Simple parsing - extract text content
      let textContent = ''
      let attachments = []
      
      // Check if multipart
      const contentType = message.headers.get('content-type') || ''
      
      if (contentType.includes('multipart')) {
        // Parse multipart email
        const boundary = contentType.match(/boundary="?([^";\s]+)"?/)?.[1]
        if (boundary) {
          const parts = rawEmail.split(`--${boundary}`)
          for (const part of parts) {
            if (part.includes('Content-Type: text/plain')) {
              // Extract text content
              const textMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--|$)/)
              if (textMatch) {
                textContent = textMatch[1].trim()
              }
            } else if (part.includes('Content-Disposition: attachment')) {
              // Extract attachment
              const filenameMatch = part.match(/filename="?([^";\r\n]+)"?/)
              const contentMatch = part.match(/\r\n\r\n([\s\S]*?)(?=\r\n--|$)/)
              if (filenameMatch && contentMatch) {
                const isBase64 = part.includes('Content-Transfer-Encoding: base64')
                attachments.push({
                  filename: filenameMatch[1],
                  content: isBase64 ? contentMatch[1].replace(/\s/g, '') : btoa(contentMatch[1]),
                  contentType: 'application/octet-stream'
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

      // Prepare payload
      const payload = {
        from,
        subject,
        text: textContent,
        attachments
      }

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
        // Success - optionally send confirmation reply
        console.log(`Email upload successful: ${result.memory?.title}`)
        
        // Forward to admin for logging (optional)
        // await message.forward('admin@xmemory.work')
      } else {
        console.error(`Email upload failed: ${result.error}`)
        // Could send error reply email here
      }

    } catch (error) {
      console.error('Email worker error:', error)
      // Forward to admin on error
      await message.forward('bo.hai@foxmail.com')
    }
  }
}
