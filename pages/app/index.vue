

<script setup lang="ts">
import { ref } from 'vue'
import { useState, onMounted } from '#imports'

const pageTitle = useState('page-title')
onMounted(() => {
  pageTitle.value = 'STATUTORY DECLARATION'
})


const form = ref({
  purchasers: [
    { name: '', ic: '' }
  ],
  address: '',
  property: '',
  bank: '',
  bankAddress: '',
  branchAddress: '',
  facility: '',
  date: ''
})

function addPurchaser() {
  form.value.purchasers.push({ name: '', ic: '' })
}
function removePurchaser(index) {
  if (form.value.purchasers.length > 1) form.value.purchasers.splice(index, 1)
}

const isLoading = ref(false)
const pdfUrl = ref('')

async function submitForm() {
  isLoading.value = true
  pdfUrl.value = ''
  try {
    const res = await fetch('/api/pdf-filler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) throw new Error('Failed to generate PDF')
    const blob = await res.blob()
    pdfUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="pdf-filler-form">
    <form @submit.prevent="submitForm">
      <div v-for="(purchaser, idx) in form.purchasers" :key="idx" class="purchaser-fields mb-2">
        <VField :label="`Purchaser ${idx + 1} Name`">
          <VControl>
            <VInput v-model="purchaser.name" placeholder="Enter name" required />
          </VControl>
        </VField>
        <VField :label="`Purchaser ${idx + 1} IC Number`">
          <VControl>
            <VInput v-model="purchaser.ic" placeholder="Enter IC number" required />
          </VControl>
        </VField>
        <VButton v-if="idx === form.purchasers.length - 1" type="button" color="primary" outlined icon="plus" @click="addPurchaser" class="mr-2">Add</VButton>
        <VButton v-if="form.purchasers.length > 1" type="button" color="danger" outlined icon="minus" @click="removePurchaser(idx)">Remove</VButton>
      </div>
      <VField label="Address">
        <VControl>
          <VInput v-model="form.address" placeholder="Enter address" required />
        </VControl>
      </VField>
      <VField label="Property">
        <VControl>
          <VTextarea v-model="form.property" placeholder="Enter property details" required rows="3" />
        </VControl>
      </VField>
      <VField label="Bank">
        <VControl>
          <VInput v-model="form.bank" placeholder="Enter bank name" required />
        </VControl>
      </VField>
      <VField label="Bank Address">
        <VControl>
          <VInput v-model="form.bankAddress" placeholder="Enter bank address" required />
        </VControl>
      </VField>
      <VField label="Branch Address">
        <VControl>
          <VInput v-model="form.branchAddress" placeholder="Enter branch address" required />
        </VControl>
      </VField>
       <VField label="Facility">
        <VControl>
          <VTextarea v-model="form.facility" placeholder="Enter facility" required rows="3" />
        </VControl>
      </VField>
      <VField label="Date">
        <VControl>
          <VInput v-model="form.date" type="date" required />
        </VControl>
      </VField>
      <VButton :loading="isLoading" type="submit" color="primary" bold fullwidth raised>Generate PDF</VButton>
    </form>
    <div v-if="pdfUrl" class="mt-4">
      <a :href="pdfUrl" download="SD.pdf" target="_blank">Generate Filled SD PDF</a>
    </div>
  </div>
</template>

<style scoped>
.pdf-filler-form {
  max-width: 400px;
  margin: 2rem auto;
}
</style>
