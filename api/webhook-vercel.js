export default async function handler(req, res) {
  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      });
    }

    // Read the webhook payload
    const body = req.body;
    
    // Log the incoming webhook data for debugging
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    console.log('Environment:', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');

    // Extract data from the webhook payload
    const webhookData = body.data || body.payload || body || {};
    
    // Map the webhook data to our form structure
    const formData = {
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
      return res.status(400).json({
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

    // Generate HTML content with proper styling for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Statutory Declaration - ${data.NAME}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 2cm;
    }
    .title {
      font-size: 16pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 0.5cm;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 12pt;
      margin-bottom: 0;
    }
    .content {
      text-align: justify;
      margin-bottom: 1cm;
    }
    .indent {
      text-indent: 2cm;
    }
    .signature-section {
      margin-top: 3cm;
      text-align: right;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 6cm;
      display: inline-block;
      margin-top: 0.5cm;
    }
    .footer {
      margin-top: 2cm;
      font-size: 10pt;
      text-align: center;
      color: #666;
    }
    .data-summary {
      background: #f9f9f9;
      padding: 1cm;
      border: 1px solid #ddd;
      margin: 1cm 0;
      border-radius: 5px;
    }
    .data-summary h3 {
      margin-top: 0;
      color: #333;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5cm;
    }
    .data-label {
      font-weight: bold;
      width: 30%;
    }
    .data-value {
      width: 65%;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">STATUTORY DECLARATION</div>
    <div class="subtitle">[Residential Property for Owner Occupation]</div>
  </div>

  <div class="content indent">
    I/We, <strong>${data.NAME}</strong> (NRIC NO. <strong>${data.NRIC}</strong>) of <strong>${data.ADDRESS}</strong> hereby solemnly and sincerely declare as follows:
  </div>

  <div class="content">
    That I/We am/are the purchaser(s) of the residential property located at <strong>${data.PROPERTY}</strong> and I/We hereby declare that:
  </div>

  <div class="content">
    1. The said property will be used for owner occupation purposes only.
  </div>

  <div class="content">
    2. I/We have obtained financing from <strong>${data.BANK}</strong> for the purchase of the said property.
  </div>

  <div class="content">
    3. The financing facility is a <strong>${data.FACILITY}</strong> and the bank's registered address is <strong>${data.BANK_ADDRESS}</strong>.
  </div>

  <div class="content">
    4. The branch office handling this facility is located at <strong>${data.BRANCH_ADDRESS}</strong>.
  </div>

  <div class="content">
    5. I/We understand that this declaration is made under penalty of perjury and may be used as evidence in any legal proceedings.
  </div>

  <div class="data-summary">
    <h3>Declaration Summary</h3>
    <div class="data-row">
      <span class="data-label">Declarant Name:</span>
      <span class="data-value">${data.NAME}</span>
    </div>
    <div class="data-row">
      <span class="data-label">NRIC Number:</span>
      <span class="data-value">${data.NRIC}</span>
    </div>
    <div class="data-row">
      <span class="data-label">Property Address:</span>
      <span class="data-value">${data.PROPERTY}</span>
    </div>
    <div class="data-row">
      <span class="data-label">Bank:</span>
      <span class="data-value">${data.BANK}</span>
    </div>
    <div class="data-row">
      <span class="data-label">Facility Type:</span>
      <span class="data-value">${data.FACILITY}</span>
    </div>
    <div class="data-row">
      <span class="data-label">Declaration Date:</span>
      <span class="data-value">${data.DATE}</span>
    </div>
  </div>

  <div class="signature-section">
    <div>Dated this ${data.DATE}</div>
    <div class="signature-line"></div>
    <div>Signature of Declarant</div>
  </div>

  <div class="footer">
    <p>This document was generated electronically on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    <p>Environment: ${process.env.VERCEL === '1' ? 'Vercel Production' : 'Local Development'}</p>
  </div>
</body>
</html>`;

    // Check if PDF is requested via query parameter or header
    const requestPDF = req.query.format === 'pdf' || req.headers['accept'] === 'application/pdf';
    
    if (requestPDF) {
      try {
        // Use a PDF generation service (you can choose one of these options)
        let pdfBuffer;
        
        // Use html2pdf.app service with API key
        const pdfApiKey = process.env['pdf_api_key'];
        
        if (!pdfApiKey) {
          console.log('PDF API key not found, falling back to HTML');
          throw new Error('PDF API key not configured');
        }
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pdfApiKey}`
            },
            body: JSON.stringify({
              html: html,
              options: {
                format: 'A4',
                margin: '2cm',
                printBackground: true
              }
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (pdfResponse.ok) {
            pdfBuffer = await pdfResponse.arrayBuffer();
            
            // Set PDF response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Statutory_Declaration_${data.NAME.replace(/\s+/g, '_')}.pdf"`);
            res.setHeader('X-Environment', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');
            res.setHeader('X-PDF-Available', 'true');
            res.setHeader('X-Module-System', 'Pure JavaScript');
            
            // Send PDF response
            res.status(200).send(Buffer.from(pdfBuffer));
            return;
          } else {
            const errorText = await pdfResponse.text();
            console.log(`PDF service failed with status ${pdfResponse.status}: ${errorText}`);
            throw new Error(`PDF service error: ${pdfResponse.status}`);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            console.log('PDF generation timed out, falling back to HTML');
          } else {
            console.log('PDF generation failed, falling back to HTML:', fetchError.message);
          }
        }
      } catch (pdfError) {
        console.log('PDF generation failed, falling back to HTML:', pdfError.message);
      }
    }
    
    // Fallback to HTML response
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Environment', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');
    res.setHeader('X-PDF-Available', 'true');
    res.setHeader('X-Module-System', 'Pure JavaScript');
    
    // Send HTML response
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    res.status(500).json({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while processing the webhook',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development',
        moduleSystem: 'Pure JavaScript'
      }
    });
  }
}
