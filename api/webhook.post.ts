import { readBody, createError } from 'h3'

// Conditional imports for hybrid approach
let chromium: any = null;
let puppeteer: any = null;

// Function to load Puppeteer dependencies
async function loadPuppeteerDependencies() {
  // Skip loading Puppeteer on Vercel
  if (process.env.VERCEL === '1') {
    console.log('Running on Vercel - skipping Puppeteer dependencies');
    return;
  }
  
  try {
         // Use dynamic import for ES module compatibility
     const chromiumModule = await import('@sparticuz/chromium');
     const puppeteerModule = await import('puppeteer-core');
    
    chromium = chromiumModule;
    puppeteer = puppeteerModule;
    console.log('Puppeteer dependencies loaded successfully');
  } catch (error: any) {
    console.warn('Puppeteer dependencies not available:', error.message);
  }
}

export default defineEventHandler(async (event: any) => {
  try {
    // Load dependencies at runtime (only on non-Vercel environments)
    await loadPuppeteerDependencies();
    
    // Verify the request method
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      });
    }

    // Read the webhook payload
    const body = await readBody(event);
    
    // Log the incoming webhook data for debugging
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    console.log('Environment:', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');

    // Extract data from the webhook payload
    // n8n can send data in various formats, so we'll be flexible
    const webhookData = body.data || body.payload || body || {};
    
    // Map the webhook data to our form structure
    // Support both direct field mapping and nested structures
    const formData: any = {
      purchasers: Array.isArray(webhookData.purchasers) 
        ? webhookData.purchasers 
        : webhookData.purchaser 
        ? [webhookData.purchaser]
        : [{
            name: webhookData.name || webhookData.purchaserName || webhookData.customerName || '',
            ic: webhookData.ic || webhookData.nric || webhookData.icNumber || webhookData.customerIc || ''
          }],
      address: webhookData.address || webhookData.customerAddress || '',
      property: webhookData.property || webhookData.propertyDetails || webhookData.propertyAddress || '',
      bank: webhookData.bank || webhookData.bankName || '',
      bankAddress: webhookData.bankAddress || webhookData.bankRegisteredAddress || '',
      branchAddress: webhookData.branchAddress || webhookData.branchOfficeAddress || '',
      facility: webhookData.facility || webhookData.facilityType || webhookData.loanType || '',
      date: webhookData.date || webhookData.declarationDate || new Date().toISOString().split('T')[0]
    };

    // Validate required fields
    const requiredFields = ['purchasers', 'address', 'property', 'bank', 'bankAddress', 'branchAddress', 'facility', 'date'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'purchasers') {
        return !formData.purchasers || formData.purchasers.length === 0 || 
               !formData.purchasers[0].name || !formData.purchasers[0].ic;
      }
      return !formData[field];
    });

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Generate data for document
    const firstPurchaser = formData.purchasers[0];
    const data = {
      NAME: firstPurchaser.name,
      NRIC: firstPurchaser.ic,
      ADDRESS: formData.address,
      PROPERTY: formData.property,
      BANK: formData.bank,
      BANK_ADDRESS: formData.bankAddress,
      BRANCH_ADDRESS: formData.branchAddress,
      FACILITY: formData.facility,
      DATE: formData.date,
    };

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statutory Declaration</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      margin: 60px 50px 60px 70px;
      color: #000;
    }
    .center {
      text-align: center;
    }
    .italic {
      font-style: italic;
    }
    .heading-main {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 0;
      letter-spacing: 1px;
      text-decoration: underline;
    }
    .heading-sub {
      font-size: 12pt;
      margin-top: 0;
      margin-bottom: 30px;
      
    }
    .block {
      margin-bottom: 18px;
      text-align: justify;
      text-justify: inter-word;
    }
    .numbered {
      margin-bottom: 12px;
    }
    .final {
      margin-top: 24px;
    }
    .signature {
      margin-top: 40px;
      text-align: left;
    }
    .signature-line {
      display: inline-block;
      border-bottom: 1px dotted #000;
      width: 220px;
      height: 18px;
      margin-bottom: 2px;
    }
    .before-me {
      margin-top: 40px;
      text-align: center;
    }
    .page-break {
      page-break-before: always;
    }
    .small {
      font-size: 10pt;
    }
    .text-indent-60{    
      text-indent: 60px;
    }
    ol{
      padding-inline-start: 15px;
    }
    ol li::marker {
      content: counter(list-item) ")";
    }
  </style>
