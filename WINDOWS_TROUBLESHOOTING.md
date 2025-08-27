# Windows Troubleshooting Guide

## 🚨 Common Windows Issues

### 1. Chromium Path Error
```
ERROR: Failed to launch the browser process! spawn C:\Users\User\AppData\Local\Temp\chromium ENOENT
```

**Cause:** `@sparticuz/chromium` can't find the Chromium executable on Windows.

**Solutions:**

#### Option A: Install Full Puppeteer
```bash
npm uninstall puppeteer-core @sparticuz/chromium
npm install puppeteer
```

This installs the full Puppeteer package with bundled Chromium.

#### Option B: Install Chrome/Chromium Browser
1. Download and install [Google Chrome](https://www.google.com/chrome/)
2. Or install [Microsoft Edge](https://www.microsoft.com/edge/)
3. The webhook will automatically detect and use the installed browser

#### Option C: Fix Chromium Path
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install @sparticuz/chromium puppeteer-core

# Check if Chromium is properly installed
npx @sparticuz/chromium --version
```

### 2. Sandbox Permission Issues
```
ERROR: Failed to launch the browser process! ... sandbox
```

**Cause:** Windows security restrictions prevent browser sandboxing.

**Solution:** The webhook automatically adds `--no-sandbox` flags for Windows.

### 3. Memory/Process Issues
```
ERROR: Failed to launch the browser process! ... memory
```

**Cause:** Windows process limits or memory constraints.

**Solutions:**
1. **Close other applications** to free up memory
2. **Restart your development environment**
3. **Use the fallback mode** (automatic)

## 🔧 Enhanced Windows Support

The webhook now includes **automatic Windows optimization**:

### Automatic Fallback System
1. **Primary:** Try `@sparticuz/chromium`
2. **Fallback 1:** Try system Chrome/Edge with Windows-optimized flags
3. **Fallback 2:** Return HTML with troubleshooting guidance

### Windows-Specific Browser Flags
```typescript
const fallbackArgs = [
  '--no-sandbox', 
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  // Windows-specific flags
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding'
];
```

## 🚀 Quick Fixes

### 1. **Immediate Solution** (Recommended)
```bash
npm install puppeteer
```

This bypasses `@sparticuz/chromium` entirely and uses the full Puppeteer package.

### 2. **Alternative Solution**
```bash
npm install puppeteer-core
# Install Chrome/Edge browser manually
```

### 3. **Development Mode**
Use the webhook test page to verify functionality:
- Navigate to `/webhook-test`
- Check the environment detection
- Test with sample data

## 📊 Environment Detection

The webhook automatically detects your environment:

| Environment | PDF Generation | Fallback Support |
|-------------|----------------|------------------|
| **Local (Windows)** | ✅ Full support | ✅ Multiple fallbacks |
| **Local (Linux/Mac)** | ✅ Full support | ✅ Basic fallback |
| **Vercel** | ❌ Not available | ✅ HTML output |

## 🔍 Debug Information

### Check Current Setup
```bash
# Check Node.js version
node --version

# Check npm packages
npm list puppeteer puppeteer-core @sparticuz/chromium

# Check if Chrome is installed
where chrome
where msedge
```

### Webhook Logs
The webhook provides detailed logging:
```
Environment: Local/Development
Chromium executable path: C:\Users\User\AppData\Local\Temp\chromium
Chromium launch failed: [error details]
Trying fallback: launching without Chromium...
```

## 🎯 Best Practices for Windows

### 1. **Use Full Puppeteer**
```bash
npm install puppeteer  # Instead of puppeteer-core + @sparticuz/chromium
```

### 2. **Keep Chrome Updated**
- Regular Chrome updates ensure compatibility
- Edge (Chromium-based) also works well

### 3. **Development Workflow**
1. Start with `npm run dev`
2. Test webhook at `/webhook-test`
3. Check console logs for environment detection
4. Use fallback mode if needed

### 4. **Production Deployment**
- **Local/Server:** Full PDF generation
- **Vercel:** HTML output with guidance
- **Hybrid:** Automatic environment detection

## 🆘 Still Having Issues?

### 1. **Check Dependencies**
```bash
npm install --save-dev puppeteer
```

### 2. **Verify Browser Installation**
- Chrome: `chrome://version/`
- Edge: `edge://version/`

### 3. **Test with Simple Example**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","ic":"123","address":"Test","property":"Test","bank":"Test","bankAddress":"Test","branchAddress":"Test","facility":"Test","date":"2024-01-15"}' \
  --output test.pdf
```

### 4. **Check Webhook Response Headers**
Look for:
- `X-Environment: Local`
- `X-PDF-Available: true/false`
- `Content-Type: application/pdf` or `text/html`

## 📚 Related Documentation

- [WEBHOOK_README.md](./WEBHOOK_README.md) - Complete webhook documentation
- [HYBRID_APPROACH.md](./HYBRID_APPROACH.md) - Environment detection details
- [WEBHOOK_QUICKSTART.md](./WEBHOOK_QUICKSTART.md) - Quick setup guide

## 🎉 Success Indicators

Your webhook is working correctly when you see:
- ✅ **Local Development:** PDF downloads automatically
- ✅ **Vercel Deployment:** HTML opens in browser
- ✅ **Environment Detection:** Correct headers in response
- ✅ **Fallback Support:** Graceful degradation on errors
