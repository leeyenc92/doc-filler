<template>
  <div class="pdf-upload-page">
    <div class="container">
      <h1 class="title">PDF Document Extraction</h1>
      <p class="subtitle">Upload a PDF file to extract data using AI-powered document processing</p>
      
      <div class="upload-section">
        <h2>Upload PDF Document</h2>
        <p>Supported formats: PDF files up to 10MB</p>
        
        <div class="upload-area" 
             :class="{ 'dragover': isDragOver, 'has-file': selectedFile }"
             @drop="handleDrop"
             @dragover.prevent="isDragOver = true"
             @dragleave.prevent="isDragOver = false"
             @click="triggerFileInput">
          
          <div v-if="!selectedFile" class="upload-placeholder">
            <VIcon name="upload" size="large" />
            <p>Drag and drop your PDF here or click to browse</p>
            <p class="upload-hint">Maximum file size: 10MB</p>
          </div>
          
          <div v-else class="file-info">
            <VIcon name="file-pdf" size="large" color="danger" />
            <div class="file-details">
              <h3>{{ selectedFile.name }}</h3>
              <p>{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <VButton 
              type="button" 
              color="danger" 
              outlined 
              @click.stop="removeFile"
            >
              Remove
            </VButton>
          </div>
        </div>
        
        <input 
          ref="fileInput"
          type="file" 
          accept=".pdf"
          @change="handleFileSelect"
          style="display: none"
        />
        
        <div class="upload-actions">
          <VButton 
            :disabled="!selectedFile || isProcessing"
            :loading="isProcessing"
            type="button" 
            color="primary" 
            bold 
            raised
            @click="processDocument"
          >
            {{ isProcessing ? 'Processing...' : 'Extract Document Data' }}
          </VButton>
          
          <VButton 
            v-if="selectedFile && !isProcessing"
            type="button" 
            color="info" 
            outlined
            @click="previewFile"
          >
            Preview PDF
          </VButton>
        </div>
      </div>
      
      <div v-if="result" class="result success">
        <VIcon name="check" />
        <span>{{ result }}</span>
      </div>
      
      <div v-if="error" class="result error">
        <VIcon name="alert" />
        <span>{{ error }}</span>
      </div>
      
      <div v-if="extractedData" class="extracted-data">
        <h2>Extracted Data</h2>
        <div class="data-grid">
          <div v-for="(value, key) in extractedData" :key="key" class="data-item">
            <strong>{{ formatFieldName(key) }}:</strong>
            <span>{{ value || 'Not found' }}</span>
          </div>
        </div>
        
        <div class="data-actions">
          <VButton 
            type="button" 
            color="success" 
            outlined
            @click="downloadData"
          >
            Download JSON
          </VButton>
          
          <VButton 
            type="button" 
            color="info" 
            outlined
            @click="copyToClipboard"
          >
            Copy to Clipboard
          </VButton>
          
          <VButton 
            type="button" 
            color="primary" 
            :loading="isGeneratingPdf"
            @click="generatePDF"
          >
            {{ isGeneratingPdf ? 'Generating PDF...' : 'Generate PDF' }}
          </VButton>
        </div>
      </div>
      
      <div class="info-section">
        <h2>How It Works</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>1. Upload:</strong>
            <span>Select or drag & drop your PDF file</span>
          </div>
          <div class="info-item">
            <strong>2. Process:</strong>
            <span>AI extracts data using advanced OCR and NLP</span>
          </div>
          <div class="info-item">
            <strong>3. Extract:</strong>
            <span>Get structured data in JSON format</span>
          </div>
          <div class="info-item">
            <strong>4. Generate:</strong>
            <span>Create a formatted PDF document from extracted data</span>
          </div>
          <div class="info-item">
            <strong>5. Use:</strong>
            <span>Download PDF, JSON data, or copy for your workflows</span>
          </div>
        </div>
      </div>
      
      <div class="webhook-info">
        <h2>Webhook Integration</h2>
        <p>This feature integrates with your n8n workflow at:</p>
        <code class="webhook-url">https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction</code>
        
        <div class="webhook-details">
          <h3>Request Format:</h3>
          <pre><code>POST /webhook-test/doc-extraction
Content-Type: multipart/form-data

{
  "file": PDF file (binary),
  "filename": "document.pdf",
  "timestamp": "2024-01-01T00:00:00Z"
}</code></pre>
          
          <h3>Expected Response Format:</h3>
          <pre><code>{
  "success": true,
  "data": {
    "extracted_fields": {...},
    "confidence": 0.95,
    "processing_time": "2.3s"
  }
}</code></pre>
          
          <h3>Troubleshooting:</h3>
          <div class="troubleshooting">
            <div class="trouble-item">
              <strong>"Workflow was started" error:</strong>
              <span>Your n8n workflow is triggering but not returning data. Check that your workflow has a "Respond to Webhook" node that returns the extracted data.</span>
            </div>
            <div class="trouble-item">
              <strong>Timeout errors:</strong>
              <span>The system will retry up to 3 times with exponential backoff. Check your n8n workflow performance.</span>
            </div>
            <div class="trouble-item">
              <strong>Invalid JSON response:</strong>
              <span>Ensure your n8n workflow returns valid JSON. Check the browser console for detailed error logs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useState, onMounted } from '#imports'

