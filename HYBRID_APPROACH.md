# Hybrid Webhook Approach

## 🎯 Overview

The Legal Document Filler webhook now uses a **hybrid approach** that automatically adapts to different deployment environments:

- **Local Development:** Full PDF generation with Puppeteer
- **Vercel Deployment:** HTML output with deployment guidance
- **Automatic Detection:** Environment-aware behavior

## 🔧 How It Works

### 1. Environment Detection
```typescript
const isVercel = process.env.VERCEL === '1';
```

The webhook checks the `VERCEL` environment variable to determine the deployment environment.

### 2. Conditional Imports
```typescript
// Only import Puppeteer dependencies in non-Vercel environments
if (process.env.VERCEL !== '1') {
  try {
    chromium = await import('@sparticuz/chromium');
    puppeteer = await import('puppeteer-core');
  } catch (error: any) {
    console.warn('Puppeteer dependencies not available:', error.message);
  }
}
```

Puppeteer dependencies are only loaded when not running on Vercel.

### 3. Environment-Specific Responses

#### Local Development
```typescript
if (!isVercel) {
  // Generate PDF with Puppeteer
  const browser = await puppeteer.default.launch({...});
  const pdfBuffer = await page.pdf({ format: 'a4', printBackground: true });
  
  event.node.res.setHeader('Content-Type', 'application/pdf');
  event.node.res.setHeader('X-Environment', 'Local');
  event.node.res.setHeader('X-PDF-Available', 'true');
  
  return Buffer.from(pdfBuffer);
}
```

#### Vercel Deployment
```typescript
if (isVercel) {
  // Return HTML with deployment guidance
  const vercelNote = `...deployment guidance HTML...`;
  const fullHtml = html + vercelNote;
  
  event.node.res.setHeader('Content-Type', 'text/html');
  event.node.res.setHeader('X-Environment', 'Vercel');
  event.node.res.setHeader('X-PDF-Available', 'false');
  
  return fullHtml;
}
```

## 📊 Response Comparison

| Aspect | Local Development | Vercel Deployment |
|--------|------------------|-------------------|
| **Content-Type** | `application/pdf` | `text/html` |
| **Response** | PDF binary data | HTML with guidance |
| **PDF Generation** | ✅ Full support | ❌ Not available |
| **Performance** | Slower (Puppeteer) | Fast (HTML only) |
| **Dependencies** | Puppeteer + Chromium | None |
| **File Size** | Variable (PDF) | Small (HTML) |
| **Use Case** | Production PDFs | Development/Testing |

## 🚀 Benefits

### For Developers
- **Single Codebase:** No need to maintain separate versions
- **Easy Testing:** Works the same locally and on Vercel
- **Gradual Migration:** Can add external PDF services later
- **Clear Feedback:** Vercel responses include helpful guidance

### For Deployment
- **Vercel Compatible:** No serverless limitations
- **Fast Response:** HTML generation is much faster
- **Cost Effective:** No heavy dependencies
- **Scalable:** Handles high traffic easily

## 🔄 Migration Path

### Phase 1: Hybrid Approach (Current)
- ✅ Works on both environments
- ✅ Automatic detection
- ⚠️ Vercel returns HTML only

### Phase 2: External PDF Service
- ✅ Add Puppeteer Cloud/Browserless integration
- ✅ Full PDF support on Vercel
- ✅ Maintain hybrid compatibility

### Phase 3: Client-Side PDF
- ✅ Use jsPDF or html2pdf.js
- ✅ Generate PDFs in the browser
- ✅ Reduce server load

## 🛠️ Configuration

### Local Development
```bash
npm run dev
# VERCEL environment variable not set
# Full PDF generation available
```

### Vercel Deployment
```bash
vercel --prod
# VERCEL=1 automatically set
# HTML output with guidance
```

### Custom Environment
```bash
# Force Vercel mode locally
VERCEL=1 npm run dev

# Force local mode on Vercel (not recommended)
# Remove VERCEL=1 from vercel.json
```

## 📝 Response Headers

### Local Development
```
Content-Type: application/pdf
X-Environment: Local
X-PDF-Available: true
Content-Disposition: attachment; filename="CustomerName_SD_Webhook.pdf"
```

### Vercel Deployment
```
Content-Type: text/html
X-Environment: Vercel
X-PDF-Available: false
```

## 🔍 Debugging

### Check Environment
```typescript
console.log('Environment:', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');
```

### Check Dependencies
```typescript
console.log('Puppeteer available:', !!puppeteer);
console.log('Chromium available:', !!chromium);
```

### Response Headers
Check the `X-Environment` and `X-PDF-Available` headers to understand the current mode.

## 🎯 Best Practices

### Development
1. **Test Both Modes:** Use `VERCEL=1` to test Vercel behavior locally
2. **Monitor Logs:** Check console output for environment detection
3. **Validate Responses:** Ensure both modes return appropriate content

### Production
1. **External Services:** Integrate with Puppeteer Cloud or Browserless
2. **Client-Side PDF:** Consider browser-based PDF generation
3. **Monitoring:** Track which environment is being used
4. **Fallbacks:** Provide alternative PDF generation methods

## 🚨 Limitations

### Vercel Mode
- ❌ No PDF generation
- ❌ HTML output only
- ❌ Requires client-side processing
- ❌ Limited to 10-second timeout

### Local Mode
- ❌ Requires Puppeteer dependencies
- ❌ Slower response times
- ❌ Higher memory usage
- ❌ Platform-specific issues

## 🔮 Future Enhancements

1. **External PDF Service Integration**
2. **Client-Side PDF Generation**
3. **Edge Runtime Support**
4. **Multiple PDF Service Fallbacks**
5. **Caching and Optimization**

## 📚 Related Documentation

- [WEBHOOK_README.md](./WEBHOOK_README.md) - Complete webhook documentation
- [WEBHOOK_QUICKSTART.md](./WEBHOOK_QUICKSTART.md) - Quick setup guide
- [vercel.json](./vercel.json) - Vercel configuration
- [n8n-workflow-example.json](./n8n-workflow-example.json) - n8n integration example
