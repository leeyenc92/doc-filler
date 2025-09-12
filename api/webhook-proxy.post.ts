import { defineEventHandler, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event: any) => {
  try {
    // Get the multipart form data from the request
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      return {
        statusCode: 400,
        statusMessage: 'No form data provided'
      }
    }

    // Find the file in the form data
    const fileData = formData.find(item => item.name === 'file')
    const filename = formData.find(item => item.name === 'filename')?.data?.toString() || 'document.pdf'
    const timestamp = formData.find(item => item.name === 'timestamp')?.data?.toString() || new Date().toISOString()

    if (!fileData || !fileData.data) {
      return {
        statusCode: 400,
        statusMessage: 'No file provided'
      }
    }

    // Create FormData for the n8n webhook
    const n8nFormData = new FormData()
    n8nFormData.append('file', new Blob([fileData.data], { type: fileData.type || 'application/pdf' }), filename)
    n8nFormData.append('filename', filename)
    n8nFormData.append('timestamp', timestamp)

    // Make the request to n8n webhook
    const n8nResponse = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook/doc-extraction', {
      method: 'POST',
      body: n8nFormData
    })

    // Get the response data
    const responseText = await n8nResponse.text()

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
    // Set CORS headers even for errors
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    event.node.res.setHeader('Content-Type', 'application/json')

    return {
      statusCode: 500,
      statusMessage: 'Internal server error'
    }
  }
})
