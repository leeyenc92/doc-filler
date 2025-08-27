# 🚨 TypeScript ESM Syntax Error - Fix Guide

## 🚨 **Issue Identified**
```
error TS1286: ESM syntax is not allowed in a CommonJS module when 'verbatimModuleSyntax' is enabled.
```

## 🔍 **Root Causes**

### 1. **TypeScript Configuration Conflict**
- **Problem**: `verbatimModuleSyntax: true` in `tsconfig.json`
- **Cause**: This setting enforces strict module syntax rules
- **Result**: Dynamic `import()` statements not allowed in CommonJS context

### 2. **Dynamic Import vs CommonJS**
- **Problem**: Using `await import()` in CommonJS environment
- **Cause**: Nuxt 3 API routes run in CommonJS context
- **Result**: ESM syntax conflicts with CommonJS module system

### 3. **Module Resolution Mismatch**
- **Problem**: Mixed module systems (ESM and CommonJS)
- **Cause**: Different parts of the codebase using different module syntax
- **Result**: TypeScript compiler rejecting ESM syntax

## ✅ **Solutions Applied**

### 1. **Replace Dynamic Imports with Require**
```typescript
// BEFORE (ESM syntax - causes error)
async function loadPuppeteerDependencies() {
  if (process.env.VERCEL !== '1') {
    try {
      chromium = await import('@sparticuz/chromium');
      puppeteer = await import('puppeteer-core');
    } catch (error: any) {
      console.warn('Puppeteer dependencies not available:', error.message);
    }
  }
}

// AFTER (CommonJS syntax - compatible)
async function loadPuppeteerDependencies() {
  // Skip loading Puppeteer on Vercel
  if (process.env.VERCEL === '1') {
    console.log('Running on Vercel - skipping Puppeteer dependencies');
    return;
  }
  
  try {
    // Use require instead of dynamic import for CommonJS compatibility
    const chromiumModule = require('@sparticuz/chromium');
    const puppeteerModule = require('puppeteer-core');
    
    chromium = chromiumModule;
    puppeteer = puppeteerModule;
    console.log('Puppeteer dependencies loaded successfully');
  } catch (error: any) {
    console.warn('Puppeteer dependencies not available:', error.message);
  }
}
```

### 2. **Enhanced Error Handling Structure**
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

## 🔧 **Alternative Solutions**

### **Option 1: Disable verbatimModuleSyntax (Not Recommended)**
```json
// tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": false
  }
}
```

**Pros**: Quick fix, no code changes needed
**Cons**: Loses TypeScript's strict module checking, may hide other issues

### **Option 2: Use Conditional Compilation (Recommended)**
```typescript
// Use different syntax based on environment
async function loadPuppeteerDependencies() {
  if (process.env.VERCEL === '1') {
    console.log('Running on Vercel - skipping Puppeteer dependencies');
    return;
  }
  
  try {
    // CommonJS syntax for compatibility
    const chromiumModule = require('@sparticuz/chromium');
    const puppeteerModule = require('puppeteer-core');
    
    chromium = chromiumModule;
    puppeteer = puppeteerModule;
    console.log('Puppeteer dependencies loaded successfully');
  } catch (error: any) {
    console.warn('Puppeteer dependencies not available:', error.message);
  }
}
```

**Pros**: Maintains TypeScript strictness, works in all environments
**Cons**: Requires code changes, uses CommonJS syntax

### **Option 3: Use External PDF Service (Best for Production)**
```typescript
// Skip Puppeteer entirely on Vercel
if (process.env.VERCEL === '1') {
  // Use external PDF service
  const pdfUrl = await generatePDFWithExternalService(html);
  return { pdfUrl, environment: 'Vercel' };
}
```

**Pros**: No dependency issues, scalable, production-ready
**Cons**: Requires external service setup, additional costs

## 🧪 **Testing the Fix**

### **Step 1: Verify TypeScript Compilation**
```bash
# Check if TypeScript compiles without errors
npx tsc --noEmit

# Or run the build command
npm run build
```

**Expected Result**: No ESM syntax errors

### **Step 2: Test Local Development**
```bash
# Start development server
npm run dev

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

**Expected Result**: Webhook works without TypeScript errors

### **Step 3: Test Vercel Environment Locally**
```bash
# Set Vercel environment variable
set VERCEL=1

# Test webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

**Expected Result**: Returns HTML instead of PDF, no dependency loading

