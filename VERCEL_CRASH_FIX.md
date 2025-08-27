# 🚨 Vercel Serverless Function Crash - Fix Guide

## 🚨 **Issue Identified**
```
This Serverless Function has crashed.
```

## 🔍 **Root Causes**

### 1. **Puppeteer Dependencies**
- **Problem**: Webhook trying to import `@sparticuz/chromium` and `puppeteer-core` on Vercel
- **Cause**: These packages aren't available in Vercel's serverless environment
- **Result**: Import errors causing function crashes

### 2. **Missing Error Handling**
- **Problem**: No try-catch around dependency loading
- **Cause**: Unhandled import failures
- **Result**: Function crashes instead of graceful fallback

### 3. **Environment Detection Issues**
- **Problem**: Vercel environment not properly detected
- **Cause**: `process.env.VERCEL` check failing
- **Result**: Wrong code path execution

## ✅ **Solutions Applied**

### 1. **Conditional Dependency Loading**
```typescript
// Function to load Puppeteer dependencies
async function loadPuppeteerDependencies() {
  // Skip loading Puppeteer on Vercel
  if (process.env.VERCEL === '1') {
    console.log('Running on Vercel - skipping Puppeteer dependencies');
    return;
  }
  
  try {
    chromium = await import('@sparticuz/chromium');
    puppeteer = await import('puppeteer-core');
    console.log('Puppeteer dependencies loaded successfully');
  } catch (error: any) {
    console.warn('Puppeteer dependencies not available:', error.message);
  }
}
```

### 2. **Enhanced Error Handling**
```typescript
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Load dependencies at runtime (only on non-Vercel environments)
    await loadPuppeteerDependencies();
    
    // ... rest of webhook logic
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    // Return appropriate error response
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while processing the webhook',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development'
      }
    });
  }
});
```

### 3. **Health Check Endpoint**
- **`/api/health`** - Simple endpoint to test basic API functionality
- **No dependencies** - Pure function to verify deployment
- **Environment detection** - Shows current deployment environment

## 🧪 **Testing the Fix**

### **Step 1: Test Health Endpoint**
```bash
# Test locally
curl http://localhost:3000/api/health

# Test on Vercel (after deployment)
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "Vercel",
  "message": "API is running successfully"
}
```

### **Step 2: Test Webhook on Vercel**
```bash
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

**Expected Response:**
- **Content-Type**: `text/html`
- **X-Environment**: `Vercel`
- **X-PDF-Available**: `false`
- **Body**: HTML with form data and Vercel notice

### **Step 3: Check Vercel Logs**
```bash
# Deploy to Vercel
vercel --prod

# Check function logs
vercel logs
```

**Look for:**
- ✅ "Running on Vercel - skipping Puppeteer dependencies"
- ✅ "Environment check - Vercel: true"
- ✅ "Running on Vercel - returning HTML instead of PDF"

## 🔧 **Common Issues & Fixes**

### **Issue 1: Still Getting Crashes**
**Cause**: Dependencies still being imported
**Solution**: Check if `process.env.VERCEL === '1'` is working

```typescript
// Add debug logging
console.log('VERCEL env var:', process.env.VERCEL);
console.log('Environment check - Vercel:', process.env.VERCEL === '1');
```

### **Issue 2: Environment Detection Failing**
**Cause**: Vercel environment variable not set
**Solution**: Check `vercel.json` configuration

```json
{
  "env": {
    "VERCEL": "1"
  }
}
```

### **Issue 3: Import Errors Persist**
**Cause**: Dynamic imports still executing
**Solution**: Ensure early return in dependency loading

```typescript
if (process.env.VERCEL === '1') {
  console.log('Running on Vercel - skipping Puppeteer dependencies');
  return; // Early return, no imports
}
```

## 📋 **Testing Checklist**

### **Before Deployment**
- [ ] **Health endpoint** works locally (`/api/health`)
- [ ] **Webhook** works locally with Vercel env var
- [ ] **Console logs** show correct environment detection
- [ ] **API files synced** (`.\sync-api.bat`)

### **After Deployment**
- [ ] **Health endpoint** accessible on Vercel
- [ ] **Webhook** returns HTML (not crashes)
- **Response headers** show Vercel environment
- **Vercel logs** show successful execution

### **Error Scenarios**
- [ ] **Invalid JSON** returns 400 error
- [ ] **Missing fields** returns 400 error
- [ ] **Wrong method** returns 405 error
- [ ] **Server errors** return 500 with details

## 🚀 **Quick Fix Commands**

### **1. Sync Updated Files**
```bash
.\sync-api.bat
```

### **2. Test Locally with Vercel Env**
```bash
# Set Vercel environment variable
set VERCEL=1

# Test webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

### **3. Deploy to Vercel**
```bash
vercel --prod
```

### **4. Test Deployed Endpoints**
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Webhook test
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

## 🎯 **Expected Results**

| Endpoint | Local (No Vercel) | Local (VERCEL=1) | Vercel Deployed |
|----------|-------------------|------------------|-----------------|
| **`/api/health`** | ✅ Local/Development | ✅ Vercel | ✅ Vercel |
| **`/api/webhook`** | ✅ PDF generation | ✅ HTML output | ✅ HTML output |
| **Error handling** | ✅ Full fallbacks | ✅ Basic errors | ✅ Basic errors |

## 🚨 **Troubleshooting Steps**

### **If Vercel Still Crashes**

#### **Step 1: Check Environment Variable**
```bash
# In Vercel dashboard
# Go to Settings > Environment Variables
# Ensure VERCEL=1 is set
```

#### **Step 2: Check Function Logs**
```bash
vercel logs
# Look for import errors or dependency issues
```

#### **Step 3: Test Minimal Function**
```bash
# Temporarily replace webhook with simple function
export default defineEventHandler(() => {
  return { message: 'Hello from Vercel' };
});
```

#### **Step 4: Check Package Dependencies**
```bash
# Ensure these are NOT in package.json for Vercel
npm uninstall @sparticuz/chromium puppeteer-core
npm install puppeteer  # Only for local development
```

## 📚 **Related Files**

- **`api/webhook.post.ts`** - Fixed webhook with Vercel support
- **`api/health.get.ts`** - Health check endpoint
- **`vercel.json`** - Vercel configuration
- **`sync-api.bat`** - File synchronization script

## 🎉 **Success Indicators**

Your Vercel deployment is working when:
- ✅ **Health endpoint** returns status: "healthy"
- ✅ **Webhook endpoint** returns HTML (not crashes)
- ✅ **Environment detection** shows "Vercel"
- ✅ **No import errors** in Vercel logs
- ✅ **Response headers** indicate Vercel environment

## 🔄 **Next Steps**

1. **Test the fix** locally with `VERCEL=1`
2. **Deploy to Vercel** to verify the solution
3. **Test both endpoints** to ensure functionality
4. **Check Vercel logs** for successful execution
5. **Integrate with n8n** using the working webhook

---

**Note:** The webhook now gracefully handles Vercel deployment by skipping Puppeteer dependencies and returning HTML output instead of attempting PDF generation.
