<script setup lang="ts">
import type { Blockquote } from 'mdast'
import IncremarkRenderer from './IncremarkRenderer.vue'

defineProps<{
  node: Blockquote
}>()
</script>

<template>
  <blockquote class="incremark-blockquote">
    <IncremarkRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </blockquote>
</template>

