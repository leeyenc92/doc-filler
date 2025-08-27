# Webhook Quick Start Guide

Get your Legal Document Filler webhook up and running in minutes!

## 🚀 Quick Setup

### 1. Start Your Server
```bash
npm run dev
```

### 2. Test the Webhook
Navigate to `/webhook-test` in your browser to test the webhook functionality.

### 3. Webhook Endpoint
Your webhook is available at: `http://localhost:3000/api/webhook`

## 📋 Required Fields

Send a POST request with these fields:

```json
{
  "name": "Customer Name",
  "ic": "IC Number",
  "address": "Customer Address",
  "property": "Property Details",
  "bank": "Bank Name",
  "bankAddress": "Bank Address",
  "branchAddress": "Branch Address",
  "facility": "Facility Type",
  "date": "2024-01-15"
}
```

## 🔧 n8n Integration

### Step 1: Create HTTP Request Node
- **Method:** POST
- **URL:** `http://localhost:3000/api/webhook`
- **Headers:** `Content-Type: application/json`
- **Body:** Your data in JSON format

### Step 2: Handle Response
The webhook returns a PDF file. In n8n:
- Use "Write Binary File" node to save the PDF
- Or use "Send Email" node to email the PDF
- Or integrate with cloud storage (Google Drive, Dropbox, etc.)

## 🧪 Testing with cURL

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "ic": "123456789012",
    "address": "123 Main Street",
    "property": "Test Property",
    "bank": "Test Bank",
    "bankAddress": "123 Bank Street",
    "branchAddress": "456 Branch Street",
    "facility": "Test Loan",
    "date": "2024-01-15"
  }' \
  --output test.pdf
```

## 📚 Next Steps

1. **Read the full documentation:** [WEBHOOK_README.md](./WEBHOOK_README.md)
2. **Import the n8n workflow:** [n8n-workflow-example.json](./n8n-workflow-example.json)
3. **Customize the form fields** in `server/api/webhook.post.ts`
4. **Add authentication** if needed
5. **Deploy to production** and update the webhook URL

## 🆘 Need Help?

- Check the browser console for errors
- Verify all required fields are provided
- Ensure the server is running
- Check the webhook test page at `/webhook-test`

## 🔒 Production Considerations

- Use HTTPS in production
- Implement rate limiting
- Add authentication (API keys, JWT)
- Monitor webhook usage
- Set up logging and alerts

## 🚀 Vercel Deployment

### Automatic Environment Detection
The webhook automatically detects Vercel deployment and adjusts behavior:

- **Local:** Full PDF generation ✅
- **Vercel:** HTML output with guidance ⚠️

### Vercel Setup
1. **Deploy to Vercel:** `vercel --prod`
2. **Environment Variables:** Automatically set `VERCEL=1`
3. **Function Timeout:** Extended to 30 seconds
4. **CORS Headers:** Pre-configured for webhook access

### Vercel Limitations
- No PDF generation (serverless constraints)
- Returns HTML content instead
- Includes deployment guidance
- Ready for external PDF service integration
