# 🔑 PDF API Key Setup Guide

## 🎯 **Environment Variable Configuration**

The webhook now requires an API key for the html2pdf.app service to generate PDFs. Here's how to set it up:

## 🚀 **Step 1: Get html2pdf.app API Key**

### **Sign Up for html2pdf.app**
1. Visit [https://html2pdf.app](https://html2pdf.app)
2. Create a free account
3. Navigate to your dashboard
4. Find your API key in the settings

### **API Key Format**
- **Format**: Usually a long string like `pk_live_...` or `pk_test_...`
- **Type**: Bearer token
- **Usage**: Free tier available with limits

## 🔧 **Step 2: Set Environment Variable in Vercel**

### **Via Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `pdf-api-key`
   - **Value**: Your html2pdf.app API key
   - **Environment**: Production (and Preview if needed)
5. Click **Save**

### **Via Vercel CLI**
```bash
# Set environment variable
vercel env add pdf-api-key

# Deploy with environment variable
vercel --prod
```

### **Via vercel.json (Alternative)**
```json
{
  "env": {
    "pdf-api-key": "your-api-key-here"
  }
}
```

## 🧪 **Step 3: Test the Setup**

### **Local Testing**
```bash
# Set environment variable locally
set pdf-api-key=your-api-key-here  # Windows
export pdf-api-key=your-api-key-here  # Mac/Linux

# Test locally
npm run dev
```

### **Vercel Testing**
```bash
# Deploy to Vercel
vercel --prod

# Test PDF generation
curl -X POST https://your-domain.vercel.app/api/webhook-vercel?format=pdf \
  -H "Content-Type: application/json" \
  -H "Accept: application/pdf" \
  -d '{"name": "John Doe", "ic": "123456789"}' \
  --output test.pdf
```

## 📊 **How It Works**

### **API Key Usage**
```javascript
// The webhook now checks for the API key
const pdfApiKey = process.env['pdf-api-key'];

if (!pdfApiKey) {
  console.log('PDF API key not found, falling back to HTML');
  throw new Error('PDF API key not configured');
}

// Uses the API key in the request
const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${pdfApiKey}`  // API key used here
  },
  body: JSON.stringify({
    html: html,
    options: {
      format: 'A4',
      margin: '2cm',
      printBackground: true
    }
  })
});
```

### **Enhanced Error Handling**
- **API Key Missing**: Logs error and falls back to HTML
- **Service Failure**: Logs detailed error and falls back to HTML
- **Timeout Protection**: 30-second timeout with graceful fallback
- **Network Issues**: Handles connectivity problems

## 🔍 **Troubleshooting**

### **Common Issues**

#### 1. **"PDF API key not found"**
- **Cause**: Environment variable not set in Vercel
- **Solution**: Set `pdf-api-key` in Vercel dashboard
- **Verify**: Check environment variables in project settings

#### 2. **"PDF service failed with status 401"**
- **Cause**: Invalid or expired API key
- **Solution**: Regenerate API key in html2pdf.app
- **Verify**: Test API key in html2pdf.app dashboard

#### 3. **"PDF service failed with status 429"**
- **Cause**: Rate limit exceeded
- **Solution**: Check usage limits in html2pdf.app
- **Verify**: Monitor API usage in dashboard

#### 4. **"PDF generation timed out"**
- **Cause**: Service taking too long to respond
- **Solution**: Check html2pdf.app service status
- **Verify**: Service is operational

### **Debug Steps**
1. **Check Environment Variables**: Verify `pdf-api-key` is set in Vercel
2. **Test API Key**: Use curl or Postman to test html2pdf.app directly
3. **Check Logs**: Review Vercel function logs for detailed error messages
4. **Verify Service**: Check html2pdf.app status page

## 📋 **Environment Variable Reference**

### **Required Variables**
| Variable | Description | Example |
|----------|-------------|---------|
| `pdf-api-key` | html2pdf.app API key | `pk_live_abc123...` |

### **Optional Variables**
| Variable | Description | Default |
|----------|-------------|---------|
| `VERCEL` | Vercel environment flag | Auto-detected |

## 🚀 **Deployment Checklist**

### **Before Deploying**
- [ ] API key obtained from html2pdf.app
- [ ] Environment variable set in Vercel
- [ ] Local testing completed
- [ ] API key verified working

### **After Deploying**
- [ ] Environment variable visible in Vercel
- [ ] PDF generation working in production
- [ ] Fallback to HTML working correctly
- [ ] Error logs showing proper messages

## 🎉 **Success Indicators**

- ✅ **PDF Downloads**: Working correctly
- ✅ **API Key**: Properly configured
- ✅ **Error Handling**: Graceful fallbacks
- ✅ **Logging**: Detailed error messages
- ✅ **Performance**: Reasonable response times

## 🔒 **Security Notes**

### **API Key Protection**
- **Never commit** API keys to version control
- **Use environment variables** for all sensitive data
- **Rotate keys** periodically for security
- **Monitor usage** for unusual activity

### **Rate Limiting**
- **Free tier limits**: Check html2pdf.app documentation
- **Upgrade options**: Available for higher usage
- **Monitoring**: Track API usage in dashboard

---

## 🚀 **Ready to Generate PDFs!**

**With the API key properly configured, your webhook will now:**
- ✅ **Generate PDFs** using html2pdf.app service
- ✅ **Handle errors gracefully** with HTML fallback
- ✅ **Provide detailed logging** for debugging
- ✅ **Work reliably** in Vercel production environment

**Set up your API key and start generating professional PDF documents!** 📄✨
