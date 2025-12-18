<script setup lang="ts">
import type { Heading, PhrasingContent } from 'mdast'
import { IncremarkInline } from '@incremark/vue'

defineProps<{
  node: Heading
}>()
</script>

<template>
  <component :is="`h${node.depth}`" class="custom-heading">
    ✨ <IncremarkInline :nodes="(node.children as PhrasingContent[])" />
  </component>
</template>

<style scoped>
.custom-heading {
  color: #7c3aed;
  border-bottom: 2px solid #7c3aed;
  padding-bottom: 0.5rem;
  margin: 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}
</style>

