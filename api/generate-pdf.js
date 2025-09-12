export default async function handler(req, res) {
  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Read the request body
    const body = req.body
    
    if (!body.extractedData) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: 'Missing extractedData in request body'
      })
    }

    const data = body.extractedData

    // Generate HTML content (same as in webhook-vercel.js)
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Statutory Declaration</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .block {
            margin-bottom: 15px;
            text-align: justify;
        }
        .block.final {
            margin-bottom: 30px;
        }
        .signature {
            text-align: center;
            margin-top: 20px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            display: inline-block;
            margin-bottom: 5px;
        }
        .small {
            font-size: 10pt;
        }
        .before-me {
            margin-top: 30px;
            text-align: center;
        }
        ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">STATUTORY DECLARATION</div>
    </div>
    
    <div class="block">
        I/We, <b>${data.purchasers?.[0]?.name || 'N/A'}</b> (NRIC No. <b>${data.purchasers?.[0]?.ic || 'N/A'}</b>), 
        of <b>${data.address || 'N/A'}</b>, do hereby solemnly and sincerely declare as follows:-
    </div>
    
    <div class="block">
        That I/We am/are the purchaser(s) of the property known as <b>${data.property || 'N/A'}</b> 
        and I/We am/are applying for the <b>${data.facility || 'N/A'}</b> from <b>${data.bank || 'N/A'}</b>.
    </div>
    
    <div class="block">
        That the information provided in the application form is true and correct to the best of my/our knowledge and belief.
    </div>
    
    <div class="block">
        That I/We am/are fully aware that it is a criminal offence to induce you to grant the Facility/Facilities on the basis of a false declaration.
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
            by <b>${data.purchasers?.[0]?.name || 'N/A'}</b><br>
            at in the State of<br>
            this <b>${data.date || new Date().toISOString().split('T')[0]}</b>
        </div>
        <div style="width: 10px;">
            )<br>
            )<br>
            )<br>
            )
        </div>
        <div class="signature" >
            <span class="signature-line" style="margin-top:20px;"></span><br>
            ${data.purchasers?.[0]?.name || 'N/A'}<br>
            <span class="small">(NRIC NO. ${data.purchasers?.[0]?.ic || 'N/A'})</span>
        </div>
    </div>
    
    <div class="before-me">
        Before me,
    </div>
</body>
</html>`

    // Get PDF API key from environment
    const pdfApiKey = process.env.pdf_api_key || process.env.NUXT_PDF_API_KEY
    
    if (!pdfApiKey) {
      return res.status(500).json({
        statusCode: 500,
        statusMessage: 'PDF API key not configured. Please set pdf_api_key or NUXT_PDF_API_KEY environment variable.'
      })
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      console.log('Making PDF request with API key:', `${pdfApiKey.substring(0, 10)}...`)
      
      // Use html2pdf.app service
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
          printBackground: true,
          displayHeaderFooter: false
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text()
        throw new Error(`PDF generation failed: ${pdfResponse.status} ${errorText}`)
      }

      const pdfBuffer = await pdfResponse.arrayBuffer()
      
      // Set appropriate headers for PDF download
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="statutory_declaration.pdf"')
      res.setHeader('Content-Length', pdfBuffer.byteLength)

      // Send the PDF buffer
      res.send(Buffer.from(pdfBuffer))

    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        return res.status(408).json({
          statusCode: 408,
          statusMessage: 'PDF generation timeout'
        })
      }
      throw error
    }

  } catch (error) {
    console.error('PDF generation error:', error)
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'PDF generation failed'
    })
  }
}
