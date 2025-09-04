import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event: any) => {
  try {
    // For now, let's just forward the request directly to n8n
    // This is a simpler approach that should work
    
    // Get the raw body
    const body = await readBody(event)
    
    // Create FormData for the n8n webhook
    const n8nFormData = new FormData()
    
    // For testing, let's just send a simple request
    n8nFormData.append('test', 'data')
    n8nFormData.append('timestamp', new Date().toISOString())

    // Make the request to n8n webhook
    const n8nResponse = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction', {
      method: 'POST',
      body: n8nFormData
    })

    // Get the response data
    const responseText = await n8nResponse.text()
    
    console.log('N8N Response Status:', n8nResponse.status)
    console.log('N8N Response Headers:', [...n8nResponse.headers.entries()])
    console.log('N8N Response Body:', responseText)

    // Set CORS headers
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    event.node.res.setHeader('Content-Type', 'application/json')

    // Return the response from n8n
    if (n8nResponse.ok) {
      try {
        const jsonData = JSON.parse(responseText)
        return {
          success: true,
          data: jsonData
        }
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response from n8n',
          rawResponse: responseText
        }
      }
    } else {
      return {
        success: false,
        error: `N8N webhook error: ${n8nResponse.status}`,
        status: n8nResponse.status,
        rawResponse: responseText
      }
    }

  } catch (error) {
    console.error('Webhook proxy error:', error)
    
    // Set CORS headers even for errors
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    event.node.res.setHeader('Content-Type', 'application/json')

    return {
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    }
  }
})
