# @incremark/vue

Vue 3 integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/vue
```

## Composables

### useIncremark

Core Composable to create and manage parser instance.

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
  markdown: Ref<string>
  /** Completed blocks list */
  completedBlocks: ShallowRef<ParsedBlock[]>
  /** Pending blocks list */
  pendingBlocks: ShallowRef<ParsedBlock[]>
  /** Current complete AST */
  ast: ComputedRef<Root>
  /** All blocks (completed + pending), with stable ID */
  blocks: ComputedRef<Array<ParsedBlock & { stableId: string }>>
  /** Is loading */
  isLoading: Ref<boolean>
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

Typewriter effect Composable, acting as middleware between parser and renderer.

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: Ref<SourceBlock<T>[]> | ComputedRef<SourceBlock<T>[]>,
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceBlocks` | `Ref<SourceBlock[]>` | Source blocks (usually from `completedBlocks`) |
| `options.charsPerTick` | `number` | Characters per tick (default: 2) |
| `options.tickInterval` | `number` | Tick interval in ms (default: 50) |
| `options.plugins` | `TransformerPlugin[]` | Plugin list |

#### Returns

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** Display blocks for rendering */
  displayBlocks: ComputedRef<DisplayBlock<T>[]>
  /** Is processing */
  isProcessing: ComputedRef<boolean>
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

```vue
<script setup>
import { computed, ref, watch } from 'vue'
import { useIncremark, useBlockTransformer, Incremark, defaultPlugins } from '@incremark/vue'

const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

const typewriterSpeed = ref(2)
const typewriterInterval = ref(50)

const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

const { displayBlocks, isProcessing, skip, setOptions } = useBlockTransformer(sourceBlocks, {
  charsPerTick: typewriterSpeed.value,
  tickInterval: typewriterInterval.value,
  plugins: defaultPlugins
})

watch([typewriterSpeed, typewriterInterval], ([speed, interval]) => {
  setOptions({ charsPerTick: speed, tickInterval: interval })
})

const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)
</script>

<template>
  <Incremark :blocks="renderBlocks" />
  <button v-if="isProcessing" @click="skip">Skip</button>
</template>
```

### useDevTools

DevTools Composable, one-line enable developer tools.

```ts
function useDevTools(
  incremark: UseIncremarkReturn,
  options?: UseDevToolsOptions
): IncremarkDevTools
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

```vue
<Incremark 
  :blocks="blocks"
  :components="customComponents"
  :show-block-status="true"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | Required | Blocks to render |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

### IncremarkRenderer

Single block render component.

```vue
<IncremarkRenderer :node="block.node" :components="customComponents" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |

### AutoScrollContainer

Auto-scroll container for streaming content scenarios.

```vue
<AutoScrollContainer 
  ref="scrollRef" 
  :enabled="true"
  :threshold="50"
  behavior="instant"
>
  <Incremark :blocks="blocks" />
</AutoScrollContainer>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-scroll |
| `threshold` | `number` | `50` | Bottom threshold to trigger auto-scroll (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |

#### Exposed Methods (via ref)

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

### Built-in Render Components

Can be imported individually:

- `IncremarkHeading` - Headings
- `IncremarkParagraph` - Paragraphs
- `IncremarkCode` - Code blocks
- `IncremarkList` - Lists
- `IncremarkTable` - Tables
- `IncremarkBlockquote` - Blockquotes
- `IncremarkThematicBreak` - Thematic breaks
- `IncremarkMath` - Math formulas
- `IncremarkInline` - Inline content
- `IncremarkDefault` - Default/unknown types

## Plugins

Plugins exported from `@incremark/vue`:

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
} from '@incremark/vue'
```

## Usage Examples

### Basic Usage

```vue
<script setup>
import { useIncremark, useDevTools, Incremark } from '@incremark/vue'

const incremark = useIncremark({ gfm: true })
const { blocks, append, finalize, reset } = incremark

useDevTools(incremark)

async function handleStream(stream) {
  reset()
  for await (const chunk of stream) {
    append(chunk)
  }
  finalize()
}
</script>

<template>
  <Incremark :blocks="blocks" />
</template>
```

### Typewriter Effect + Auto-scroll

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
  <button v-if="isProcessing" @click="skip">Skip</button>
</template>
```
