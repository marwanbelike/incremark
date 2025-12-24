# 自定义组件

Incremark 支持自定义渲染组件，覆盖默认的渲染行为。

## 组件映射

通过 `components` prop 传入自定义组件：

::: code-group

```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import MyHeading from './MyHeading.vue'

const { blocks } = useIncremark()

const components = {
  heading: MyHeading
}
</script>

<template>
  <Incremark :blocks="blocks" :components="components" />
</template>
```

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'
import MyHeading from './MyHeading'

function App() {
  const { blocks } = useIncremark()
  
  const components = {
    heading: MyHeading
  }
  
  return <Incremark blocks={blocks} components={components} />
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import MyHeading from './MyHeading.svelte'

  const incremark = useIncremark()
  const { blocks } = incremark

  const components = {
    heading: MyHeading
  }
</script>

<Incremark {blocks} components={components} />
```

:::

## 支持的节点类型

| 类型 | 说明 | node 属性 |
|------|------|-----------|
| `heading` | 标题 | `depth`, `children` |
| `paragraph` | 段落 | `children` |
| `code` | 代码块 | `lang`, `value` |
| `list` | 列表 | `ordered`, `children` |
| `blockquote` | 引用 | `children` |
| `table` | 表格 | `children` |
| `thematicBreak` | 分隔线 | - |
| `math` | 数学公式 | `value` |
| `inlineMath` | 行内公式 | `value` |

## 示例：自定义代码块

带语法高亮和复制按钮的代码块：

::: code-group

```vue [Vue]
<!-- CustomCode.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  node: { lang?: string; value: string }
}>()

const html = ref('')
const copied = ref(false)

onMounted(async () => {
  html.value = await codeToHtml(props.node.value, {
    lang: props.node.lang || 'text',
    theme: 'github-dark'
  })
})

async function copy() {
  await navigator.clipboard.writeText(props.node.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="header">
      <span>{{ node.lang }}</span>
      <button @click="copy">{{ copied ? '✓' : '复制' }}</button>
    </div>
    <div v-html="html" />
  </div>
</template>
```

```tsx [React]
// CustomCode.tsx
import { useState, useEffect } from 'react'
import { codeToHtml } from 'shiki'

export function CustomCode({ node }) {
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    codeToHtml(node.value, {
      lang: node.lang || 'text',
      theme: 'github-dark'
    }).then(setHtml)
  }, [node.value, node.lang])

  const copy = async () => {
    await navigator.clipboard.writeText(node.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block">
      <div className="header">
        <span>{node.lang}</span>
        <button onClick={copy}>{copied ? '✓' : '复制'}</button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
```

```svelte [Svelte]
<!-- CustomCode.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { codeToHtml } from 'shiki'

  interface Props {
    node: { lang?: string; value: string }
  }

  let { node }: Props = $props()

  let html = $state('')
  let copied = $state(false)

  onMount(async () => {
    html = await codeToHtml(node.value, {
      lang: node.lang || 'text',
      theme: 'github-dark'
    })
  })

  async function copy() {
    await navigator.clipboard.writeText(node.value)
    copied = true
    setTimeout(() => copied = false, 2000)
  }
</script>

<div class="code-block">
  <div class="header">
    <span>{node.lang}</span>
    <button on:click={copy}>{copied ? '✓' : '复制'}</button>
  </div>
  {@html html}
</div>
```

:::

## 示例：Mermaid 图表

```vue
<!-- MermaidBlock.vue -->
<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  node: { lang: string; value: string }
}>()

const svgRef = ref<HTMLDivElement>()
const error = ref('')

async function render() {
  if (props.node.lang !== 'mermaid') return
  
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false })
    
    const { svg } = await mermaid.render('mermaid-' + Date.now(), props.node.value)
    if (svgRef.value) {
      svgRef.value.innerHTML = svg
    }
  } catch (e) {
    error.value = e.message
  }
}

onMounted(render)
watch(() => props.node.value, render)
</script>

<template>
  <div v-if="node.lang === 'mermaid'" class="mermaid-block">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else ref="svgRef" />
  </div>
  <!-- 其他代码块回退到默认渲染 -->
  <pre v-else><code>{{ node.value }}</code></pre>
</template>
```

## 自定义容器

Incremark 支持自定义容器组件，用于渲染指令语法，如 `:::warning`、`:::info`、`:::tip` 等。

通过 `customContainers` prop 传入自定义容器组件：

::: code-group

```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import CustomWarningContainer from './CustomWarningContainer.vue'
import CustomInfoContainer from './CustomInfoContainer.vue'
import CustomTipContainer from './CustomTipContainer.vue'

const incremark = useIncremark({ 
  gfm: true,
  containers: true  // 启用容器支持
})

const customContainers = {
  warning: CustomWarningContainer,
  info: CustomInfoContainer,
  tip: CustomTipContainer,
}
</script>

<template>
  <Incremark 
    :incremark="incremark"
    :custom-containers="customContainers"
  />
