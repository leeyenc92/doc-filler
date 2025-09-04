export default defineEventHandler(async (event: any) => {
  return {
    success: true,
    message: 'Webhook proxy test endpoint is working',
    timestamp: new Date().toISOString()
  }
})
