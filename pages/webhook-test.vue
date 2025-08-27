<script setup lang="ts">
import { ref } from 'vue'
import { useState, onMounted } from '#imports'

const pageTitle = useState('page-title')
onMounted(() => {
  pageTitle.value = 'Webhook Test Page'
})

const testData = ref({
  name: 'John Doe',
  ic: '123456789012',
  address: '123 Main Street, Kuala Lumpur',
  property: 'Apartment 15A, Tower 1, City Center',
  bank: 'Maybank Berhad',
  bankAddress: '100 Jalan Tun Perak, 50050 Kuala Lumpur',
  branchAddress: '15 Jalan Bukit Bintang, 55100 Kuala Lumpur',
  facility: 'Housing Loan',
  date: new Date().toISOString().split('T')[0]
})

const isLoading = ref(false)
const result = ref('')
const error = ref('')

async function testWebhook() {
  isLoading.value = true
  result.value = ''
  error.value = ''
  
  try {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData.value)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || `HTTP ${response.status}`)
    }
    
    // Check response type and handle accordingly
    const contentType = response.headers.get('content-type')
    const environment = response.headers.get('x-environment')
    const pdfAvailable = response.headers.get('x-pdf-available')
    
    if (contentType?.includes('application/pdf')) {
      // PDF response - download file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${testData.value.name.replace(/\s+/g, '_')}_SD_Webhook.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      result.value = `Webhook test successful! PDF downloaded. (Environment: ${environment})`
    } else if (contentType?.includes('text/html')) {
      // HTML response - show in new window
      const htmlContent = await response.text()
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlContent)
        newWindow.document.close()
      }
      
      result.value = `Webhook test successful! HTML opened in new window. (Environment: ${environment}, PDF: ${pdfAvailable === 'true' ? 'Available' : 'Not Available'})`
    } else {
      // Unknown response type
      const text = await response.text()
      result.value = `Webhook test successful! Response received. (Environment: ${environment}, Type: ${contentType})`
      console.log('Response content:', text)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  testData.value = {
    name: 'John Doe',
    ic: '123456789012',
    address: '123 Main Street, Kuala Lumpur',
    property: 'Apartment 15A, Tower 1, City Center',
    bank: 'Maybank Berhad',
    bankAddress: '100 Jalan Tun Perak, 50050 Kuala Lumpur',
    branchAddress: '15 Jalan Bukit Bintang, 55100 Kuala Lumpur',
    facility: 'Housing Loan',
    date: new Date().toISOString().split('T')[0]
  }
  result.value = ''
  error.value = ''
}
</script>

<template>
  <div class="webhook-test-page">
    <div class="container">
      <h1 class="title">Webhook Test Page</h1>
      <p class="subtitle">Test the webhook endpoint that receives data from n8n</p>
      
      <div class="test-section">
        <h2>Test Data</h2>
        <p>Modify the data below to test different scenarios:</p>
        
        <form @submit.prevent="testWebhook" class="test-form">
          <VField label="Customer Name">
            <VControl>
              <VInput v-model="testData.name" placeholder="Enter customer name" required />
            </VControl>
          </VField>
          
          <VField label="IC Number">
            <VControl>
              <VInput v-model="testData.ic" placeholder="Enter IC number" required />
            </VControl>
          </VField>
          
          <VField label="Address">
            <VControl>
              <VInput v-model="testData.address" placeholder="Enter address" required />
            </VControl>
          </VField>
          
          <VField label="Property">
            <VControl>
              <VTextarea v-model="testData.property" placeholder="Enter property details" required rows="3" />
            </VControl>
          </VField>
          
          <VField label="Bank">
            <VControl>
              <VInput v-model="testData.bank" placeholder="Enter bank name" required />
            </VControl>
          </VField>
          
          <VField label="Bank Address">
            <VControl>
              <VInput v-model="testData.bankAddress" placeholder="Enter bank address" required />
            </VControl>
          </VField>
          
          <VField label="Branch Address">
            <VControl>
              <VInput v-model="testData.branchAddress" placeholder="Enter branch address" required />
            </VControl>
          </VField>
          
          <VField label="Facility">
            <VControl>
              <VTextarea v-model="testData.facility" placeholder="Enter facility type" required rows="3" />
            </VControl>
          </VField>
          
          <VField label="Date">
            <VControl>
              <VInput v-model="testData.date" type="date" required />
            </VControl>
          </VField>
          
          <div class="button-group">
            <VButton 
              :loading="isLoading" 
              type="submit" 
              color="primary" 
              bold 
              raised
            >
              Test Webhook
            </VButton>
            <VButton 
              type="button" 
              color="info" 
              outlined 
              @click="resetForm"
            >
              Reset Form
            </VButton>
          </div>
        </form>
      </div>
      
      <div v-if="result" class="result success">
        <VIcon name="check" />
        <span>{{ result }}</span>
      </div>
      
      <div v-if="error" class="result error">
        <VIcon name="alert" />
        <span>{{ error }}</span>
      </div>
      
      <div class="info-section">
        <h2>Webhook Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Endpoint:</strong>
            <code>POST /api/webhook</code>
          </div>
          <div class="info-item">
            <strong>Content-Type:</strong>
            <code>application/json</code>
          </div>
          <div class="info-item">
            <strong>Response:</strong>
            <code>Environment-dependent</code>
          </div>
          <div class="info-item">
            <strong>Environment:</strong>
            <code>{{ $config.public.vercel ? 'Vercel' : 'Local/Development' }}</code>
          </div>
          <div class="info-item">
            <strong>PDF Available:</strong>
            <code>{{ $config.public.vercel ? 'No (Vercel)' : 'Yes (Local)' }}</code>
          </div>
          <div class="info-item">
            <strong>Documentation:</strong>
            <a href="/WEBHOOK_README.md" target="_blank">WEBHOOK_README.md</a>
          </div>
        </div>
      </div>
      
      <div class="curl-example">
        <h2>cURL Example</h2>
        <p>You can also test the webhook using curl:</p>
        <pre><code>curl -X POST {{ $config.public.baseURL || 'http://localhost:3000' }}/api/webhook \
  -H "Content-Type: application/json" \
  -d '{{ JSON.stringify(testData, null, 2) }}' \
  --output test_document.pdf</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webhook-test-page {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
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

.test-section {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-section h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.test-form {
  display: grid;
  gap: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

.info-item code {
  background: var(--code-background);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.curl-example {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.curl-example h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.curl-example pre {
  background: var(--code-background);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 1rem;
}

.curl-example code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .test-section,
  .info-section,
  .curl-example {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