</template>
```

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'
import { CustomWarningContainer } from './CustomWarningContainer'
import { CustomInfoContainer } from './CustomInfoContainer'
import { CustomTipContainer } from './CustomTipContainer'

function App() {
  const incremark = useIncremark({ 
    gfm: true,
    containers: true  // 启用容器支持
  })

  const customContainers = {
    warning: CustomWarningContainer,
    info: CustomInfoContainer,
    tip: CustomTipContainer,
  }

  return (
    <Incremark 
      incremark={incremark}
      customContainers={customContainers}
    />
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import CustomWarningContainer from './CustomWarningContainer.svelte'
  import CustomInfoContainer from './CustomInfoContainer.svelte'
  import CustomTipContainer from './CustomTipContainer.svelte'

  const incremark = useIncremark({ 
    gfm: true,
    containers: true  // 启用容器支持
  })

  const customContainers = {
    warning: CustomWarningContainer,
    info: CustomInfoContainer,
    tip: CustomTipContainer,
  }
</script>

<Incremark 
  {incremark}
  {customContainers}
/>
```

:::

### 容器组件 Props

自定义容器组件接收以下 props：

- `name`: 容器名称（如 `"warning"`、`"info"`、`"tip"`）
- `options`: 从指令中解析的属性（如 `{title: "自定义标题"}`）
- `children` / `slot`: 容器内容（作为子元素/插槽渲染）

### 示例：自定义警告容器

::: code-group

```vue [Vue]
<!-- CustomWarningContainer.vue -->
<script setup lang="ts">
defineProps<{
  name: string
  options?: Record<string, any>
}>()
</script>

<template>
  <div class="custom-warning-container">
    <div class="custom-warning-header">
      <span class="custom-warning-icon">⚠️</span>
      <span class="custom-warning-title">
        {{ options?.title || '警告' }}
      </span>
    </div>
    <div class="custom-warning-content">
      <slot />
    </div>
  </div>
</template>
```

```tsx [React]
// CustomWarningContainer.tsx
import React from 'react'

export interface CustomWarningContainerProps {
  name: string
  options?: Record<string, any>
  children?: React.ReactNode
}

export const CustomWarningContainer: React.FC<CustomWarningContainerProps> = ({ 
  options, 
  children 
}) => {
  return (
    <div className="custom-warning-container">
      <div className="custom-warning-header">
        <span className="custom-warning-icon">⚠️</span>
        <span className="custom-warning-title">
          {options?.title || '警告'}
        </span>
      </div>
      <div className="custom-warning-content">
        {children}
      </div>
    </div>
  )
}
```

```svelte [Svelte]
<!-- CustomWarningContainer.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    name: string
    options?: Record<string, any>
    children?: Snippet;
  }

  let { options, children }: Props = $props()
</script>

<div class="custom-warning-container">
  <div class="custom-warning-header">
    <span class="custom-warning-icon">⚠️</span>
    <span class="custom-warning-title">
      {options?.title || '警告'}
    </span>
  </div>
  <div class="custom-warning-content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
```

:::

### 在 Markdown 中使用

```markdown
:::warning
这是一个警告消息。
:::

:::info{title="信息提示"}
这是一个带自定义标题的信息消息。
:::

:::tip
这是一个提示消息。
:::
```

## 自定义代码块

Incremark 支持为特定语言自定义代码块渲染组件。这允许你使用自定义逻辑渲染代码块，例如 ECharts 图表、交互式演示等。

通过 `customCodeBlocks` prop 传入自定义代码块组件：

::: code-group

```vue [Vue]
<script setup>
import { useIncremark, Incremark } from '@incremark/vue'
import CustomEchartCodeBlock from './CustomEchartCodeBlock.vue'

const incremark = useIncremark({ gfm: true })

const customCodeBlocks = {
  echarts: CustomEchartCodeBlock,
}
</script>

<template>
  <Incremark 
    :incremark="incremark"
    :custom-code-blocks="customCodeBlocks"
  />
</template>
```

```tsx [React]
import { useIncremark, Incremark } from '@incremark/react'
import { CustomEchartCodeBlock } from './CustomEchartCodeBlock'

function App() {
  const incremark = useIncremark({ gfm: true })

  const customCodeBlocks = {
    echarts: CustomEchartCodeBlock,
  }

  return (
    <Incremark 
      incremark={incremark}
      customCodeBlocks={customCodeBlocks}
    />
  )
}
```

```svelte [Svelte]
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import CustomEchartCodeBlock from './CustomEchartCodeBlock.svelte'

  const incremark = useIncremark({ gfm: true })

  const customCodeBlocks = {
    echarts: CustomEchartCodeBlock,
  }
</script>

<Incremark 
  {incremark}
  {customCodeBlocks}
/>
```

:::

### 代码块组件 Props

自定义代码块组件接收以下 props：

- `codeStr`: 代码字符串内容
- `lang`: 语言标识符（如 `"echarts"`、`"mermaid"`）

### 示例：自定义 ECharts 代码块

::: code-group

