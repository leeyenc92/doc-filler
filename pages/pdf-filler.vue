<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  fullName: '',
  email: '',
  address: '',
  date: ''
})

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
    alert(e.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="pdf-filler-form">
    <form @submit.prevent="submitForm">
      <VField label="Full Name">
        <VControl>
          <VInput v-model="form.fullName" placeholder="Enter your full name" required />
        </VControl>
      </VField>
      <VField label="Email">
        <VControl>
          <VInput v-model="form.email" type="email" placeholder="Enter your email" required />
        </VControl>
      </VField>
      <VField label="Address">
        <VControl>
          <VInput v-model="form.address" placeholder="Enter your address" required />
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
      <a :href="pdfUrl" download="filled-form.pdf" target="_blank">Download Filled PDF</a>
    </div>
  </div>
</template>

<style scoped>
.pdf-filler-form {
  max-width: 400px;
  margin: 2rem auto;
}
</style>
