# 🚀 Vercel Deployment Fix - API Directory Structure

## 🚨 **Issue Identified**
```
Error: The pattern "server/api/webhook.post.ts" defined in `functions` doesn't match any Serverless Functions inside the `api` directory.
```

## 🔍 **Root Cause**
- **Nuxt 3** uses `server/api/` directory for API routes
- **Vercel** expects API routes in the root `api/` directory
- **Mismatch** between Nuxt structure and Vercel expectations

## ✅ **Solution Applied**

### 1. **Created Root API Directory**
```bash
mkdir api
```

### 2. **Copied API Files**
```bash
copy "server\api\webhook.post.ts" "api\webhook.post.ts"
copy "server\api\pdf-filler.post.ts" "api\pdf-filler.post.ts"
```

### 3. **Updated Vercel Configuration**
```json
{
  "functions": {
    "api/webhook.post.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📁 **Current File Structure**

```
legal-doc-filler/
├── api/                          ← NEW: Vercel-compatible API routes
│   ├── webhook.post.ts          ← Webhook endpoint
│   └── pdf-filler.post.ts       ← PDF generation endpoint
├── server/api/                   ← ORIGINAL: Nuxt API routes
│   ├── webhook.post.ts          ← Kept for local development
│   └── pdf-filler.post.ts       ← Kept for local development
└── vercel.json                   ← Updated configuration
```

## 🔄 **Dual Directory Strategy**

### **Why This Approach?**
- **Local Development**: Uses `server/api/` (Nuxt standard)
- **Vercel Deployment**: Uses root `api/` (Vercel requirement)
- **No Code Changes**: Same files, different locations
- **Easy Maintenance**: Update one location, copy to other

## 🚀 **Deployment Steps**

### 1. **Verify File Structure**
```bash
# Check root api directory
dir api

# Check server api directory  
dir server\api

# Both should contain the same files
```

### 2. **Test Local Development**
```bash
npm run dev
# Navigate to /webhook-test
# Should work with server/api/ routes
```

### 3. **Deploy to Vercel**
```bash
vercel --prod
# Should now work with root api/ routes
```

## 📋 **Vercel Configuration**

### **Current vercel.json**
```json
{
  "functions": {
    "api/webhook.post.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/webhook",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "VERCEL": "1"
  }
}
```

## 🔧 **Maintenance Workflow**

### **When Updating API Files**
1. **Edit** the file in `server/api/` (your development location)
2. **Copy** the updated file to `api/` (Vercel deployment location)
3. **Deploy** to Vercel

### **Automated Script** (Optional)
```bash
# Create a sync script
echo "copy server\api\*.ts api\" > sync-api.bat
echo "echo API files synced!" >> sync-api.bat
```

## 🧪 **Testing the Fix**

### **Local Testing**
1. Start development server: `npm run dev`
2. Navigate to: `/webhook-test`
3. Test webhook functionality
4. Verify PDF generation works

### **Vercel Testing**
1. Deploy: `vercel --prod`
2. Test webhook endpoint: `https://your-app.vercel.app/api/webhook`
3. Verify environment detection works
4. Check response headers

## 🎯 **Expected Results**

| Environment | API Routes | PDF Generation | Status |
|-------------|------------|----------------|---------|
| **Local Dev** | `server/api/` | ✅ Full support | Working |
| **Vercel** | `api/` | ⚠️ HTML only | Working |

## 🚨 **Troubleshooting**

### **If Vercel Still Fails**
1. **Check file paths**: Ensure `api/webhook.post.ts` exists
2. **Verify syntax**: Check for TypeScript errors
3. **Clear cache**: `vercel --clear-cache`
4. **Force deploy**: `vercel --force`

### **If Local Development Fails**
1. **Check Nuxt config**: Ensure no API path overrides
2. **Restart server**: `npm run dev`
3. **Check console**: Look for import errors

## 📚 **Related Documentation**

- [WEBHOOK_README.md](./WEBHOOK_README.md) - Complete webhook documentation
- [HYBRID_APPROACH.md](./HYBRID_APPROACH.md) - Environment detection details
- [WINDOWS_TROUBLESHOOTING.md](./WINDOWS_TROUBLESHOOTING.md) - Windows-specific fixes

## 🎉 **Success Indicators**

Your Vercel deployment is working when:
- ✅ **No more path errors** in Vercel logs
- ✅ **Webhook endpoint accessible** at `/api/webhook`
- ✅ **Environment detection** shows "Vercel"
- ✅ **HTML response** with Vercel guidance (expected behavior)

## 🔄 **Next Steps**

1. **Test the fix** locally
2. **Deploy to Vercel** to verify
3. **Update documentation** if needed
4. **Consider automation** for file syncing

---

**Note**: This dual-directory approach maintains compatibility with both Nuxt development and Vercel deployment without requiring code changes.
