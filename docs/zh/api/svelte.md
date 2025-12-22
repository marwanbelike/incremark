# @incremark/svelte

Svelte 5 集成库。

## 安装

```bash
pnpm add @incremark/core @incremark/svelte
```

## Stores

### useIncremark

核心 Store，创建并管理解析器实例。

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### 参数

```ts
interface UseIncremarkOptions extends ParserOptions {
  /** 打字机效果配置 */
  typewriter?: TypewriterOptions
}

interface TypewriterOptions {
  /** 启用打字机效果（默认：如果提供了 typewriter 则为 true） */
  enabled?: boolean
  /** 每次显示的字符数，可以是数字或范围 [min, max] */
  charsPerTick?: number | [number, number]
  /** 更新间隔（毫秒） */
  tickInterval?: number
  /** 动画效果：'none' | 'fade-in' | 'typing' */
  effect?: AnimationEffect
  /** 光标字符（仅用于 'typing' 效果） */
  cursor?: string
  /** 页面隐藏时暂停 */
  pauseOnHidden?: boolean
  /** 自定义转换插件 */
  plugins?: TransformerPlugin[]
}
```

继承自 `@incremark/core` 的 `ParserOptions`。

#### 返回值

```ts
interface UseIncremarkReturn {
  /** 已收集的完整 Markdown 字符串 */
  markdown: Writable<string>
  /** 已完成的块列表 */
  completedBlocks: Writable<ParsedBlock[]>
  /** 待处理的块列表 */
  pendingBlocks: Writable<ParsedBlock[]>
  /** 当前完整的 AST */
  ast: Readable<Root>
  /** 所有块（完成 + 待处理），带稳定 ID（如果启用打字机效果则包含打字机效果） */
  blocks: Readable<Array<ParsedBlock & { stableId: string }>>
  /** 是否正在加载 */
  isLoading: Writable<boolean>
  /** 是否已完成（finalize） */
  isFinalized: Writable<boolean>
  /** 脚注引用的出现顺序 */
  footnoteReferenceOrder: Writable<string[]>
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
  /** 打字机控制器（如果启用了打字机效果） */
  typewriter: TypewriterControls
}
```

### useBlockTransformer

打字机效果 Store，作为解析器和渲染器之间的中间层。

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: Readable<SourceBlock<T>[]>,
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceBlocks` | `Readable<SourceBlock[]>` | 源 blocks store（通常来自 `completedBlocks`） |
| `options.charsPerTick` | `number \| [number, number]` | 每次显示的字符数（默认：2） |
| `options.tickInterval` | `number` | 更新间隔（毫秒，默认：50） |
| `options.plugins` | `TransformerPlugin[]` | 插件列表 |
| `options.effect` | `AnimationEffect` | 动画效果 |
| `options.pauseOnHidden` | `boolean` | 页面隐藏时暂停 |

#### 返回值

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** 用于渲染的 display blocks */
  displayBlocks: Readable<DisplayBlock<T>[]>
  /** 是否正在处理中 */
  isProcessing: Readable<boolean>
  /** 是否已暂停 */
  isPaused: Readable<boolean>
  /** 当前动画效果 */
  effect: Readable<AnimationEffect>
  /** 跳过所有动画 */
  skip: () => void
  /** 重置状态 */
  reset: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<TransformerOptions>) => void
  /** transformer 实例 */
  transformer: BlockTransformer<T>
}
```

#### 示例

```svelte
<script lang="ts">
  import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/svelte'
  import { derived } from 'svelte/store'

  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

  const sourceBlocks = derived(completedBlocks, ($blocks) => 
    $blocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status
    }))
  )

  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = derived(displayBlocks, ($blocks) => 
    $blocks.map(db => ({
      id: db.id,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    }))
  )
</script>

<Incremark blocks={$renderBlocks} />
{#if $isProcessing}
  <button on:click={skip}>跳过</button>
{/if}
```

### useDevTools

DevTools Store，一行代码启用开发者工具。

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): IncremarkDevTools
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

```svelte
<!-- 推荐：传递 incremark 对象（自动提供 context） -->
<Incremark {incremark} />

<!-- 或直接使用 blocks -->
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `incremark` | `UseIncremarkReturn` | - | **推荐**：Incremark 实例（自动提供 definitions context） |
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | - | 要渲染的块（如果未提供 `incremark` 则为必需） |
| `components` | `Record<string, Component>` | `{}` | 自定义组件映射 |
| `showBlockStatus` | `boolean` | `true` | 显示块状态边框 |
| `pendingClass` | `string` | `'incremark-pending'` | 待处理块的 CSS 类 |
| `completedClass` | `string` | `'incremark-completed'` | 已完成块的 CSS 类 |

### IncremarkRenderer

单个块渲染组件。

```svelte
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `RootContent` | 必需 | AST 节点 |
| `components` | `Record<string, Component>` | `{}` | 自定义组件映射 |

### AutoScrollContainer

流式内容场景的自动滚动容器。

