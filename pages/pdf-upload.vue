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
            <strong>4. Use:</strong>
            <span>Download or copy data for your workflows</span>
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
          
          <h3>Response Format:</h3>
          <pre><code>{
  "success": true,
  "data": {
    "extracted_fields": {...},
    "confidence": 0.95,
    "processing_time": "2.3s"
  }
}</code></pre>
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
  
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('filename', selectedFile.value.name)
    formData.append('timestamp', new Date().toISOString())
    
    const response = await fetch('https://evident-fox-nationally.ngrok-free.app/webhook-test/doc-extraction', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      extractedData.value = data.data.extracted_fields || data.data
      result.value = `Document processed successfully! Extracted ${Object.keys(extractedData.value).length} fields.`
    } else {
      throw new Error(data.message || 'Document processing failed')
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    console.error('Document processing error:', err)
  } finally {
    isProcessing.value = false
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
