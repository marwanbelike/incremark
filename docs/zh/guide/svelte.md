# Svelte 集成

`@incremark/svelte` 提供与 Svelte 5 的深度集成。

## 安装

```bash
pnpm add @incremark/svelte
```

## 基础用法

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const incremark = useIncremark({
    gfm: true
  })
  const { blocks, append, finalize, reset, markdown } = incremark
</script>

<div>
  <p>已接收 {$markdown.length} 个字符</p>
  <!-- 推荐：传递 incremark 对象 -->
  <Incremark {incremark} />
</div>
```

## useIncremark

核心 store，管理解析器状态和可选的打字机效果。

### 返回值

```ts
const {
  // 状态
  markdown,        // Writable<string> - 完整 Markdown
  blocks,          // Readable<Block[]> - 用于渲染的块（如果启用打字机效果则包含打字机效果）
  completedBlocks, // Writable<Block[]> - 已完成的块
  pendingBlocks,   // Writable<Block[]> - 待处理的块
  ast,             // Readable<Root> - 完整 AST
  isLoading,       // Writable<boolean> - 加载状态
  isFinalized,     // Writable<boolean> - 是否已完成
  footnoteReferenceOrder, // Writable<string[]> - 脚注引用顺序
  
  // 方法
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - 强制中断
  reset,           // () => void - 重置解析器和打字机
  render,          // (content: string) => Update - 一次性渲染
  
  // 打字机控制
  typewriter,      // TypewriterControls - 打字机控制对象
  
  // 实例
  parser           // IncremarkParser - 底层解析器
} = useIncremark(options)
```

### 配置选项

```ts
interface UseIncremarkOptions {
  // 解析器选项
  gfm?: boolean              // 启用 GFM
  containers?: boolean       // 启用 ::: 容器
  extensions?: Extension[]   // micromark 扩展
  mdastExtensions?: Extension[]  // mdast 扩展
  
  // 打字机选项（传入即启用）
  typewriter?: {
    enabled?: boolean              // 启用/禁用（默认：true）
    charsPerTick?: number | [number, number]  // 每次显示的字符数（默认：[1, 3]）
    tickInterval?: number          // 间隔（毫秒，默认：30）
    effect?: 'none' | 'fade-in' | 'typing'  // 动画效果
    cursor?: string                // 光标字符（默认：'|'）
    pauseOnHidden?: boolean        // 隐藏时暂停（默认：true）
  }
}
```

## 使用打字机效果

打字机效果现已集成到 `useIncremark` 中：

```svelte
<script lang="ts">
  import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/svelte'

  const incremark = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',  // 或 'fade-in'
      cursor: '|'
    }
  })
  const { blocks, typewriter } = incremark
</script>

<div class="content effect-{$typewriter.effect}">
  <AutoScrollContainer>
    <!-- blocks 已包含打字机效果！ -->
    <Incremark {incremark} />
  </AutoScrollContainer>
  
  <!-- 打字机控制 -->
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

### 打字机控制

```ts
interface TypewriterControls {
  enabled: Readable<boolean>               // 是否启用
  setEnabled: (enabled: boolean) => void  // 设置启用状态
  isProcessing: Readable<boolean>          // 动画进行中
  isPaused: Readable<boolean>              // 已暂停
  effect: Readable<AnimationEffect>       // 当前效果
  skip: () => void                         // 跳过所有动画
  pause: () => void                        // 暂停动画
  resume: () => void                       // 恢复动画
  setOptions: (options) => void            // 更新选项
}
```

## Incremark 组件

主渲染组件，接受 blocks 并渲染它们。

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

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `incremark` | `UseIncremarkReturn` | - | **推荐**：Incremark 实例（自动提供 definitions context） |
| `blocks` | `Block[]` | - | 要渲染的块（如果未提供 `incremark` 则为必需） |
| `components` | `Record<string, Component>` | `{}` | 自定义组件 |
| `showBlockStatus` | `boolean` | `true` | 显示块状态边框 |

## 自定义组件

