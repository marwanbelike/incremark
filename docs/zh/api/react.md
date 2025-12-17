# @incremark/react

React 18+ 集成库。

## 安装

```bash
pnpm add @incremark/core @incremark/react
```

## Hooks

### useIncremark

核心 Hook，创建并管理解析器实例。

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### 参数

```ts
interface UseIncremarkOptions extends ParserOptions {}
```

继承自 `@incremark/core` 的 `ParserOptions`。

#### 返回值

```ts
interface UseIncremarkReturn {
  /** 已收集的完整 Markdown 字符串 */
  markdown: string
  /** 已完成的块列表 */
  completedBlocks: ParsedBlock[]
  /** 待处理的块列表 */
  pendingBlocks: ParsedBlock[]
  /** 当前完整的 AST */
  ast: Root
  /** 所有块（完成 + 待处理），带稳定 ID */
  blocks: Array<ParsedBlock & { stableId: string }>
  /** 是否正在加载 */
  isLoading: boolean
  /** 追加内容 */
  append: (chunk: string) => IncrementalUpdate
  /** 完成解析 */
  finalize: () => IncrementalUpdate
  /** 强制中断 */
  abort: () => IncrementalUpdate
  /** 重置解析器 */
  reset: () => void
  /** 一次性渲染完整 Markdown */
  render: (content: string) => IncrementalUpdate
  /** 解析器实例 */
  parser: IncremarkParser
}
```

### useBlockTransformer

打字机效果 Hook，作为解析器和渲染器之间的中间层。

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: SourceBlock<T>[],
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceBlocks` | `SourceBlock[]` | 源 blocks（通常来自 `completedBlocks`） |
| `options.charsPerTick` | `number` | 每次显示的字符数（默认：2） |
| `options.tickInterval` | `number` | 每次显示的间隔时间 ms（默认：50） |
| `options.plugins` | `TransformerPlugin[]` | 插件列表 |

#### 返回值

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** 用于渲染的 display blocks */
  displayBlocks: DisplayBlock<T>[]
  /** 是否正在处理中 */
  isProcessing: boolean
  /** 跳过所有动画 */
  skip: () => void
  /** 重置状态 */
  reset: () => void
  /** 动态更新配置 */
  setOptions: (options: { charsPerTick?: number; tickInterval?: number }) => void
  /** transformer 实例 */
  transformer: BlockTransformer<T>
}
```

#### 使用示例

```tsx
import { useMemo, useState, useEffect } from 'react'
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
  
  const [typewriterSpeed, setTypewriterSpeed] = useState(2)
  const [typewriterInterval, setTypewriterInterval] = useState(50)

  const sourceBlocks = useMemo(() => 
    completedBlocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status
    })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip, setOptions } = useBlockTransformer(sourceBlocks, {
    charsPerTick: typewriterSpeed,
    tickInterval: typewriterInterval,
    plugins: defaultPlugins
  })

  useEffect(() => {
    setOptions({ charsPerTick: typewriterSpeed, tickInterval: typewriterInterval })
  }, [typewriterSpeed, typewriterInterval, setOptions])

  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  return (
    <div>
      <Incremark blocks={renderBlocks} />
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
```

### useDevTools

DevTools Hook，一行启用开发者工具。

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): void
```

#### 参数

- `incremark` - `useIncremark` 的返回值
- `options` - DevTools 配置选项

```ts
interface UseDevToolsOptions {
  /** 初始是否打开 */
  open?: boolean
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 主题 */
  theme?: 'dark' | 'light'
}
```

## 组件

### Incremark

主渲染组件。

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | 必填 | 要渲染的块 |
| `components` | `Record<string, ComponentType>` | `{}` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | `true` | 是否显示块状态边框 |

### IncremarkRenderer

单块渲染组件。

```tsx
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `RootContent` | 必填 | AST 节点 |
| `components` | `Record<string, ComponentType>` | `{}` | 自定义组件映射 |

### AutoScrollContainer

自动滚动容器，适用于流式内容场景。

```tsx
import { useRef } from 'react'
import { AutoScrollContainer, type AutoScrollContainerRef } from '@incremark/react'

function App() {
  const scrollRef = useRef<AutoScrollContainerRef>(null)
  
  return (
    <AutoScrollContainer 
      ref={scrollRef} 
      enabled={true}
      threshold={50}
      behavior="instant"
      className="content"
    >
      <Incremark blocks={blocks} />
    </AutoScrollContainer>
  )
}
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 触发自动滚动的底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |
| `className` | `string` | - | 容器类名 |
| `style` | `CSSProperties` | - | 容器样式 |

#### Ref 方法

| 方法 | 说明 |
|------|------|
| `scrollToBottom()` | 强制滚动到底部 |
| `isUserScrolledUp()` | 返回用户是否手动向上滚动了 |
| `container` | 容器 DOM 元素引用 |

#### 工作原理

- 内容更新时自动滚动到底部
- 用户主动向上滚动时暂停自动滚动
- 用户滚动回底部时恢复自动滚动
- 滚动条消失时自动恢复自动滚动状态

## 插件

从 `@incremark/react` 导出的插件：

```ts
import {
  defaultPlugins,      // 默认插件（图片、分隔线立即显示）
  allPlugins,          // 完整插件（代码块等整体显示）
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/react'
```

## 使用示例

### 基础用法

```tsx
import { useIncremark, useDevTools, Incremark } from '@incremark/react'

function App() {
  const incremark = useIncremark({ gfm: true })
  const { blocks, append, finalize, reset } = incremark

  useDevTools(incremark)

  async function handleStream(stream: ReadableStream) {
    reset()
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
  }

  return <Incremark blocks={blocks} />
}
```

### 打字机效果 + 自动滚动

```tsx
import { useMemo, useRef, useCallback } from 'react'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark, 
  AutoScrollContainer,
  defaultPlugins,
  type AutoScrollContainerRef
} from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
  const scrollRef = useRef<AutoScrollContainerRef>(null)

  const sourceBlocks = useMemo(() => 
    completedBlocks.map(b => ({ id: b.id, node: b.node, status: b.status })),
    [completedBlocks]
  )

  const { displayBlocks, isProcessing, skip, reset: resetTransformer } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  const reset = useCallback(() => {
    resetParser()
    resetTransformer()
  }, [resetParser, resetTransformer])

  return (
    <div>
      <AutoScrollContainer ref={scrollRef} className="content">
        <Incremark blocks={renderBlocks} />
      </AutoScrollContainer>
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
```
