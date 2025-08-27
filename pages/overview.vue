<script setup lang="ts">
import { ref } from 'vue'

const announcements = ref([
  { id: 1, title: 'System Maintenance', content: 'The system will be down for maintenance on Friday 8pm-10pm.' },
  { id: 2, title: 'New Feature', content: 'Bulk upload for cases is now available.' },
])

const newCases = ref([
  { id: 101, name: 'Case A', client: 'John Doe' },
  { id: 102, name: 'Case B', client: 'Jane Smith' },
])

const pendingReview = ref([
  { id: 201, name: 'Case C', client: 'Alice Lee' },
])

const pendingCases = ref([
  { id: 301, name: 'Case D', client: 'Bob Tan' },
  { id: 302, name: 'Case E', client: 'Chris Wong' },
])

const importantNotes = ref([
  { id: 1, note: 'Remember to verify all documents before submission.' },
  { id: 2, note: 'Urgent: Update client contact details for Case D.' },
])

const completedCases = ref([
  { id: 401, name: 'Case F', client: 'Diana Lim' },
  { id: 402, name: 'Case G', client: 'Ethan Ng' },
])

function goToCase(id: number) {
  // Replace with actual navigation logic
  alert('Go to case ' + id)
}
</script>



<template>
  <LayoutSideblock>
    <div class="overview-layout">
      <aside class="overview-side">
        <VCard class="mb-4">
          <template #header>Quick Stats</template>
          <VBlock><b>New Cases:</b> {{ newCases.length }}</VBlock>
          <VBlock><b>Pending Review:</b> {{ pendingReview.length }}</VBlock>
          <VBlock><b>Pending Cases:</b> {{ pendingCases.length }}</VBlock>
          <VBlock><b>Completed:</b> {{ completedCases.length }}</VBlock>
        </VCard>
        <VCard>
          <template #header>Navigation</template>
          <VButton block color="primary" to="/overview">Dashboard Home</VButton>
          <VButton block color="info" to="/app">Statutory Declaration</VButton>
        </VCard>
      </aside>
      <main class="overview-main">
        <VGrid cols="2" gap="4">
          <VGridItem>
            <VCard>
              <template #header>Announcement Board</template>
              <ul>
                <li v-for="a in announcements" :key="a.id">
                  <VBlock>
                    <b>{{ a.title }}</b>: {{ a.content }}
                  </VBlock>
                </li>
              </ul>
            </VCard>
          </VGridItem>
          <VGridItem>
            <VCard>
              <template #header>Important Notes</template>
              <ul>
                <li v-for="n in importantNotes" :key="n.id">
                  <VBlock>{{ n.note }}</VBlock>
                </li>
              </ul>
            </VCard>
          </VGridItem>
          <VGridItem>
            <VCard>
              <template #header>New Cases</template>
              <ul>
                <li v-for="c in newCases" :key="c.id">
                  <VButton @click="goToCase(c.id)" color="primary" outlined>{{ c.name }} ({{ c.client }})</VButton>
                </li>
              </ul>
            </VCard>
          </VGridItem>
          <VGridItem>
            <VCard>
              <template #header>Cases Pending Review</template>
              <ul>
                <li v-for="c in pendingReview" :key="c.id">
                  <VButton @click="goToCase(c.id)" color="warning" outlined>{{ c.name }} ({{ c.client }})</VButton>
                </li>
              </ul>
            </VCard>
          </VGridItem>
          <VGridItem>
            <VCard>
              <template #header>Pending Cases</template>
              <ul>
                <li v-for="c in pendingCases" :key="c.id">
                  <VButton @click="goToCase(c.id)" color="danger" outlined>{{ c.name }} ({{ c.client }})</VButton>
                </li>
              </ul>
            </VCard>
          </VGridItem>
          <VGridItem>
            <VCard>
              <template #header>Completed Cases</template>
              <ul>
                <li v-for="c in completedCases" :key="c.id">
                  <VButton @click="goToCase(c.id)" color="success" outlined>{{ c.name }} ({{ c.client }})</VButton>
                </li>
              </ul>
            </VCard>
          </VGridItem>
        </VGrid>
      </main>
    </div>
  </LayoutSideblock>
</template>

<style scoped>
.overview-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem 1rem;
}
.overview-side {
  width: 260px;
  flex-shrink: 0;
}
.overview-main {
  flex: 1;
}
</style>