覆盖默认渲染组件：

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  import MyHeading from './MyHeading.svelte'
  import MyCode from './MyCode.svelte'

  const incremark = useIncremark()
  const { blocks } = incremark

  const customComponents = {
    heading: MyHeading,
    code: MyCode
  }
</script>

<Incremark {blocks} components={customComponents} />
```

自定义组件接收 `node` prop：

```svelte
<!-- MyHeading.svelte -->
<script lang="ts">
  interface Props {
    node: { depth: number; children: any[] }
  }
  
  let { node }: Props = $props()
</script>

<svelte:component this={eval(`h${node.depth}`)} class="my-heading">
  <slot />
</svelte:component>
```

## 数学公式支持

```bash
pnpm add micromark-extension-math mdast-util-math katex
```

```svelte
<script lang="ts">
  import { useIncremark } from '@incremark/svelte'
  import { math } from 'micromark-extension-math'
  import { mathFromMarkdown } from 'mdast-util-math'
  import 'katex/dist/katex.min.css'

  const incremark = useIncremark({
    extensions: [math()],
    mdastExtensions: [mathFromMarkdown()],
    typewriter: { effect: 'fade-in' }
  })
</script>
```

## DevTools

```svelte
<script lang="ts">
  import { useIncremark, useDevTools } from '@incremark/svelte'

  const incremark = useIncremark()
  useDevTools(incremark)  // 一行代码启用！
</script>
```

## HTML 片段

v0.2.0 支持 Markdown 中的 HTML 片段：

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'

  const incremark = useIncremark()
  // Markdown 中包含 HTML：
  // <div class="custom">
  //   <span>Hello</span>
  // </div>
</script>

<Incremark {incremark} />
```

HTML 片段会自动解析并渲染为结构化 HTML 元素。

## 脚注

v0.2.0 支持脚注：

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

当 `isFinalized` 为 true 时，脚注会自动显示在文档底部。

## 主题

v0.2.0 引入了新的主题系统：

```svelte
<script lang="ts">
  import { useIncremark, Incremark, ThemeProvider } from '@incremark/svelte'
  import { darkTheme, mergeTheme, defaultTheme } from '@incremark/theme'

  const incremark = useIncremark()
</script>

<!-- 使用预设主题 -->
<ThemeProvider theme="dark">
  <Incremark {incremark} />
</ThemeProvider>

<!-- 或使用自定义主题 -->
<ThemeProvider theme={customTheme}>
  <Incremark {incremark} />
</ThemeProvider>
```

## 完整示例

```svelte
<script lang="ts">
  import { useIncremark, useDevTools, Incremark, AutoScrollContainer, ThemeProvider } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const incremark = useIncremark({ 
    gfm: true,
    typewriter: {
      effect: 'fade-in',
      charsPerTick: [1, 3]
    }
  })
  const { blocks, append, finalize, reset, markdown, typewriter } = incremark

  useDevTools(incremark)

  let isStreaming = $state(false)

  async function simulateAI() {
    reset()
    isStreaming = true
    
    const response = await fetch('/api/chat', { method: 'POST' })
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
    
    finalize()
    isStreaming = false
  }
</script>

<ThemeProvider theme="default">
  <div class="app effect-{$typewriter.effect}">
    <header>
      <button on:click={simulateAI} disabled={isStreaming}>
        {isStreaming ? '生成中...' : '开始对话'}
      </button>
      <span>{$markdown.length} 个字符</span>
      
      {#if $typewriter.isProcessing}
        <button on:click={() => typewriter.skip()}>跳过</button>
      {/if}
    </header>
    
    <AutoScrollContainer class="content">
      <Incremark {incremark} />
    </AutoScrollContainer>
  </div>
</ThemeProvider>
```

## Fade-in 动画 CSS

如果使用 `effect: 'fade-in'`，添加此 CSS：

```css
.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 下一步

- [打字机效果](./typewriter) - 详细的打字机配置
- [自动滚动](./auto-scroll) - 自动滚动容器
- [自定义组件](./custom-components) - 自定义渲染
- [API 参考](/zh/api/svelte) - 完整 API 文档

