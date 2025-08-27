const { H3Event, readBody } = require('h3')

export default defineEventHandler(async (event: any) => {
  try {
    // Log request details
    console.log('=== TEST ENDPOINT DEBUG ===');
    console.log('Method:', event.method);
    console.log('Headers:', event.node.req.headers);
    console.log('URL:', event.node.req.url);
    
    // Check content type
    const contentType = event.node.req.headers['content-type'] || 'none';
    console.log('Content-Type:', contentType);
    
    // Try to read body
    let body;
    let bodyType = 'unknown';
    let bodyValue = 'unknown';
    
    try {
      body = await readBody(event);
      bodyType = typeof body;
      bodyValue = body;
      console.log('Body read successfully');
      console.log('Body type:', bodyType);
      console.log('Body value:', bodyValue);
    } catch (readError: any) {
      console.error('Failed to read body:', readError.message);
      bodyType = 'error';
      bodyValue = readError.message;
    }
    
    // Return debug information
    return {
      success: true,
      debug: {
        method: event.method,
        contentType: contentType,
        bodyType: bodyType,
        bodyValue: bodyValue,
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development'
      },
      message: 'Test endpoint working - check console for debug info'
    };
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
