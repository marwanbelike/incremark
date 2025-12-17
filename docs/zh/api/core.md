# @incremark/core

核心解析器库，框架无关。

## 安装

```bash
pnpm add @incremark/core
```

## IncremarkParser

增量 Markdown 解析器类。

### 构造函数

```ts
new IncremarkParser(options?: ParserOptions)
```

### 方法

#### append(chunk)

追加内容并返回增量更新。

```ts
append(chunk: string): IncrementalUpdate
```

**参数：**
- `chunk` - 要追加的文本片段

**返回值：**
- `IncrementalUpdate` - 本次更新的块信息

#### finalize()

标记解析完成，处理剩余的待处理内容。

```ts
finalize(): IncrementalUpdate
```

#### reset()

重置解析器状态。

```ts
reset(): void
```

#### render(content)

一次性渲染完整 Markdown（reset + append + finalize）。

```ts
render(content: string): IncrementalUpdate
```

**参数：**
- `content` - 完整的 Markdown 内容

**返回值：**
- `IncrementalUpdate` - 解析结果

#### getBuffer()

获取当前缓冲区内容。

```ts
getBuffer(): string
```

#### getCompletedBlocks()

获取所有已完成的块。

```ts
getCompletedBlocks(): ParsedBlock[]
```

#### getAst()

获取当前完整的 AST。

```ts
getAst(): Root
```

#### setOnChange(callback)

设置状态变化回调（用于 DevTools）。

```ts
setOnChange(callback: ((state: ParserState) => void) | undefined): void
```

## createIncremarkParser

工厂函数，创建解析器实例。

```ts
function createIncremarkParser(options?: ParserOptions): IncremarkParser
```

## BlockTransformer

打字机效果控制器，作为解析器和渲染器之间的中间层。

### 构造函数

```ts
new BlockTransformer(options?: TransformerOptions)
```

### 方法

#### push(blocks)

推送源 blocks 到队列。

```ts
push(blocks: SourceBlock[]): void
```

#### update(block)

更新正在显示的 block 内容（用于 pending block 内容增长）。

```ts
update(block: SourceBlock): void
```

#### skip()

跳过所有动画，立即显示全部内容。

```ts
skip(): void
```

#### reset()

重置状态。

```ts
reset(): void
```

#### destroy()

销毁 transformer，清理定时器。

```ts
destroy(): void
```

#### isProcessing()

是否正在处理中。

```ts
isProcessing(): boolean
```

#### setOptions(options)

动态更新配置。

```ts
setOptions(options: { charsPerTick?: number; tickInterval?: number }): void
```

### createBlockTransformer

工厂函数，创建 BlockTransformer 实例。

```ts
function createBlockTransformer(options?: TransformerOptions): BlockTransformer
```

## 插件系统

BlockTransformer 支持插件来处理特殊类型的节点。

### 内置插件

| 插件 | 说明 | 行为 |
|------|------|------|
| `imagePlugin` | 图片 | 立即显示（0 字符） |
| `thematicBreakPlugin` | 分隔线 | 立即显示（0 字符） |
| `codeBlockPlugin` | 代码块 | 整体显示（1 字符） |
| `mermaidPlugin` | Mermaid 图表 | 整体显示（1 字符） |
| `mathPlugin` | 数学公式 | 整体显示（1 字符） |

### 插件集合

```ts
// 默认插件：图片、分隔线立即显示，其他参与打字机效果
import { defaultPlugins } from '@incremark/core'

// 完整插件：代码块、mermaid、公式也整体显示
import { allPlugins } from '@incremark/core'
```

### 自定义插件

```ts
import { createPlugin } from '@incremark/core'

const myPlugin = createPlugin(
  'my-plugin',
  (node) => node.type === 'myType',
  {
    countChars: (node) => 1,  // 字符计数
    sliceNode: (node, displayed, total) => node  // 节点切片
  }
)
```

### TransformerPlugin 接口

```ts
interface TransformerPlugin {
  name: string
  match: (node: RootContent) => boolean
  countChars?: (node: RootContent) => number
  sliceNode?: (node: RootContent, displayedChars: number, totalChars: number) => RootContent | null
}
```

## 工具函数

### countChars(node)

计算节点的可显示字符数。

```ts
function countChars(node: RootContent): number
```

### sliceAst(node, chars)

按字符数切片节点。

```ts
function sliceAst(node: RootContent, chars: number): RootContent | null
```

### cloneNode(node)

深拷贝节点。

```ts
function cloneNode<T>(node: T): T
```

## 类型定义

### ParserOptions

```ts
interface ParserOptions {
  /** 启用 GFM 扩展 */
  gfm?: boolean
  /** 启用 ::: 容器语法 */
  containers?: boolean | ContainerConfig
  /** 自定义块边界检测函数 */
  blockBoundaryDetector?: (content: string, position: number) => boolean
  /** micromark 扩展 */
  extensions?: Extension[]
  /** mdast 扩展 */
  mdastExtensions?: Extension[]
  /** 状态变化回调 */
  onChange?: (state: ParserState) => void
}
```

### TransformerOptions

```ts
interface TransformerOptions {
  /** 每次显示的字符数（默认：2） */
  charsPerTick?: number
  /** 显示间隔 ms（默认：50） */
  tickInterval?: number
  /** 插件列表 */
  plugins?: TransformerPlugin[]
  /** 状态变化回调 */
  onChange?: (blocks: DisplayBlock[]) => void
}
```

### ParsedBlock

```ts
interface ParsedBlock {
  /** 块的唯一 ID */
  id: string
  /** 块状态 */
  status: BlockStatus
  /** AST 节点 */
  node: RootContent
  /** 原始文本起始位置 */
  startOffset: number
  /** 原始文本结束位置 */
  endOffset: number
  /** 原始文本内容 */
  rawText: string
}
```

### SourceBlock

```ts
interface SourceBlock<T = unknown> {
  id: string
  node: RootContent
  status: 'pending' | 'stable' | 'completed'
  meta?: T
}
```

### DisplayBlock

```ts
interface DisplayBlock<T = unknown> {
  id: string
  sourceNode: RootContent
  displayNode: RootContent
  displayedChars: number
  totalChars: number
  isDisplayComplete: boolean
  meta?: T
}
```

### BlockStatus

```ts
type BlockStatus = 'pending' | 'stable' | 'completed'
```

### IncrementalUpdate

```ts
interface IncrementalUpdate {
  /** 新完成的块 */
  completed: ParsedBlock[]
  /** 更新的块 */
  updated: ParsedBlock[]
  /** 待处理的块 */
  pending: ParsedBlock[]
  /** 完整 AST */
  ast: Root
}
```

## 检测器函数

### detectFenceStart

检测代码块开始。

```ts
function detectFenceStart(line: string): { char: string; length: number; indent: number } | null
```

### detectFenceEnd

检测代码块结束。

```ts
function detectFenceEnd(line: string, fenceChar: string, fenceLength: number): boolean
```

### isEmptyLine

检测空行。

```ts
function isEmptyLine(line: string): boolean
```

### isHeading

检测标题行。

```ts
function isHeading(line: string): boolean
```

### isThematicBreak

检测分隔线。

```ts
function isThematicBreak(line: string): boolean
```

### isListItemStart

检测列表项开始。

```ts
function isListItemStart(line: string): boolean
```

### isBlockquoteStart

检测引用开始。

```ts
function isBlockquoteStart(line: string): boolean
```
