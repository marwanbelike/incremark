<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  codeStr: string
  lang?: string
  completed: boolean
  takeOver?: boolean
}>()

const chartRef = ref<HTMLDivElement>()
const error = ref('')
const loading = ref(false)

// 是否应该显示图表
const shouldShowChart = computed(() => {
  return props.takeOver === true || props.completed
})

async function renderChart() {
  if (!props.codeStr) return

  error.value = ''
  loading.value = true

  try {
    const option = JSON.parse(props.codeStr)
    console.log(option)

    if (!chartRef.value) return

    const chart = echarts.getInstanceByDom(chartRef.value)
    if (chart) {
      chart.setOption(option)
    } else {
      echarts.init(chartRef.value).setOption(option)
    }
  } catch (e: any) {
    error.value = e.message || '渲染失败'
  } finally {
    loading.value = false
  }
}

// 监听 completed 变化
watch(() => props.completed, (newCompleted) => {
  console.log('completed 变化:', newCompleted, 'takeOver:', props.takeOver)
  
  // 如果应该显示图表，等待 DOM 更新后渲染
  if (props.takeOver === true || newCompleted) {
    nextTick(() => {
      renderChart()
    })
  }
})
</script>

<template>
  <div class="custom-echart-code-block">
    <div class="echart-header">
      <span class="language">ECHART</span>
    </div>
    <div class="echart-content">
      <!-- loading 状态 -->
      <div v-if="!shouldShowChart" class="echart-loading">解析中...</div>
      <!-- 错误 -->
      <div v-else-if="error" class="echart-error">{{ error }}</div>
      <!-- 图表（无 v-if，始终存在） -->
      <div 
        ref="chartRef" 
        class="echart-chart" 
        style="width: 100%; height: 400px;"
        :style="{ display: shouldShowChart ? 'block' : 'none' }"
      />
    </div>
  </div>
</template>

<!-- 样式已移动到共享的 styles.css -->

