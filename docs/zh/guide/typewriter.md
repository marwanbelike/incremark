# 打字机效果

BlockTransformer 提供了打字机效果支持，让 AI 输出的内容逐字符显示，模拟真实打字体验。

## 特性

- ✅ **流畅动画** - 使用 `requestAnimationFrame` 实现
- ✅ **随机步长** - 支持 `charsPerTick: [1, 3]` 模拟真实打字
- ✅ **动画效果** - 支持 `typing` 光标效果
- ✅ **自动暂停** - 页面不可见时自动暂停，节省资源
- ✅ **插件系统** - 可自定义特殊节点的处理方式
- ✅ **跨框架** - 核心逻辑框架无关，Vue/React 适配层

## 工作原理

```
Parser (生产者) → BlockTransformer (中间层) → UI (消费者)
     ↓                    ↓                      ↓
  解析 blocks        控制显示速度           渲染 displayBlocks
```

BlockTransformer 作为解析器和渲染器之间的中间层：
- **消费者角色**：消费来自 Parser 的 `completedBlocks`
- **生产者角色**：生产用于 UI 渲染的 `displayBlocks`
- **核心功能**：控制每次显示的字符数和显示间隔

### 相比 ant-design-x 的优势

| 特性 | Incremark | ant-design-x |
|------|-----------|--------------|
| 定时器 | requestAnimationFrame | requestAnimationFrame |
| 处理对象 | AST 节点（保留结构） | 纯文本字符串 |
| Markdown 解析 | 增量解析 O(n) | 全量解析 O(n²) |
| 复杂内容 | 插件系统处理 | 不支持 |
| 随机步长 | ✅ 支持 | ✅ 支持 |
| 页面可见性 | ✅ 自动暂停 | ❌ 不支持 |

## Vue 集成

```vue
<script setup>
import { computed, ref, watch } from 'vue'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  defaultPlugins 
} from '@incremark/vue'

// 1. 创建解析器
const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

// 2. 配置打字机参数
const charsPerTick = ref(2)    // 每次显示 2 个字符（或 [1, 3] 随机）
const tickInterval = ref(30)   // 每 30ms 显示一次

// 3. 转换为 SourceBlock 格式
const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

// 4. 创建 BlockTransformer
const { 
  displayBlocks, 
  isProcessing,
  isPaused,
  effect,
  skip, 
  pause,
  resume,
  reset: resetTransformer,
  setOptions 
} = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 3],       // 随机 1-3 个字符
  tickInterval: 30,
  effect: 'typing',           // 光标效果
  pauseOnHidden: true,        // 页面不可见时暂停
  plugins: defaultPlugins
})

// 5. 监听配置变化
watch([charsPerTick, tickInterval], ([speed, interval]) => {
  setOptions({ charsPerTick: speed, tickInterval: interval })
})

// 6. 转换为渲染格式
const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)

// 7. 统一重置
function reset() {
  resetParser()
  resetTransformer()
}
</script>

<template>
  <div :class="['content', `effect-${effect}`]">
    <Incremark :blocks="renderBlocks" />
  </div>
  
  <!-- 速度控制 -->
  <input type="range" v-model.number="charsPerTick" min="1" max="10" />
  <input type="range" v-model.number="tickInterval" min="10" max="200" />
  
  <!-- 控制按钮 -->
  <button v-if="isProcessing && !isPaused" @click="pause">暂停</button>
  <button v-if="isPaused" @click="resume">继续</button>
  <button v-if="isProcessing" @click="skip">跳过</button>
</template>

<style>
/* 打字机光标效果 - 光标字符已直接添加到内容中 */
.effect-typing .incremark-pending {
  /* 光标字符已内嵌在内容中 */
}
</style>
```

## React 集成

