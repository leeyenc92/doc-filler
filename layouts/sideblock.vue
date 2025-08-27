<script setup lang="ts">
import type { SideblockItem } from '~/components/layouts/sideblock/sideblock.types'

const links = ref<SideblockItem[]>([
  {
    type: 'link',
    label: 'Overview',
    icon: 'lucide:layout-dashboard',
    to: '/overview',
  },
  {
    type: 'link',
    label: 'STATUTORY DECLARATION',
    icon: 'lucide:grid',
    to: '/app',
  },
  {
    type: 'link',
    label: 'Webhook Test',
    icon: 'lucide:webhook',
    to: '/webhook-test',
  },
])
</script>

<template>
  <SideblockLayout
    :links="links"
    open-on-mounted
    size="large"
  >
    <slot />

    <template #logo>
      <h3 class="is-hidden-mobile ml-2">
        Legal Doc Filler
      </h3>
    </template>

    <template #toolbar>
      <div class="toolbar-link">
        <VDarkmodeToggle />
      </div>
    </template>
  </SideblockLayout>
</template>
