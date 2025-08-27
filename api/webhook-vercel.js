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
      I/We, <b>${data.NAME}</b> (NRIC NO. ${data.NRIC}) of <b>${data.ADDRESS}</b> hereby solemnly and sincerely declare as follows:
    </div>
    <ol>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;I/We declare that the Property of <b>${data.PROPERTY}</b> ("Property") shall be occupied by me/us throughout the tenor of the Facility;
    </li>
    <li class="block numbered">
      &nbsp;&nbsp;&nbsp;The Customer, <b>${data.NAME} (NRIC NO. ${data.NRIC})</b> has applied for a Facility of <b>${data.FACILITY}</b> only ("Facility") and the Bank, <b>${data.BANK}</b>, a company incorporated in Malaysia and with its registered office at <b>${data.BANK_ADDRESS}</b> with a branch office at <b>${data.BRANCH_ADDRESS}</b> (“Financier”) has agreed to part finance the purchase of the Property by way of 1st/3rd Party Legal Charge; and
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
        by <b>${data.NAME}</b><br>
        at in the State of<br>
        this <b>${data.DATE}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        ${data.NAME}<br>
        <span class="small">(NRIC NO. ${data.NRIC})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
    </div>
    <div class="page-break"></div>
    <div class="center heading-main" style="margin-top:60px;">STATUTORY DECLARATION</div><br><br>
    <div class="block text-indent-60">
      I/We, <b>${data.NAME}</b> (NRIC NO. ${data.NRIC}) of <b>${data.ADDRESS}</b> do hereby affirm and solemnly declare that date hereof, I/We am/are not an undischarged bankrupt and that no bankruptcy proceedings have been instituted against me/us under the laws of Malaysia or in anywhere else having jurisdiction over me/us and I/We do solemnly and sincerely declare that to the best of my/our knowledge there is no legal proceeding having been instituted against me/us nor any pending legal proceedings or intended legal proceedings to be brought against me/us.
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
        by <b>${data.NAME}</b><br>
        at in the State of<br>
        this <b>${data.DATE}</b>
      </div>
      <div style="width: 10px;">
        )<br>
        )<br>
        )<br>
        )
      </div>
      <div class="signature" >
        <span class="signature-line" style="margin-top:20px;"></span><br>
        ${data.NAME}<br>
        <span class="small">(NRIC NO. ${data.NRIC})</span>
      </div>
    </div>
    <div class="before-me">
      Before me,
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
        
        console.log('PDF API key found:', pdfApiKey ? `${pdfApiKey.substring(0, 10)}...` : 'NOT FOUND');
        console.log('Environment variables:', Object.keys(process.env).filter(key => key.includes('pdf')));
        
        if (!pdfApiKey) {
          console.log('PDF API key not found, falling back to HTML');
          throw new Error('PDF API key not configured');
        }
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          console.log('Making PDF request with API key:', `${pdfApiKey.substring(0, 10)}...`);
          console.log('Using html2pdf.app query parameter authentication method');
          
          // According to html2pdf.app docs, apiKey should be a query parameter
          const pdfResponse = await fetch(`https://api.html2pdf.app/v1/generate?apiKey=${encodeURIComponent(pdfApiKey)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              html: html,
              format: 'A4',
              marginTop: 75,  // 2cm in pixels (approximately)
              marginRight: 75,
              marginBottom: 75,
              marginLeft: 75,
              media: 'print'  // Use print styles for better PDF output
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
