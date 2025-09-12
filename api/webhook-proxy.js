export default async function handler(req, res) {
  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // For now, let's just forward the request to n8n directly
    // This is a simpler approach that should work with Vercel
    
    // Create a simple test request to n8n
    const n8nFormData = new FormData();
    n8nFormData.append('test', 'data');
    n8nFormData.append('timestamp', new Date().toISOString());

    // Make the request to n8n webhook
    const n8nResponse = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook/doc-extraction', {
      method: 'POST',
      body: n8nFormData
    });

    // Get the response data
    const responseText = await n8nResponse.text();

    // Return the response from n8n
    if (n8nResponse.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        return res.status(200).json({
          success: true,
          data: jsonData
        });
      } catch (parseError) {
        return res.status(200).json({
          success: false,
          error: 'Invalid JSON response from n8n',
          rawResponse: responseText
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        error: `N8N webhook error: ${n8nResponse.status}`,
        status: n8nResponse.status,
        rawResponse: responseText
      });
    }

  } catch (error) {
    // Set CORS headers even for errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res.status(500).json({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
}
