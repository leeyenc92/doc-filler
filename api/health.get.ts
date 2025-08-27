export default defineEventHandler(() => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development',
    message: 'API is running successfully'
  };
});