const pageTitle = useState('page-title')
onMounted(() => {
  pageTitle.value = 'PDF Document Extraction'
})

// File handling
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const isProcessing = ref(false)

// Results
const result = ref('')
const error = ref('')
const extractedData = ref<any>(null)
const isGeneratingPdf = ref(false)

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    validateAndSetFile(file)
  }
}

function validateAndSetFile(file: File) {
  // Check file type
  if (file.type !== 'application/pdf') {
    error.value = 'Please select a valid PDF file'
    return
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File size must be less than 10MB'
    return
  }
  
  selectedFile.value = file
  error.value = ''
  result.value = ''
  extractedData.value = null
}

function removeFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function previewFile() {
  if (selectedFile.value) {
    const url = URL.createObjectURL(selectedFile.value)
    window.open(url, '_blank')
  }
}

async function processDocument() {
  if (!selectedFile.value) return
  
  isProcessing.value = true
  error.value = ''
  result.value = ''
  extractedData.value = null
  
  // Retry mechanism for n8n webhook issues
  const maxRetries = 3
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`)
      
      const result = await processDocumentAttempt()
      if (result) {
        return result
      }
    } catch (err) {
      lastError = err
      console.error(`Attempt ${attempt} failed:`, err)
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // All retries failed
  error.value = lastError instanceof Error ? lastError.message : String(lastError)
  console.error('Document processing failed after all retries:', lastError)
  isProcessing.value = false
}

async function processDocumentAttempt() {
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('filename', selectedFile.value.name)
  formData.append('timestamp', new Date().toISOString())
  
  const response = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction', {
    method: 'POST',
    body: formData
  })
  
  console.log('Response status:', response.status)
  console.log('Response headers:', Object.fromEntries(response.headers.entries()))
  
  if (!response.ok) {
    const errorData = await response.text()
    console.error('Error response:', errorData)
    throw new Error(`HTTP ${response.status}: ${errorData}`)
  }
  
  const responseText = await response.text()
  console.log('Raw response:', responseText)
  
  let data
  try {
    data = JSON.parse(responseText)
  } catch (parseError) {
    console.error('JSON parse error:', parseError)
    throw new Error(`Invalid JSON response: ${responseText}`)
  }
  
  console.log('Parsed data:', data)
  
  // Handle different response formats from n8n
  if (data.success) {
    extractedData.value = data.data.extracted_fields || data.data
    result.value = `Document processed successfully! Extracted ${Object.keys(extractedData.value).length} fields.`
    isProcessing.value = false
    return true
  } else if (data.message && data.message.includes('Workflow was started')) {
    // n8n webhook started but didn't return data immediately
    throw new Error('Workflow started but no data returned. Please check your n8n workflow configuration.')
  } else if (data.data) {
    // Direct data response
    extractedData.value = data.data.extracted_fields || data.data
    result.value = `Document processed successfully! Extracted ${Object.keys(extractedData.value).length} fields.`
    isProcessing.value = false
    return true
  } else {
    throw new Error(data.message || data.error || 'Document processing failed - no data received')
  }
}

function formatFieldName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function downloadData() {
  if (!extractedData.value) return
  
  const dataStr = JSON.stringify(extractedData.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `extracted_data_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyToClipboard() {
  if (!extractedData.value) return
  
  try {
    const dataStr = JSON.stringify(extractedData.value, null, 2)
    await navigator.clipboard.writeText(dataStr)
    result.value = 'Data copied to clipboard!'
  } catch (err) {
    error.value = 'Failed to copy to clipboard'
  }
}

async function generatePDF() {
  if (!extractedData.value) return
  
  isGeneratingPdf.value = true
  error.value = ''
  
  try {
    // Map extracted data following webhook-vercel.js pattern
    const webhookData = extractedData.value;
    
    const formData = {
      purchasers: Array.isArray(webhookData.purchasers) 
        ? webhookData.purchasers 
        : webhookData.purchaser 
        ? [webhookData.purchaser]
        : [{
            name: webhookData.name || webhookData.purchaserName || webhookData.customerName || webhookData.NAME || webhookData.full_name || '',
            ic: webhookData.ic || webhookData.nric || webhookData.icNumber || webhookData.customerIc || webhookData.NRIC || webhookData.id_number || ''
          }],
      address: webhookData.address || webhookData.customerAddress || webhookData.ADDRESS || webhookData.full_address || '',
      property: webhookData.property || webhookData.propertyDetails || webhookData.propertyAddress || webhookData.PROPERTY || '',
      bank: webhookData.bank || webhookData.bankName || webhookData.BANK || '',
      bankAddress: webhookData.bankAddress || webhookData.bankRegisteredAddress || webhookData.BANK_ADDRESS || webhookData.bank_address || '',
      branchAddress: webhookData.branchAddress || webhookData.branchOfficeAddress || webhookData.BRANCH_ADDRESS || webhookData.branch_address || '',
      facility: webhookData.facility || webhookData.facilityType || webhookData.loanType || webhookData.FACILITY || webhookData.loan_amount || '',
      date: webhookData.date || webhookData.declarationDate || webhookData.DATE || new Date().toISOString().split('T')[0]
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
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Generate data for document following webhook-vercel.js pattern
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
    
    // Generate HTML content following webhook-vercel.js pattern
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
      &nbsp;&nbsp;&nbsp;The Customer, <b>${data.NAME} (NRIC NO. ${data.NRIC})</b> has applied for a Facility of <b>${data.FACILITY}</b> only ("Facility") and the Bank, <b>${data.BANK}</b>, a company incorporated in Malaysia and with its registered office at <b>${data.BANK_ADDRESS}</b> with a branch office at <b>${data.BRANCH_ADDRESS}</b> ("Financier") has agreed to part finance the purchase of the Property by way of 1st/3rd Party Legal Charge; and
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

    // Use html2pdf.app service (same as webhook-vercel.js)
    const pdfApiKey = process.env.NUXT_PDF_API_KEY || 'your-api-key-here';
    
    if (!pdfApiKey || pdfApiKey === 'your-api-key-here') {
      throw new Error('PDF API key not configured. Please set NUXT_PDF_API_KEY environment variable.');
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
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
        const pdfBlob = await pdfResponse.blob();
        
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Statutory_Declaration_${data.NAME.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        result.value = 'PDF generated and downloaded successfully!';
      } else {
        const errorText = await pdfResponse.text();
        throw new Error(`PDF service error: ${pdfResponse.status} - ${errorText}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('PDF generation timed out. Please try again.');
      } else {
        throw new Error(`PDF generation failed: ${fetchError.message}`);
      }
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate PDF'
    console.error('PDF generation error:', err)
  } finally {
    isGeneratingPdf.value = false
  }
}
</script>

<style scoped>
.pdf-upload-page {
  padding: 2rem 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.subtitle {
  text-align: center;
  color: var(--light-text);
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.upload-section {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.upload-section h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.upload-area:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-area.dragover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: var(--success);
  background: var(--success-light);
}

.upload-placeholder {
  color: var(--light-text);
}

.upload-placeholder p {
  margin: 0.5rem 0;
}

.upload-hint {
  font-size: 0.9rem;
  opacity: 0.7;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-details h3 {
  margin: 0;
  color: var(--primary);
}

.file-details p {
  margin: 0;
  color: var(--light-text);
  font-size: 0.9rem;
}

.upload-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.result.success {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success);
}

.result.error {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.extracted-data {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.extracted-data h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.data-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: var(--background);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.data-item strong {
  color: var(--primary);
  min-width: 150px;
}

.data-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.info-section {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-section h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.webhook-info {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.webhook-info h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.webhook-url {
  display: block;
  background: var(--code-background);
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  margin: 1rem 0;
  word-break: break-all;
}

.webhook-details h3 {
  margin: 1.5rem 0 0.5rem 0;
  color: var(--primary);
  font-size: 1.1rem;
}

.webhook-details pre {
  background: var(--code-background);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 0.5rem;
}

.webhook-details code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.troubleshooting {
  margin-top: 1rem;
}

.trouble-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--background);
  border-radius: 6px;
  border-left: 4px solid var(--warning);
  margin-bottom: 1rem;
}

.trouble-item strong {
  color: var(--warning);
  font-size: 0.9rem;
}

.trouble-item span {
  color: var(--light-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .upload-section,
  .extracted-data,
  .info-section,
  .webhook-info {
    padding: 1rem;
  }
  
  .upload-actions,
  .data-actions {
    flex-direction: column;
  }
  
  .file-info {
    flex-direction: column;
    text-align: center;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
