# 🚨 JSON Parsing Issue - Comprehensive Fix Guide

## 🚨 **Issue Identified**
```
Error: Unexpected token 'T', "The page c"... is not valid JSON
```

## 🔍 **Root Causes**

### 1. **HTML Instead of JSON**
- Webhook receiving HTML error pages instead of JSON data
- Content-Type mismatch between request and response
- Server returning HTML error pages (404, 500, etc.)

### 2. **Invalid Request Body**
- Malformed JSON in request payload
- Missing or incorrect Content-Type header
- Empty or corrupted request body

### 3. **Server-Side Parsing Issues**
- `readBody()` function failing to parse request
- TypeScript type mismatches
- Error handling not catching parsing failures

## ✅ **Solutions Applied**

### 1. **Enhanced Error Handling**
```typescript
// Check content type
const contentType = event.node.req.headers['content-type'] || '';
console.log('Content-Type received:', contentType);

// Read body with error handling
let body;
try {
  body = await readBody(event);
  console.log('Raw body type:', typeof body);
  console.log('Raw body:', body);
} catch (readError: any) {
  console.error('Error reading body:', readError);
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request body',
    data: {
      message: 'Could not parse request body',
      error: readError.message,
      contentType: contentType
    }
  });
}
```

### 2. **Body Validation**
```typescript
// Validate that body is an object/JSON
if (!body || typeof body !== 'object') {
  console.error('Invalid body type:', typeof body, body);
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid JSON payload',
    data: {
      message: 'Request body must be valid JSON object',
      receivedType: typeof body,
      receivedValue: body
    }
  });
}
```

### 3. **Debug Endpoint Created**
- **`/api/test`** - Simple endpoint to test JSON parsing
- **`debug-webhook.html`** - Interactive debugging tool
- **Enhanced logging** throughout the webhook

## 🧪 **Testing & Debugging**

### **Step 1: Test the Debug Endpoint**
```bash
# Test with valid JSON
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected response:
{
  "success": true,
  "debug": {
    "method": "POST",
    "contentType": "application/json",
    "bodyType": "object",
    "bodyValue": {"test": "data"}
  }
}
```

### **Step 2: Use the Debug Tool**
1. **Open** `debug-webhook.html` in your browser
2. **Test the webhook** with sample data
3. **Check console logs** for detailed information
4. **Verify response headers** and content types

### **Step 3: Check Server Logs**
```bash
# Start development server
npm run dev

# Look for these log messages:
# "Content-Type received: application/json"
# "Raw body type: object"
# "Webhook received: {...}"
# "Extracted webhook data: {...}"
# "Mapped form data: {...}"
```

## 🔧 **Common Issues & Fixes**

### **Issue 1: "Unexpected token 'T'"**
**Cause:** Receiving HTML instead of JSON
**Solution:**
```typescript
// Check if response is HTML
if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
  throw createError({
    statusCode: 400,
    statusMessage: 'HTML received instead of JSON',
    data: {
      message: 'Server returned HTML page, not JSON data',
      receivedContent: body.substring(0, 200) + '...'
    }
  });
}
```

### **Issue 2: Empty Request Body**
**Cause:** No data sent or Content-Type mismatch
**Solution:**
```typescript
// Validate request body
if (!body || Object.keys(body).length === 0) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Empty request body',
    data: {
      message: 'Request body cannot be empty',
      contentType: contentType
    }
  });
}
```

### **Issue 3: Invalid JSON Format**
**Cause:** Malformed JSON in request
**Solution:**
```typescript
// Validate JSON structure
try {
  JSON.stringify(body); // This will fail if body is not serializable
} catch (jsonError: any) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid JSON structure',
    data: {
      message: 'Request body is not valid JSON',
      error: jsonError.message
    }
  });
}
```

## 📋 **Testing Checklist**

### **Before Testing**
- [ ] Development server running (`npm run dev`)
- [ ] Both API directories synced (`.\sync-api.bat`)
- [ ] Console logs visible and clear

### **Basic Tests**
- [ ] **Test endpoint** (`/api/test`) returns debug info
- [ ] **Webhook endpoint** (`/api/webhook`) accepts valid JSON
- [ ] **Error handling** works for invalid requests
- [ ] **Content-Type validation** is working

### **Advanced Tests**
- [ ] **PDF generation** works locally
- [ ] **Environment detection** shows correct values
- [ ] **Fallback mechanisms** work on errors
- [ ] **Response headers** are set correctly

## 🚀 **Quick Fix Commands**

### **1. Sync API Files**
```bash
.\sync-api.bat
```

### **2. Test Debug Endpoint**
```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### **3. Test Webhook**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

### **4. Check Logs**
```bash
# Look for these in console:
# ✅ Content-Type received: application/json
# ✅ Raw body type: object
# ✅ Webhook received: {...}
# ✅ Extracted webhook data: {...}
# ✅ Mapped form data: {...}
```

## 🎯 **Expected Results**

| Test | Expected Result | If Different |
|------|----------------|--------------|
| **Debug Endpoint** | JSON response with debug info | Check server logs |
| **Valid Webhook** | PDF download or HTML with data | Check data mapping |
| **Invalid JSON** | 400 error with clear message | Check error handling |
| **Empty Body** | 400 error about empty body | Check validation |
| **Wrong Content-Type** | 400 error about content type | Check headers |

## 🚨 **Troubleshooting Steps**

### **If Still Getting JSON Errors**

#### **Step 1: Check Request**
```bash
# Use debug tool to see exact request
# Check browser Network tab
# Verify Content-Type header
```

#### **Step 2: Check Server Logs**
```bash
# Look for error messages
# Check body parsing logs
# Verify data extraction
```

#### **Step 3: Test with Simple Data**
```bash
# Start with minimal JSON
{"name":"Test","ic":"123"}

# Then add fields one by one
```

#### **Step 4: Check File Sync**
```bash
# Ensure both directories are synced
.\sync-api.bat

# Verify files exist in both locations
dir server\api
dir api
```

## 📚 **Related Files**

- **`api/webhook.post.ts`** - Enhanced webhook with error handling
- **`api/test.post.ts`** - Debug endpoint for testing
- **`debug-webhook.html`** - Interactive debugging tool
- **`sync-api.bat`** - File synchronization script

## 🎉 **Success Indicators**

Your JSON parsing is working when:
- ✅ **No more "Unexpected token" errors**
- ✅ **Debug endpoint returns valid JSON**
- ✅ **Webhook accepts and processes data**
- ✅ **Console shows detailed logging**
- ✅ **Error messages are clear and helpful**

## 🔄 **Next Steps**

1. **Test the debug endpoint** first
2. **Use the debug tool** to test webhook
3. **Check console logs** for detailed information
4. **Verify file synchronization** is working
5. **Test with n8n** using valid JSON payload

---

**Note:** The enhanced error handling will now provide clear, actionable error messages instead of cryptic JSON parsing errors.