## 📋 **Testing Checklist**

### **Before Testing**
- [ ] **TypeScript compilation** passes (`npx tsc --noEmit`)
- [ ] **Development server** starts without errors
- [ ] **API files synced** (`.\sync-api.bat`)
- [ ] **Console logs** show correct environment detection

### **Basic Tests**
- [ ] **Health endpoint** works (`/api/health`)
- [ ] **Webhook endpoint** accepts valid JSON
- [ ] **No TypeScript errors** in console
- [ ] **Dependency loading** works correctly

### **Environment Tests**
- [ ] **Local development** generates PDFs
- [ ] **Local with VERCEL=1** returns HTML
- [ ] **Vercel deployment** works without crashes
- [ ] **Environment detection** shows correct values

## 🚀 **Quick Fix Commands**

### **1. Apply the Fix**
```bash
# Sync updated files
.\sync-api.bat

# Verify TypeScript compilation
npx tsc --noEmit
```

### **2. Test Locally**
```bash
# Start development server
npm run dev

# Test in another terminal
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

### **3. Test Vercel Environment**
```bash
# Set environment variable
set VERCEL=1

# Test webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}'
```

### **4. Deploy to Vercel**
```bash
vercel --prod
```

## 🎯 **Expected Results**

| Test | Before Fix | After Fix | Status |
|------|------------|-----------|---------|
| **TypeScript Compilation** | ❌ ESM syntax error | ✅ No errors | Fixed |
| **Local Development** | ❌ Import errors | ✅ PDF generation | Working |
| **Vercel Environment** | ❌ Function crashes | ✅ HTML output | Working |
| **Dependency Loading** | ❌ ESM conflicts | ✅ CommonJS compatible | Fixed |

## 🚨 **Troubleshooting Steps**

### **If Still Getting ESM Errors**

#### **Step 1: Check TypeScript Config**
```bash
# Look for verbatimModuleSyntax in tsconfig.json
cat tsconfig.json | grep verbatimModuleSyntax
```

#### **Step 2: Check for Remaining Dynamic Imports**
```bash
# Search for any remaining import() statements
grep -r "await import(" api/
grep -r "await import(" server/api/
```

#### **Step 3: Verify File Sync**
```bash
# Ensure both directories are synced
.\sync-api.bat

# Check file contents
diff api/webhook.post.ts server/api/webhook.post.ts
```

#### **Step 4: Check Module Resolution**
```bash
# Verify package.json module type
cat package.json | grep "type"

# Check if using CommonJS or ESM
ls -la | grep package.json
```

## 📚 **Related Files**

- **`api/webhook.post.ts`** - Fixed webhook with CommonJS compatibility
- **`server/api/webhook.post.ts`** - Server-side version with same fixes
- **`tsconfig.json`** - TypeScript configuration
- **`sync-api.bat`** - File synchronization script

## 🎉 **Success Indicators**

Your TypeScript ESM issue is fixed when:
- ✅ **No ESM syntax errors** during compilation
- ✅ **TypeScript compilation** passes without errors
- ✅ **Development server** starts without TypeScript errors
- ✅ **Webhook works** in both local and Vercel environments
- ✅ **Dependency loading** uses CommonJS syntax

## 🔄 **Next Steps**

1. **Test the fix** locally to ensure no TypeScript errors
2. **Verify compilation** passes with `npx tsc --noEmit`
3. **Test webhook** in both environments
4. **Deploy to Vercel** to verify the complete solution
5. **Integrate with n8n** using the working webhook

## 💡 **Best Practices Going Forward**

### **1. Use CommonJS for API Routes**
```typescript
// ✅ Good - CommonJS compatible
const module = require('package-name');

// ❌ Avoid - ESM syntax in CommonJS context
const module = await import('package-name');
```

### **2. Environment-Specific Logic**
```typescript
// ✅ Good - Clear environment detection
if (process.env.VERCEL === '1') {
  // Vercel-specific logic
} else {
  // Local development logic
}
```

### **3. Error Handling**
```typescript
// ✅ Good - Comprehensive error handling
try {
  // Main logic
} catch (error: any) {
  // Handle errors gracefully
  console.error('Error:', error);
  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error'
  });
}
```

---

**Note:** The fix replaces dynamic ESM imports with CommonJS `require()` statements, making the code compatible with your TypeScript configuration while maintaining the same functionality.
