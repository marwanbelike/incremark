<script setup lang="ts">
defineProps<{
  modelValue: string
  t: {
    customInput: string
    inputPlaceholder: string
    useExample: string
  }
}>()

defineEmits<{
  'update:modelValue': [value: string]
  useExample: []
}>()
</script>

<template>
  <div class="input-panel">
    <div class="input-header">
      <span>✏️ {{ t.customInput }}</span>
      <button class="use-example-btn" @click="$emit('useExample')">
        {{ t.useExample }}
      </button>
    </div>
    <textarea 
      :value="modelValue"
      :placeholder="t.inputPlaceholder"
      class="markdown-input"
      rows="8"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>

<style scoped>
.input-panel {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.use-example-btn {
  background: #e5e7eb;
  color: #374151;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.use-example-btn:hover {
  background: #d1d5db;
}

.markdown-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
  resize: vertical;
  line-height: 1.5;
}

.markdown-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>