```vue [Vue]
<!-- CustomEchartCodeBlock.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  codeStr: string
  lang?: string
}>()

const chartRef = ref<HTMLDivElement>()
const error = ref('')
const loading = ref(false)

async function renderChart() {
  if (!props.codeStr) return
  
  error.value = ''
  loading.value = true

  try {
    const option = JSON.parse(props.codeStr)
    if (!chartRef.value) return

    const chart = echarts.getInstanceByDom(chartRef.value)
    if (chart) {
      chart.setOption(option)
    } else {
      const newChart = echarts.init(chartRef.value)
      newChart.setOption(option)
    }
  } catch (e: any) {
    error.value = e.message || '渲染失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => renderChart())
watch(() => props.codeStr, renderChart)
</script>

<template>
  <div class="custom-echart-code-block">
    <div class="echart-header">
      <span class="language">ECHART</span>
    </div>
    <div class="echart-content">
      <div v-if="loading" class="echart-loading">加载中...</div>
      <div v-else-if="error" class="echart-error">{{ error }}</div>
      <div ref="chartRef" class="echart-chart" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>
```

```tsx [React]
// CustomEchartCodeBlock.tsx
import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

export interface CustomEchartCodeBlockProps {
  codeStr: string
  lang?: string
}

export const CustomEchartCodeBlock: React.FC<CustomEchartCodeBlockProps> = ({ 
  codeStr 
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!codeStr) return

    setError('')
    setLoading(true)

    try {
      const option = JSON.parse(codeStr)
      if (!chartRef.current) {
        setLoading(false)
        return
      }

      const chart = echarts.getInstanceByDom(chartRef.current)
      if (chart) {
        chart.setOption(option)
      } else {
        const newChart = echarts.init(chartRef.current)
        newChart.setOption(option)
      }
    } catch (e: any) {
      setError(e.message || '渲染失败')
    } finally {
      setLoading(false)
    }
  }, [codeStr])

  return (
    <div className="custom-echart-code-block">
      <div className="echart-header">
        <span className="language">ECHART</span>
      </div>
      <div className="echart-content">
        {loading ? (
          <div className="echart-loading">加载中...</div>
        ) : error ? (
          <div className="echart-error">{error}</div>
        ) : (
          <div ref={chartRef} className="echart-chart" style={{ width: '100%', height: '400px' }}></div>
        )}
      </div>
    </div>
  )
}
```

```svelte [Svelte]
<!-- CustomEchartCodeBlock.svelte -->
<script lang="ts">
  import * as echarts from 'echarts'

  interface Props {
    codeStr: string
    lang?: string
  }

  let { codeStr }: Props = $props()

  let chartRef: HTMLDivElement | undefined = $state();
  let error = $state('')
  let loading = $state(false)

  async function renderChart() {
    if (!codeStr) return

    error = ''
    loading = true

    try {
      const option = JSON.parse(codeStr)
      if (!chartRef) {
        loading = false
        return
      }

      const chart = echarts.getInstanceByDom(chartRef)
      if (chart) {
        chart.setOption(option)
      } else {
        const newChart = echarts.init(chartRef)
        newChart.setOption(option)
      }
    } catch (e: any) {
      error = e.message || '渲染失败'
    } finally {
      loading = false
    }
  }

  $effect(() => {
    renderChart()
  })
</script>

<div class="custom-echart-code-block">
  <div class="echart-header">
    <span class="language">ECHART</span>
  </div>
  <div class="echart-content">
    {#if loading}
      <div class="echart-loading">加载中...</div>
    {:else if error}
      <div class="echart-error">{error}</div>
    {:else}
      <div bind:this={chartRef} class="echart-chart" style="width: 100%; height: 400px;"></div>
    {/if}
  </div>
</div>
```

:::

### 在 Markdown 中使用

```markdown
```echarts
{
  "title": {
    "text": "示例图表"
  },
  "xAxis": {
    "type": "category",
    "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [{
    "data": [120, 200, 150, 80, 70, 110, 130],
    "type": "bar"
  }]
}
```
```

## 访问上下文

自定义组件可以访问父级上下文：

::: code-group

```vue [Vue]
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'

provide('incremark-theme', 'dark')
</script>

<!-- 子组件 -->
<script setup>
import { inject } from 'vue'

const theme = inject('incremark-theme', 'light')
</script>
```

```tsx [React]
// 父组件
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function Parent() {
  return (
    <ThemeContext.Provider value="dark">
      <Incremark blocks={blocks} />
    </ThemeContext.Provider>
  )
}

// 子组件
function CustomComponent() {
  const theme = useContext(ThemeContext)
  return <div className={`theme-${theme}`}>...</div>
}
```

```svelte [Svelte]
<!-- 父组件 -->
<script lang="ts">
  import { setContext } from 'svelte'
  
  setContext('incremark-theme', 'dark')
</script>

<!-- 子组件 -->
<script lang="ts">
  import { getContext } from 'svelte'
  
  const theme = getContext('incremark-theme') || 'light'
</script>
```

:::