```tsx
import { useMemo, useState, useEffect, useCallback } from 'react'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  defaultPlugins 
} from '@incremark/react'

function App() {
  // 1. 创建解析器
  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
  
  // 2. 配置打字机参数
  const [charsPerTick, setCharsPerTick] = useState(2)
  const [tickInterval, setTickInterval] = useState(30)

  // 3. 转换为 SourceBlock 格式
  const sourceBlocks = useMemo(() => 
    completedBlocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status
    })),
    [completedBlocks]
  )

  // 4. 创建 BlockTransformer
  const { 
    displayBlocks, 
    isProcessing,
    isPaused,
    effect,
    skip,
    pause,
    resume,
    reset: resetTransformer,
    setOptions 
  } = useBlockTransformer(sourceBlocks, {
    charsPerTick: [1, 3],       // 随机步长
    tickInterval: 30,
    effect: 'typing',
    pauseOnHidden: true,
    plugins: defaultPlugins
  })

  // 5. 监听配置变化
  useEffect(() => {
    setOptions({ charsPerTick, tickInterval })
  }, [charsPerTick, tickInterval, setOptions])

  // 6. 转换为渲染格式
  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  // 7. 统一重置
  const reset = useCallback(() => {
    resetParser()
    resetTransformer()
  }, [resetParser, resetTransformer])

  return (
    <div className={`content effect-${effect}`}>
      <Incremark blocks={renderBlocks} />
      
      {/* 速度控制 */}
      <input 
        type="range" 
        value={charsPerTick} 
        onChange={e => setCharsPerTick(Number(e.target.value))}
        min="1" 
        max="10" 
      />
      
      {/* 控制按钮 */}
      {isProcessing && !isPaused && <button onClick={pause}>暂停</button>}
      {isPaused && <button onClick={resume}>继续</button>}
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `charsPerTick` | `number \| [number, number]` | `1` | 每次显示的字符数，数组表示随机区间 |
| `tickInterval` | `number` | `20` | 显示间隔（毫秒） |
| `effect` | `'none' \| 'typing'` | `'none'` | 动画效果 |
| `pauseOnHidden` | `boolean` | `true` | 页面不可见时是否暂停 |
| `plugins` | `TransformerPlugin[]` | `[]` | 插件列表 |

### 随机步长

使用随机步长可以模拟更自然的打字效果：

```ts
const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 4],  // 每次随机 1-4 个字符
  tickInterval: 30
})
```

### 动画效果

```ts
// 打字机光标效果
const { effect } = useBlockTransformer(sourceBlocks, {
  effect: 'typing'  // 在正在输入的块末尾显示光标
})
```

光标字符会自动添加到正在输入的块内容末尾，默认为 `|`。

```css
/* 打字机光标效果 - 光标字符已直接添加到内容中 */
.effect-typing .incremark-pending {
  /* 光标字符已内嵌在内容中 */
}
```

### 速度示例

| 场景 | charsPerTick | tickInterval | 效果 |
|------|--------------|--------------|------|
| 慢速打字 | 1 | 100 | 每 100ms 显示 1 个字符 |
| 正常速度 | 2 | 50 | 每 50ms 显示 2 个字符 |
| 自然打字 | [1, 3] | 30 | 每 30ms 随机 1-3 个字符 |
| 快速输出 | 5 | 30 | 每 30ms 显示 5 个字符 |
| 极速模式 | 10 | 10 | 每 10ms 显示 10 个字符 |

## 插件系统

### 默认插件

默认情况下，所有内容都参与打字机效果。`defaultPlugins` 只包含：
- `imagePlugin` - 图片立即显示（无文本内容）
- `thematicBreakPlugin` - 分隔线立即显示（无文本内容）

```ts
import { defaultPlugins } from '@incremark/vue'
// 或
import { defaultPlugins } from '@incremark/react'
```

### 完整插件

如果希望代码块、mermaid、数学公式整体显示而不是逐字符：

```ts
import { allPlugins } from '@incremark/vue'

const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  plugins: allPlugins  // 代码块等整体显示
})
```

`allPlugins` 包含：
- `imagePlugin` - 图片立即显示
- `thematicBreakPlugin` - 分隔线立即显示
- `codeBlockPlugin` - 代码块整体显示
- `mermaidPlugin` - Mermaid 图表整体显示
- `mathPlugin` - 数学公式整体显示

### 自定义插件

```ts
import { createPlugin } from '@incremark/vue'

// 让表格整体显示
const tablePlugin = createPlugin(
  'table',
  (node) => node.type === 'table',
  {
    countChars: () => 1,  // 算作 1 个字符
    sliceNode: (node, displayed, total) => displayed >= total ? node : null
  }
)

const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  plugins: [...defaultPlugins, tablePlugin]
})
```

## 暂停与恢复

BlockTransformer 支持手动暂停和恢复：

```ts
const { pause, resume, isPaused } = useBlockTransformer(sourceBlocks)

// 暂停动画
pause()

// 恢复动画
resume()

// 检查是否暂停
console.log(isPaused)  // true / false
```

页面可见性自动暂停：

```ts
const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  pauseOnHidden: true  // 默认开启
})

// 用户切换到其他标签页时自动暂停
// 用户切回时自动恢复
```

## 结合自动滚动

打字机效果通常需要配合自动滚动使用：

```vue
<script setup>
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  AutoScrollContainer,
  defaultPlugins 
} from '@incremark/vue'

// ... transformer 设置 ...

const scrollRef = ref()
</script>

<template>
  <AutoScrollContainer ref="scrollRef" class="content">
    <Incremark :blocks="renderBlocks" />
  </AutoScrollContainer>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

详见 [自动滚动](./auto-scroll) 指南。

## API 参考

### useBlockTransformer 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `displayBlocks` | `DisplayBlock[]` | 用于渲染的 blocks |
| `isProcessing` | `boolean` | 是否正在处理中 |
| `isPaused` | `boolean` | 是否已暂停 |
| `effect` | `AnimationEffect` | 当前动画效果 |
| `skip()` | `Function` | 跳过所有动画 |
| `reset()` | `Function` | 重置状态 |
| `pause()` | `Function` | 暂停动画 |
| `resume()` | `Function` | 恢复动画 |
| `setOptions()` | `Function` | 动态更新配置 |
| `transformer` | `BlockTransformer` | 原始实例 |

### DisplayBlock 结构

```ts
interface DisplayBlock {
  id: string                // 块 ID
  node: RootContent         // 源 AST 节点
  displayNode: RootContent  // 当前显示的节点（可能是截断的）
  progress: number          // 显示进度 0-1
  isDisplayComplete: boolean // 是否显示完成
}
```

### AnimationEffect 类型

```ts
type AnimationEffect = 'none' | 'typing'
```

## 下一步

- [自动滚动](./auto-scroll) - AutoScrollContainer 使用指南
- [自定义组件](./custom-components) - 自定义渲染组件
- [API 参考](/zh/api/vue) - 完整 API 文档
