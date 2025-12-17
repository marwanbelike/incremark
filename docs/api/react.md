# @incremark/react

React 18+ integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/react
```

## Hooks

### useIncremark

Core Hook to create and manage parser instance.

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### Parameters

```ts
interface UseIncremarkOptions extends ParserOptions {}
```

Inherits from `@incremark/core`'s `ParserOptions`.

#### Returns

```ts
interface UseIncremarkReturn {
  /** Collected complete Markdown string */
  markdown: string
  /** Completed blocks list */
  completedBlocks: ParsedBlock[]
  /** Pending blocks list */
  pendingBlocks: ParsedBlock[]
  /** Current complete AST */
  ast: Root
  /** All blocks (completed + pending), with stable ID */
  blocks: Array<ParsedBlock & { stableId: string }>
  /** Is loading */
  isLoading: boolean
  /** Append content */
  append: (chunk: string) => IncrementalUpdate
  /** Finalize parsing */
  finalize: () => IncrementalUpdate
  /** Force abort */
  abort: () => IncrementalUpdate
  /** Reset parser */
  reset: () => void
  /** One-shot render complete Markdown */
  render: (content: string) => IncrementalUpdate
  /** Parser instance */
  parser: IncremarkParser
}
```

### useBlockTransformer

Typewriter effect Hook, acting as middleware between parser and renderer.

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: SourceBlock<T>[],
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceBlocks` | `SourceBlock[]` | Source blocks (usually from `completedBlocks`) |
| `options.charsPerTick` | `number` | Characters per tick (default: 2) |
| `options.tickInterval` | `number` | Tick interval in ms (default: 50) |
| `options.plugins` | `TransformerPlugin[]` | Plugin list |

#### Returns

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** Display blocks for rendering */
  displayBlocks: DisplayBlock<T>[]
  /** Is processing */
  isProcessing: boolean
  /** Skip all animations */
  skip: () => void
  /** Reset state */
  reset: () => void
  /** Dynamically update config */
  setOptions: (options: { charsPerTick?: number; tickInterval?: number }) => void
  /** Transformer instance */
  transformer: BlockTransformer<T>
}
```

#### Example

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
      {isProcessing && <button onClick={skip}>Skip</button>}
    </div>
  )
}
```

### useDevTools

DevTools Hook, one-line enable developer tools.

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): void
```

#### Parameters

- `incremark` - Return value of `useIncremark`
- `options` - DevTools config options

```ts
interface UseDevToolsOptions {
  /** Initially open */
  open?: boolean
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Theme */
  theme?: 'dark' | 'light'
}
```

## Components

### Incremark

Main render component.

```tsx
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | Required | Blocks to render |
| `components` | `Record<string, ComponentType>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

### IncremarkRenderer

Single block render component.

```tsx
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, ComponentType>` | `{}` | Custom component mapping |

### AutoScrollContainer

Auto-scroll container for streaming content scenarios.

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-scroll |
| `threshold` | `number` | `50` | Bottom threshold to trigger auto-scroll (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |
| `className` | `string` | - | Container class name |
| `style` | `CSSProperties` | - | Container style |

#### Ref Methods

| Method | Description |
|--------|-------------|
| `scrollToBottom()` | Force scroll to bottom |
| `isUserScrolledUp()` | Returns whether user manually scrolled up |
| `container` | Container DOM element reference |

#### How it works

- Auto-scroll to bottom when content updates
- Pause auto-scroll when user manually scrolls up
- Resume auto-scroll when user scrolls back to bottom
- Reset auto-scroll state when scrollbar disappears

## Plugins

Plugins exported from `@incremark/react`:

```ts
import {
  defaultPlugins,      // Default plugins (images, breaks display immediately)
  allPlugins,          // All plugins (code blocks etc display as whole)
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  createPlugin
} from '@incremark/react'
```

## Usage Examples

### Basic Usage

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

### Typewriter Effect + Auto-scroll

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
      {isProcessing && <button onClick={skip}>Skip</button>}
    </div>
  )
}
```
