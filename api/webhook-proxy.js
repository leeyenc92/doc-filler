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

    // Check if the request is too large
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 4MB for Vercel compatibility.',
        statusCode: 413
      });
    }

    // For large files, we'll return a direct URL to the n8n webhook
    // This bypasses the Vercel payload limit
    return res.status(200).json({
      success: true,
      data: {
        message: 'Please use direct n8n webhook for file uploads',
        webhookUrl: 'https://evident-fox-nationally.ngrok-free.app/webhook/doc-extraction',
        instructions: 'Upload files directly to the n8n webhook to avoid Vercel payload limits'
      }
    });

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