</head>
<body>
    <div class="center heading-main">STATUTORY DECLARATION</div>
    <div class="center heading-sub">[Residential Property for Owner Occupation]</div>
    <div class="block text-indent-60">
      I/We, <b>{{NAME}}</b> (NRIC NO. {{NRIC}}) of <b>{{ADDRESS}}</b> hereby solemnly and sincerely declare as follows:
    </div>
    <ol>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;I/We declare that the Property of <b>{{PROPERTY}}</b> ("Property") shall be occupied by me/us throughout the tenor of the Facility;
    </li>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;The Customer, <b>{{NAME}} (NRIC NO. {{NRIC}})</b> has applied for a Facility of <b>{{FACILITY}}</b> only ("Facility") and the Bank, <b>{{BANK}}</b>, a company incorporated in Malaysia and with its registered office at <b>{{BANK_ADDRESS}}</b> with a branch office at <b>{{BRANCH_ADDRESS}}</b> ("Financier") has agreed to part finance the purchase of the Property by way of 1st/3rd Party Legal Charge; and
    </li>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;I/We am/are fully aware that the declaration made herein is material to the Financier in its granting and/or allowing the utilization or disbursement of the Facility. I/We am/are also fully aware that if this declaration is tendered as evidence, I/We shall be liable to prosecution if I/We have willfully state anything herein which I/We know is false or do not believe in.
    </li>
    </ol>
    <div class="block final">
      And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.
    </div>
    <div class="" style="display:flex; align-items: flex-start;">
      <div class="block" style="width: 320px;">
        Subscribed and solemnly declared<br>
        by <b>{{NAME}}</b><br>
        at in the State of<br>
        this <b>{{DATE}}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        {{NAME}}<br>
        <span class="small">(NRIC NO. {{NRIC}})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
    </div>
    <div class="page-break"></div>
    <div class="center heading-main" style="margin-top:60px;">STATUTORY DECLARATION</div><br><br>
    <div class="block text-indent-60">
      I/We, <b>{{NAME}}</b> (NRIC NO. {{NRIC}}) of <b>{{ADDRESS}}</b> do hereby affirm and solemnly declare that date hereof, I/We am/are not an undischarged bankrupt and that no bankruptcy proceedings have been instituted against me/us under the laws of Malaysia or in anywhere else having jurisdiction over me/us and I/We do solemnly and sincerely declare that to the best of my/our knowledge there is no legal proceeding having been instituted against me/us nor any pending legal proceedings or intended legal proceedings to be brought against me/us.
    </div>
    <div class="block text-indent-60">
      I/We, make this declaration in full knowledge and awareness of your reliance on this declaration as an inducement or basis to grant/continue to grant the Facility /Facilities (as defined in the Letter of Offer) to me/us and/or to a third party for whom I/we shall be acting as Chargor and/or Guarantor and/or Assignor in your favour.
    </div>
    <div class="block text-indent-60">
      I/We am/are fully aware that it is a criminal offence to induce you to grant the Facility/Facilities on the basis of a false declaration.
    </div>
    <div class="block">
      I/We am/are also aware that the penal consequences for making a false declaration in respect of the above may include: -
      <br>
      <ol>
        <li>
        &nbsp;&nbsp;&nbsp;imprisonment for term not exceeding 3 years and shall also be liable to a fine pursuant to Section 193 of the Penal Code read together with section 199 of the Penal code; or   
        </li>
        <li>
        &nbsp;&nbsp;&nbsp;imprisonment for a term not less than 1 year and not exceeding 10 years and with whipping and shall also be liable to a fine pursuant to Section 420 of the Penal Code.   
        </li>
      </ol>
     </div>
    <div class="block final">
      And I/We make this solemn declaration conscientiously believing the same to be true and by virtue of the provisions of the Statutory Declarations Act, 1960.
    </div>
    <div class="" style="display:flex; align-items: flex-start;">
      <div class="block" style="width: 320px;">
        Subscribed and solemnly declared<br>
        by <b>{{NAME}}</b><br>
        at in the State of<br>
        this <b>{{DATE}}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        {{NAME}}<br>
        <span class="small">(NRIC NO. {{NRIC}})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
    </div>
