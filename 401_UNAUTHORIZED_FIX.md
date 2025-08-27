# 🔐 401 Unauthorized Error - PDF Generation Fix

## 🚨 **Error: PDF service failed with status 401: {"errorCode":6,"message":"Unauthorized"}**

This error indicates that the html2pdf.app API key is either invalid or not being sent correctly.

**Important**: According to [html2pdf.app documentation](https://html2pdf.app/documentation/#authentication), the API key should be passed as a **query parameter** called `apiKey`, not in the `Authorization` header.

## 🔍 **Root Causes & Solutions**

### **1. Environment Variable Not Set**
**Problem**: The `pdf-api-key` environment variable is not configured in Vercel.

**Solution**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add: `pdf-api-key` = `your-actual-api-key`
5. **Important**: Set it for **Production** environment
6. Redeploy: `vercel --force --prod`

### **2. Wrong Environment Variable Name**
**Problem**: The code is looking for `pdf-api-key` but you might have set `pdf_api_key` or something else.

**Current Code**:
```javascript
const pdfApiKey = process.env['pdf-api-key'];  // ✅ Correct
```

**Check Vercel**:
- Environment variable name must be exactly: `pdf-api-key`
- Not: `pdf_api_key`, `PDF_API_KEY`, `pdfApiKey`, etc.

### **3. API Key Invalid/Expired**
**Problem**: The API key from html2pdf.app is invalid or expired.

**Solution**:
1. Go to [html2pdf.app Dashboard](https://html2pdf.app/dashboard)
2. Check your API key status
3. Regenerate if needed
4. Copy the new key
5. Update Vercel environment variable
6. Redeploy

### **4. API Key Format Issues**
**Problem**: The API key might have extra spaces or characters.

**Solution**:
1. Copy the API key exactly as shown in html2pdf.app
2. Remove any extra spaces before/after
3. Ensure it starts with expected format (e.g., `pk_live_...`)

## 🧪 **Debugging Steps**

### **Step 1: Check Environment Variables**
The webhook now logs environment variable information:

```bash
# Check Vercel logs for these messages:
PDF API key found: pk_live_abc...
Environment variables: ['pdf-api-key']
Making PDF request with API key: pk_live_abc...
```

### **Step 2: Verify API Key in Vercel**
```bash
# Check if environment variable is visible
vercel env ls

# Or check in Vercel dashboard
# Settings → Environment Variables
```

### **Step 3: Test API Key Directly**
```bash
# Test with curl (replace YOUR_API_KEY)
curl -X POST "https://api.html2pdf.app/v1/generate?apiKey=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>","format":"A4"}'
```

## 🔧 **Quick Fix Checklist**

- [ ] **Environment Variable**: Set `pdf-api-key` in Vercel dashboard
- [ ] **Variable Name**: Exactly `pdf-api-key` (with hyphens)
- [ ] **Environment**: Set for Production
- [ ] **API Key**: Valid and active from html2pdf.app
- [ ] **Redeploy**: `vercel --force --prod`
- [ ] **Test**: Try PDF generation again

## 📊 **Expected Behavior After Fix**

### **Success Case**:
```
PDF API key found: pk_live_abc...
Environment variables: ['pdf-api-key']
Making PDF request with API key: pk_live_abc...
PDF generation successful
```

### **Still Failing**:
```
PDF API key found: pk_live_abc...
Environment variables: ['pdf-api-key']
Making PDF request with API key: pk_live_abc...
PDF service failed with status 401: {"errorCode":6,"message":"Unauthorized"}
```

## 🚀 **Next Steps**

1. **Set the environment variable** in Vercel dashboard
2. **Redeploy** your project
3. **Test again** with the webhook test page
4. **Check logs** for debugging information

## 🔒 **Security Note**

- Never commit API keys to version control
- Use environment variables for all sensitive data
- The webhook logs only show the first 10 characters of your API key for security

---

## 🎯 **Most Common Fix**

**The 401 error is usually caused by the environment variable not being set in Vercel.**

**Quick fix**: Go to Vercel dashboard → Settings → Environment Variables → Add `pdf-api-key` with your html2pdf.app API key → Redeploy.

**This should resolve the 401 Unauthorized error!** 🚀
