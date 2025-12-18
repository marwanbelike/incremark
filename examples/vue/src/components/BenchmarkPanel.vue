<script setup lang="ts">
import type { BenchmarkStats } from '../composables'

defineProps<{
  stats: BenchmarkStats
  running: boolean
  progress: number
  t: {
    benchmark: string
    runBenchmark: string
    running: string
    traditional: string
    incremark: string
    totalTime: string
    totalChars: string
    speedup: string
    benchmarkNote: string
  }
}>()

defineEmits<{
  run: []
}>()
</script>

<template>
  <div class="benchmark-panel">
    <div class="benchmark-header">
      <h2>⚡ {{ t.benchmark }}</h2>
      <button 
        class="benchmark-btn"
        :disabled="running"
        @click="$emit('run')"
      >
        {{ running ? t.running : t.runBenchmark }}
      </button>
    </div>
    
    <div v-if="running" class="benchmark-progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    
    <div v-if="stats.traditional.time > 0" class="benchmark-results">
      <div class="benchmark-card traditional">
        <h3>🐢 {{ t.traditional }}</h3>
        <div class="stat">
          <span class="label">{{ t.totalTime }}</span>
          <span class="value">{{ stats.traditional.time.toFixed(2) }} ms</span>
        </div>
        <div class="stat">
          <span class="label">{{ t.totalChars }}</span>
          <span class="value">{{ (stats.traditional.totalChars / 1000).toFixed(1) }}K</span>
        </div>
      </div>
      
      <div class="benchmark-card incremark">
        <h3>🚀 {{ t.incremark }}</h3>
        <div class="stat">
          <span class="label">{{ t.totalTime }}</span>
          <span class="value">{{ stats.incremark.time.toFixed(2) }} ms</span>
        </div>
        <div class="stat">
          <span class="label">{{ t.totalChars }}</span>
          <span class="value">{{ (stats.incremark.totalChars / 1000).toFixed(1) }}K</span>
        </div>
      </div>
      
      <div class="benchmark-card speedup">
        <h3>📈 {{ t.speedup }}</h3>
        <div class="speedup-value">
          {{ (stats.traditional.time / stats.incremark.time).toFixed(1) }}x
        </div>
      </div>
    </div>
    
    <p class="benchmark-note">💡 {{ t.benchmarkNote }}</p>
  </div>
</template>

<style scoped>
.benchmark-panel {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #f1f5f9;
}

.benchmark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.benchmark-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.benchmark-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.benchmark-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.benchmark-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.benchmark-progress {
  height: 4px;
  background: #334155;
  border-radius: 2px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  transition: width 0.3s ease;
}

.benchmark-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.benchmark-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.benchmark-card h3 {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.benchmark-card.traditional {
  border-left: 3px solid #ef4444;
}

.benchmark-card.incremark {
  border-left: 3px solid #10b981;
}

.benchmark-card.speedup {
  border-left: 3px solid #3b82f6;
}

.benchmark-card .stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.benchmark-card .label {
  opacity: 0.7;
}

.benchmark-card .value {
  font-weight: 600;
}

.speedup-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
}

.benchmark-note {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

@media (max-width: 600px) {
  .benchmark-results {
    grid-template-columns: 1fr;
  }
}
</style>

