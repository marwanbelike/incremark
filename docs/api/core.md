# @incremark/core

Framework-agnostic core parser library.

## Installation

```bash
pnpm add @incremark/core
```

## IncremarkParser

Incremental Markdown parser class.

### Constructor

```ts
new IncremarkParser(options?: ParserOptions)
```

### Methods

#### append(chunk)

Append content and return incremental update.

```ts
append(chunk: string): IncrementalUpdate
```

**Parameters:**
- `chunk` - Text fragment to append

**Returns:**
- `IncrementalUpdate` - Block information for this update

#### finalize()

Mark parsing as complete, process remaining pending content.

```ts
finalize(): IncrementalUpdate
```

#### reset()

Reset parser state.

```ts
reset(): void
```

#### render(content)

One-shot render complete Markdown (reset + append + finalize).

```ts
render(content: string): IncrementalUpdate
```

**Parameters:**
- `content` - Complete Markdown content

**Returns:**
- `IncrementalUpdate` - Parse result

#### getBuffer()

Get current buffer content.

```ts
getBuffer(): string
```

#### getCompletedBlocks()

Get all completed blocks.

```ts
getCompletedBlocks(): ParsedBlock[]
```

#### getAst()

Get current complete AST.

```ts
getAst(): Root
```

#### setOnChange(callback)

Set state change callback (for DevTools).

```ts
setOnChange(callback: ((state: ParserState) => void) | undefined): void
```

## createIncremarkParser

Factory function to create parser instance.

```ts
function createIncremarkParser(options?: ParserOptions): IncremarkParser
```

## BlockTransformer

Typewriter effect controller, acting as middleware between parser and renderer.

### Constructor

```ts
new BlockTransformer(options?: TransformerOptions)
```

### Methods

#### push(blocks)

Push source blocks to queue.

```ts
push(blocks: SourceBlock[]): void
```

#### update(block)

Update currently displaying block content (for growing pending blocks).

```ts
update(block: SourceBlock): void
```

#### skip()

Skip all animations, display all content immediately.

```ts
skip(): void
```

#### reset()

Reset state.

```ts
reset(): void
```

#### destroy()

Destroy transformer, clean up timers.

```ts
destroy(): void
```

#### isProcessing()

Check if currently processing.

```ts
isProcessing(): boolean
```

#### setOptions(options)

Dynamically update configuration.

```ts
setOptions(options: { charsPerTick?: number; tickInterval?: number }): void
```

### createBlockTransformer

Factory function to create BlockTransformer instance.

```ts
function createBlockTransformer(options?: TransformerOptions): BlockTransformer
```

## Plugin System

BlockTransformer supports plugins to handle special node types.

### Built-in Plugins

| Plugin | Description | Behavior |
|--------|-------------|----------|
| `imagePlugin` | Images | Display immediately (0 chars) |
| `thematicBreakPlugin` | Thematic breaks | Display immediately (0 chars) |
| `codeBlockPlugin` | Code blocks | Display as whole (1 char) |
| `mermaidPlugin` | Mermaid diagrams | Display as whole (1 char) |
| `mathPlugin` | Math formulas | Display as whole (1 char) |

### Plugin Collections

```ts
// Default plugins: images and breaks display immediately, others participate in typewriter
import { defaultPlugins } from '@incremark/core'

// All plugins: code blocks, mermaid, math also display as whole
import { allPlugins } from '@incremark/core'
```

### Custom Plugins

```ts
import { createPlugin } from '@incremark/core'

const myPlugin = createPlugin(
  'my-plugin',
  (node) => node.type === 'myType',
  {
    countChars: (node) => 1,
    sliceNode: (node, displayed, total) => node
  }
)
```

### TransformerPlugin Interface

```ts
interface TransformerPlugin {
  name: string
  match: (node: RootContent) => boolean
  countChars?: (node: RootContent) => number
  sliceNode?: (node: RootContent, displayedChars: number, totalChars: number) => RootContent | null
}
```

## Utility Functions

### countChars(node)

Count displayable characters in a node.

```ts
function countChars(node: RootContent): number
```

### sliceAst(node, chars)

Slice node by character count.

```ts
function sliceAst(node: RootContent, chars: number): RootContent | null
```

### cloneNode(node)

Deep clone a node.

```ts
function cloneNode<T>(node: T): T
```

## Type Definitions

### ParserOptions

```ts
interface ParserOptions {
  /** Enable GFM extension */
  gfm?: boolean
  /** Enable ::: container syntax */
  containers?: boolean | ContainerConfig
  /** Custom block boundary detection function */
  blockBoundaryDetector?: (content: string, position: number) => boolean
  /** micromark extensions */
  extensions?: Extension[]
  /** mdast extensions */
  mdastExtensions?: Extension[]
  /** State change callback */
  onChange?: (state: ParserState) => void
}
```

### TransformerOptions

```ts
interface TransformerOptions {
  /** Characters per tick (default: 2) */
  charsPerTick?: number
  /** Tick interval in ms (default: 50) */
  tickInterval?: number
  /** Plugin list */
  plugins?: TransformerPlugin[]
  /** State change callback */
  onChange?: (blocks: DisplayBlock[]) => void
}
```

### ParsedBlock

```ts
interface ParsedBlock {
  /** Unique block ID */
  id: string
  /** Block status */
  status: BlockStatus
  /** AST node */
  node: RootContent
  /** Raw text start offset */
  startOffset: number
  /** Raw text end offset */
  endOffset: number
  /** Raw text content */
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
  /** Newly completed blocks */
  completed: ParsedBlock[]
  /** Updated blocks */
  updated: ParsedBlock[]
  /** Pending blocks */
  pending: ParsedBlock[]
  /** Complete AST */
  ast: Root
}
```

## Detector Functions

### detectFenceStart

Detect code block start.

```ts
function detectFenceStart(line: string): { char: string; length: number; indent: number } | null
```

### detectFenceEnd

Detect code block end.

```ts
function detectFenceEnd(line: string, fenceChar: string, fenceLength: number): boolean
```

### isEmptyLine

Detect empty line.

```ts
function isEmptyLine(line: string): boolean
```

### isHeading

Detect heading line.

```ts
function isHeading(line: string): boolean
```

### isThematicBreak

Detect thematic break.

```ts
function isThematicBreak(line: string): boolean
```

### isListItemStart

Detect list item start.

```ts
function isListItemStart(line: string): boolean
```

### isBlockquoteStart

Detect blockquote start.

```ts
function isBlockquoteStart(line: string): boolean
```