```svelte
<AutoScrollContainer 
  enabled={true}
  threshold={50}
  behavior="instant"
>
  <Incremark blocks={blocks} />
</AutoScrollContainer>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用自动滚动 |
| `threshold` | `number` | `50` | 触发自动滚动的底部阈值（像素） |
| `behavior` | `ScrollBehavior` | `'instant'` | 滚动行为 |

#### 工作原理

- 内容更新时自动滚动到底部
- 用户手动向上滚动时暂停自动滚动
- 用户滚动回底部时恢复自动滚动
- 滚动条消失时重置自动滚动状态

**注意**：样式由 `@incremark/theme` 包提供。导入样式：

```ts
import '@incremark/svelte/style.css'
```

### IncremarkFootnotes

脚注列表组件（使用 `Incremark` 并传递 `incremark` prop 时自动渲染）。

```svelte
<!-- 使用以下方式时自动渲染： -->
<Incremark {incremark} />

<!-- 或手动渲染： -->
<IncremarkFootnotes />
```

当 `isFinalized` 为 true 时，脚注会自动显示在文档底部。

### ThemeProvider

用于应用主题的主题提供者组件。

```svelte
<script lang="ts">
  import { ThemeProvider } from '@incremark/svelte'
  import { darkTheme } from '@incremark/theme'
</script>

<ThemeProvider theme="dark">
  <Incremark {incremark} />
</ThemeProvider>
```

#### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'default' \| 'dark' \| DesignTokens \| Partial<DesignTokens>` | 必需 | 主题配置 |
| `class` | `string` | `''` | 额外的 CSS 类 |

### 内置渲染组件

可以单独导入：

- `IncremarkHeading` - 标题
- `IncremarkParagraph` - 段落
- `IncremarkCode` - 代码块
- `IncremarkList` - 列表
- `IncremarkTable` - 表格
- `IncremarkBlockquote` - 引用
- `IncremarkThematicBreak` - 分隔线
- `IncremarkMath` - 数学公式
- `IncremarkInline` - 行内内容
- `IncremarkDefault` - 默认/未知类型
- `IncremarkHtmlElement` - HTML 元素

## Context

### setDefinitionsContext / getDefinitionsContext

用于管理 definitions 和 footnotes context 的函数。

```svelte
<script lang="ts">
  import { setDefinitionsContext, getDefinitionsContext } from '@incremark/svelte'

  // 在父组件中
  const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = setDefinitionsContext()

  // 在子组件中
  const { definitions, footnoteDefinitions, footnoteReferenceOrder } = getDefinitionsContext()
</script>
```

## 主题

### Design Tokens

```ts
import { type DesignTokens, defaultTheme, darkTheme } from '@incremark/theme'
```

### 主题工具

```ts
import {
  applyTheme,
  generateCSSVars,
  mergeTheme
} from '@incremark/theme'
```

## 插件

从 `@incremark/svelte` 导出的插件：

```ts
import {
  defaultPlugins,      // 默认插件（图片、分隔线立即显示）
  allPlugins,          // 所有插件（代码块等整体显示）
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/svelte'
```

## 使用示例

### 基础用法

```svelte
<script lang="ts">
  import { useIncremark, useDevTools, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

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
</script>

<!-- 推荐：传递 incremark 对象 -->
<Incremark {incremark} />
```

### 使用打字机效果

```svelte
<script lang="ts">
  import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/svelte'

  const incremark = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',
      cursor: '|'
    }
  })
  const { blocks, typewriter } = incremark
</script>

<div class="content effect-{$typewriter.effect}">
  <AutoScrollContainer>
    <Incremark {incremark} />
  </AutoScrollContainer>
  
  {#if $typewriter.isProcessing && !$typewriter.isPaused}
    <button on:click={() => typewriter.pause()}>暂停</button>
  {/if}
  {#if $typewriter.isPaused}
    <button on:click={() => typewriter.resume()}>继续</button>
  {/if}
  {#if $typewriter.isProcessing}
    <button on:click={() => typewriter.skip()}>跳过</button>
  {/if}
</div>
```

### 使用 HTML 片段

Markdown 中的 HTML 片段会自动解析和渲染：

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  
  const incremark = useIncremark()
  // Markdown 中包含 HTML：
  // <div class="custom">Hello</div>
</script>

<Incremark {incremark} />
```

### 使用脚注

脚注会自动在底部渲染：

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  
  const incremark = useIncremark()
  // Markdown 中包含脚注：
  // Text[^1] and more[^2]
  // 
  // [^1]: First footnote
  // [^2]: Second footnote
</script>

<Incremark {incremark} />
```

### 使用主题

```svelte
<script lang="ts">
  import { useIncremark, Incremark, ThemeProvider } from '@incremark/svelte'
  import { darkTheme } from '@incremark/theme'
  
  const incremark = useIncremark()
</script>

<ThemeProvider theme="dark">
  <Incremark {incremark} />
</ThemeProvider>
```

### 打字机效果 + 自动滚动

```svelte
<script lang="ts">
  import { useIncremark, useBlockTransformer, Incremark, AutoScrollContainer, defaultPlugins } from '@incremark/svelte'
  import { derived } from 'svelte/store'

  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

  const sourceBlocks = derived(completedBlocks, ($blocks) => 
    $blocks.map(b => ({ id: b.id, node: b.node, status: b.status }))
  )

  const { displayBlocks, isProcessing, skip, reset: resetTransformer } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50,
    plugins: defaultPlugins
  })

  const renderBlocks = derived(displayBlocks, ($blocks) => 
    $blocks.map(db => ({
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

<AutoScrollContainer class="content">
  <Incremark blocks={$renderBlocks} />
</AutoScrollContainer>
{#if $isProcessing}
  <button on:click={skip}>跳过</button>
{/if}
```

