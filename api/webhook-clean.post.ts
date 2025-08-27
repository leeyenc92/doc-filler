export default defineEventHandler(async (event: any) => {
  try {
    // Verify the request method
    if (event.method !== 'POST') {
      return {
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      };
    }

    // Read the webhook payload
    const body = await readBody(event);
    
    // Log the incoming webhook data for debugging
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    console.log('Environment:', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');

    // Extract data from the webhook payload
    const webhookData = body.data || body.payload || body || {};
    
    // Map the webhook data to our form structure
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
      return {
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`
      };
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

    // Generate HTML content
    const html = `
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
    .center { text-align: center; }
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
    .text-indent-60 { text-indent: 60px; }
  </style>
</head>
<body>
  <div class="center heading-main">STATUTORY DECLARATION</div>
  <div class="center heading-sub">[Residential Property for Owner Occupation]</div>
  <div class="block text-indent-60">
    I/We, <b>${data.NAME}</b> (NRIC NO. ${data.NRIC}) of <b>${data.ADDRESS}</b> hereby solemnly and sincerely declare as follows:
  </div>
  <div class="block">
    This is a simplified version of the statutory declaration. The full document would contain all the legal text and formatting.
  </div>
  <div class="block">
    <strong>Data Received:</strong><br>
    Name: ${data.NAME}<br>
    NRIC: ${data.NRIC}<br>
    Address: ${data.ADDRESS}<br>
    Property: ${data.PROPERTY}<br>
    Bank: ${data.BANK}<br>
    Facility: ${data.FACILITY}<br>
    Date: ${data.DATE}
  </div>
  <div class="block">
    <strong>Environment:</strong> ${process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development'}
  </div>
</body>
</html>`;

    // Set response headers
    event.node.res.setHeader('Content-Type', 'text/html');
    event.node.res.setHeader('X-Environment', process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development');
    event.node.res.setHeader('X-PDF-Available', 'false');
    
    return html;
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    return {
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        message: error.message || 'An error occurred while processing the webhook',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local/Development'
      }
    };
  }
});