</body>
</html>
`;

    // Replace placeholders with form data
    html = html.replace(/{{(\w+)}}/g, (_, key: string) => (data as any)[key] || '');

    // Check if running on Vercel
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Vercel-compatible approach - return HTML with instructions
      console.log('Running on Vercel - returning HTML instead of PDF');
      
      // Add a note about Vercel limitations
      const vercelNote = `
        <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-left: 4px solid #0070f3;">
          <h3>⚠️ Vercel Deployment Notice</h3>
          <p>This webhook is running on Vercel. For PDF generation, consider:</p>
          <ul>
            <li>Using an external PDF service (Puppeteer Cloud, Browserless)</li>
            <li>Converting HTML to PDF on the client side</li>
            <li>Using Vercel's Edge Runtime with compatible PDF libraries</li>
          </ul>
          <p><strong>Current Response:</strong> HTML content (not PDF)</p>
        </div>
      `;
      
      const fullHtml = html + vercelNote;
      
      event.node.res.setHeader('Content-Type', 'text/html');
      event.node.res.setHeader('X-Environment', 'Vercel');
      event.node.res.setHeader('X-PDF-Available', 'false');
      
      return fullHtml;
      
    } else {
             // Local development with Puppeteer
       if (!puppeteer || !chromium) {
         throw createError({
           statusCode: 500,
           statusMessage: 'Puppeteer dependencies not available',
           data: {
             message: 'Puppeteer is required for local PDF generation',
             timestamp: new Date().toISOString()
           }
         });
       }
       
       console.log('Running locally - generating PDF with Puppeteer');
       
       try {
         // Try to get Chromium executable path
         const executablePath = await chromium.default.executablePath();
         console.log('Chromium executable path:', executablePath);
         
         // Launch Puppeteer with Chromium
         const browser = await puppeteer.default.launch({
           args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
           executablePath: executablePath,
           headless: chromium.default.headless,
           ignoreDefaultArgs: chromium.default.ignoreDefaultArgs,
         });
         
         const page = await browser.newPage();
         await page.setContent(html, { waitUntil: 'networkidle0' });
         const pdfBuffer = await page.pdf({ format: 'a4', printBackground: true });
         await browser.close();
         
         // Set response headers
         event.node.res.setHeader('Content-Type', 'application/pdf');
         event.node.res.setHeader('X-Environment', 'Local');
         event.node.res.setHeader('X-PDF-Available', 'true');
         
         // Sanitize name for filename
         let safeName = (data.NAME || '').replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '_').trim();
         if (!safeName) safeName = 'StatutoryDeclaration';
         const filename = `${safeName}_SD_Webhook.pdf`;
         event.node.res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
         
         // Return the PDF buffer
         return Buffer.from(pdfBuffer);
         
       } catch (chromiumError: any) {
         console.error('Chromium launch failed:', chromiumError);
         
                   // Fallback: Try launching without Chromium (system Chrome)
          try {
            console.log('Trying fallback: launching without Chromium...');
            
                         // Try to find system Chrome/Edge
             const { execSync } = await import('child_process');
            let executablePath = null;
            
            try {
              if (process.platform === 'win32') {
                // Windows: Check common Chrome/Edge paths
                const possiblePaths = [
                  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                  process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe'
                ];
                
                for (const path of possiblePaths) {
                  try {
                    execSync(`"${path}" --version`, { stdio: 'ignore' });
                    executablePath = path;
                    console.log('Found browser at:', executablePath);
                    break;
                  } catch (e) {
                    // Path doesn't exist or browser not accessible
                  }
                }
              } else {
                // Linux/Mac: Try to find Chrome/Chromium
                try {
                  execSync('google-chrome --version', { stdio: 'ignore' });
                  executablePath = 'google-chrome';
                } catch (e) {
                  try {
                    execSync('chromium --version', { stdio: 'ignore' });
                    executablePath = 'chromium';
                  } catch (e) {
                    // No system browser found
                  }
                }
              }
            } catch (e) {
              console.log('Could not detect system browser automatically');
            }
            
            if (!executablePath) {
              throw new Error('No system browser found. Please install Chrome/Edge or use full Puppeteer package.');
            }
            
            // Windows-specific fallback options
            const isWindows = process.platform === 'win32';
            const fallbackArgs = [
              '--no-sandbox', 
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--no-first-run',
              '--no-zygote',
              '--single-process'
            ];
            
            if (isWindows) {
              fallbackArgs.push('--disable-background-timer-throttling');
              fallbackArgs.push('--disable-backgrounding-occluded-windows');
              fallbackArgs.push('--disable-renderer-backgrounding');
            }
            
            const browser = await puppeteer.default.launch({
              headless: true,
              executablePath: executablePath,
              args: fallbackArgs
            });
           
           const page = await browser.newPage();
           await page.setContent(html, { waitUntil: 'networkidle0' });
           const pdfBuffer = await page.pdf({ format: 'a4', printBackground: true });
           await browser.close();
           
           // Set response headers
           event.node.res.setHeader('Content-Type', 'application/pdf');
           event.node.res.setHeader('X-Environment', 'Local (Fallback)');
           event.node.res.setHeader('X-PDF-Available', 'true');
           
           // Sanitize name for filename
           let safeName = (data.NAME || '').replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '_').trim();
           if (!safeName) safeName = 'StatutoryDeclaration';
           const filename = `${safeName}_SD_Webhook.pdf`;
           event.node.res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
           
           // Return the PDF buffer
           return Buffer.from(pdfBuffer);
           
         } catch (fallbackError: any) {
           console.error('Fallback launch also failed:', fallbackError);
           
                       // If both fail, return HTML with error guidance
            const errorNote = `
              <div style="background: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>⚠️ PDF Generation Failed</h3>
                <p>PDF generation failed on local development. Error: ${chromiumError.message}</p>
                <p><strong>Immediate Solutions:</strong></p>
                <ol>
                  <li><strong>Install Full Puppeteer (Recommended):</strong><br>
                      <code>npm uninstall puppeteer-core @sparticuz/chromium</code><br>
                      <code>npm install puppeteer</code></li>
                  <li><strong>Install System Browser:</strong><br>
                      Download and install <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a> or <a href="https://www.microsoft.com/edge/" target="_blank">Microsoft Edge</a></li>
                  <li><strong>Check Current Setup:</strong><br>
                      <code>npm list puppeteer puppeteer-core @sparticuz/chromium</code></li>
                </ol>
                <p><strong>Why This Happens:</strong></p>
                <ul>
                  <li><code>puppeteer-core</code> requires explicit browser path</li>
                  <li><code>@sparticuz/chromium</code> has Windows path issues</li>
                  <li>Full <code>puppeteer</code> package includes bundled Chromium</li>
                </ul>
                <p><strong>Current Response:</strong> HTML content (PDF generation failed)</p>
                <p><strong>Next Steps:</strong> Restart your development server after installing dependencies</p>
              </div>
            `;
           
           const fullHtml = html + errorNote;
           
           event.node.res.setHeader('Content-Type', 'text/html');
           event.node.res.setHeader('X-Environment', 'Local (Error)');
           event.node.res.setHeader('X-PDF-Available', 'false');
           
           return fullHtml;
         }
       }
     }
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
