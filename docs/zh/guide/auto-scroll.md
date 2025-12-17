# 自动滚动

AutoScrollContainer 是一个智能自动滚动容器，专为流式内容场景设计。

## 功能特性

- ✅ 内容更新时自动滚动到底部
- ✅ 用户手动向上滚动时暂停自动滚动
- ✅ 用户滚动回底部时恢复自动滚动
- ✅ 滚动条消失时自动恢复自动滚动状态

## Vue 使用

```vue
<script setup>
import { ref } from 'vue'
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark()
const scrollRef = ref()
const autoScrollEnabled = ref(true)
</script>

<template>
  <AutoScrollContainer 
    ref="scrollRef" 
    :enabled="autoScrollEnabled"
    :threshold="50"
    behavior="instant"
    class="content"
  >
    <Incremark :blocks="blocks" />
  </AutoScrollContainer>
  
  <!-- 控制开关 -->
  <label>
    <input type="checkbox" v-model="autoScrollEnabled" />
    自动滚动
  </label>
  
  <!-- 显示状态 -->
  <span v-if="scrollRef?.isUserScrolledUp?.()">
    已暂停（用户向上滚动了）
  </span>
  
  <!-- 强制滚动 -->
  <button @click="scrollRef?.scrollToBottom()">
    滚动到底部
  </button>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

## React 使用

```tsx
import { useRef, useState } from 'react'
import { 
  useIncremark, 
  Incremark, 
  AutoScrollContainer,
  type AutoScrollContainerRef 
} from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark()
  const scrollRef = useRef<AutoScrollContainerRef>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  return (
    <div>
      <AutoScrollContainer 
        ref={scrollRef} 
        enabled={autoScrollEnabled}
        threshold={50}
        behavior="instant"
        className="content"
      >
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
      
      {/* 控制开关 */}
      <label>
        <input 
          type="checkbox" 
          checked={autoScrollEnabled}
          onChange={e => setAutoScrollEnabled(e.target.checked)}
        />
        自动滚动
      </label>
      
      {/* 显示状态 */}
      {scrollRef.current?.isUserScrolledUp() && (
        <span>已暂停（用户向上滚动了）</span>
      )}
      
      {/* 强制滚动 */}
      <button onClick={() => scrollRef.current?.scrollToBottom()}>
        滚动到底部
      </button>
    </div>
  )
}
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 触发自动滚动的底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |

### behavior 选项

| 值 | 说明 |
|-----|------|
| `'instant'` | 立即滚动（默认，推荐用于流式内容） |
| `'smooth'` | 平滑滚动（可能导致滚动不及时） |
| `'auto'` | 浏览器默认行为 |

## 暴露的方法

通过 `ref` 可以访问以下方法：

| 方法 | 说明 |
|------|------|
| `scrollToBottom()` | 强制滚动到底部（忽略 isUserScrolledUp 状态） |
| `isUserScrolledUp()` | 返回用户是否手动向上滚动了 |
| `container` | 容器 DOM 元素引用 |

## 工作原理

### 暂停逻辑

自动滚动只会在以下情况暂停：
1. 用户**主动向上滚动**（scrollTop 减少）
2. 且内容高度**没有变化**（scrollHeight 不变）

这样可以区分「用户手动滚动」和「内容增加导致的位置变化」。

### 恢复逻辑

以下情况会恢复自动滚动：
1. 用户滚动到底部附近（距离 ≤ threshold）
2. 滚动条消失（内容高度 ≤ 容器高度）

## 结合打字机效果

推荐与 BlockTransformer 一起使用：

```vue
<script setup>
import { computed, ref } from 'vue'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  AutoScrollContainer,
  defaultPlugins 
} from '@incremark/vue'

const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
const scrollRef = ref()

const sourceBlocks = computed(() => 
  completedBlocks.value.map(b => ({ id: b.id, node: b.node, status: b.status }))
)

const { displayBlocks, isProcessing, skip, reset: resetTransformer } = useBlockTransformer(sourceBlocks, {
  charsPerTick: 2,
  tickInterval: 50,
  plugins: defaultPlugins
})

const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)

function reset() {
  resetParser()
  resetTransformer()
}
</script>

<template>
  <AutoScrollContainer ref="scrollRef" class="content">
    <Incremark :blocks="renderBlocks" />
  </AutoScrollContainer>
  
  <button v-if="isProcessing" @click="skip">跳过</button>
</template>
```

## 样式建议

```css
/* 容器需要固定高度 */
.content {
  max-height: 70vh;
  overflow: hidden;  /* 隐藏容器本身的滚动条 */
}

/* AutoScrollContainer 内部会处理滚动 */
```

## 常见问题

### 为什么滚动不及时？

默认使用 `behavior="instant"` 应该是即时的。如果设置了 `behavior="smooth"`，可能会导致滚动动画跟不上内容更新速度。

### 为什么内容更新时也暂停了？

这是旧版本的 bug，新版本已修复。现在只有用户主动向上滚动（scrollTop 减少且 scrollHeight 不变）才会暂停。

### 如何在内容重置后恢复自动滚动？

当滚动条消失时（内容被清空），会自动恢复自动滚动状态。

## 下一步

- [打字机效果](./typewriter) - BlockTransformer 使用指南
- [自定义组件](./custom-components) - 自定义渲染组件
- [API 参考](/zh/api/vue) - 完整 API 文档

