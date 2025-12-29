<script lang="ts">
  import * as echarts from 'echarts'

  interface Props {
    codeStr: string
    lang?: string
    completed: boolean
    takeOver?: boolean
  }

  let { codeStr, completed, takeOver }: Props = $props()

  let chartRef: HTMLDivElement | undefined = $state()
  let error = $state('')

  // 是否应该显示图表
  const shouldShowChart = $derived(takeOver === true || completed)

  function renderChart() {
    if (!codeStr || !chartRef) return

    error = ''

    try {
      const option = JSON.parse(codeStr)
      console.log(option)

      const chart = echarts.getInstanceByDom(chartRef)
      if (chart) {
        chart.setOption(option)
      } else {
        echarts.init(chartRef).setOption(option)
      }
    } catch (e: any) {
      error = e.message || '渲染失败'
    } finally {
    }
  }

  // 监听 completed 变化
  $effect(() => {
    console.log('completed 变化:', completed, 'takeOver:', takeOver)
    if (shouldShowChart) {
      // 等待 DOM 更新后渲染
      setTimeout(() => {
        renderChart()
      }, 0)
    }
  })
</script>

<div class="custom-echart-code-block">
  <div class="echart-header">
    <span class="language">ECHART</span>
  </div>
  <div class="echart-content">
    <!-- loading 状态 -->
    {#if !shouldShowChart}
      <div class="echart-loading">解析中...</div>
    {:else if error}
      <div class="echart-error">{error}</div>
    {/if}
    <!-- 图表（无 if，始终存在） -->
    <div 
      bind:this={chartRef} 
      class="echart-chart" 
      style="width: 100%; height: 400px; display: {shouldShowChart ? 'block' : 'none'};"
    ></div>
  </div>
</div>

