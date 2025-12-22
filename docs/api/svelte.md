# @incremark/svelte

Svelte 5 integration library.

## Installation

```bash
pnpm add @incremark/core @incremark/svelte
```

## Stores

### useIncremark

Core store to create and manage parser instance.

```ts
function useIncremark(options?: UseIncremarkOptions): UseIncremarkReturn
```

#### Parameters

```ts
interface UseIncremarkOptions extends ParserOptions {
  /** Typewriter effect configuration */
  typewriter?: TypewriterOptions
}

interface TypewriterOptions {
  /** Enable typewriter effect (default: true if typewriter is provided) */
  enabled?: boolean
  /** Characters per tick, can be a number or range [min, max] */
  charsPerTick?: number | [number, number]
  /** Update interval in ms */
  tickInterval?: number
  /** Animation effect: 'none' | 'fade-in' | 'typing' */
  effect?: AnimationEffect
  /** Cursor character (only for 'typing' effect) */
  cursor?: string
  /** Pause when page is hidden */
  pauseOnHidden?: boolean
  /** Custom transformer plugins */
  plugins?: TransformerPlugin[]
}
```

Inherits from `@incremark/core`'s `ParserOptions`.

#### Returns

```ts
interface UseIncremarkReturn {
  /** Collected complete Markdown string */
  markdown: Writable<string>
  /** Completed blocks list */
  completedBlocks: Writable<ParsedBlock[]>
  /** Pending blocks list */
  pendingBlocks: Writable<ParsedBlock[]>
  /** Current complete AST */
  ast: Readable<Root>
  /** All blocks (completed + pending), with stable ID (includes typewriter effect if enabled) */
  blocks: Readable<Array<ParsedBlock & { stableId: string }>>
  /** Is loading */
  isLoading: Writable<boolean>
  /** Is finalized */
  isFinalized: Writable<boolean>
  /** Footnote reference order */
  footnoteReferenceOrder: Writable<string[]>
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
  /** Typewriter controls (if typewriter is enabled) */
  typewriter: TypewriterControls
}
```

### useBlockTransformer

Typewriter effect store, acting as middleware between parser and renderer.

```ts
function useBlockTransformer<T = unknown>(
  sourceBlocks: Readable<SourceBlock<T>[]>,
  options?: UseBlockTransformerOptions
): UseBlockTransformerReturn<T>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceBlocks` | `Readable<SourceBlock[]>` | Source blocks store (usually from `completedBlocks`) |
| `options.charsPerTick` | `number \| [number, number]` | Characters per tick (default: 2) |
| `options.tickInterval` | `number` | Tick interval in ms (default: 50) |
| `options.plugins` | `TransformerPlugin[]` | Plugin list |
| `options.effect` | `AnimationEffect` | Animation effect |
| `options.pauseOnHidden` | `boolean` | Pause when page is hidden |

#### Returns

```ts
interface UseBlockTransformerReturn<T = unknown> {
  /** Display blocks for rendering */
  displayBlocks: Readable<DisplayBlock<T>[]>
  /** Is processing */
  isProcessing: Readable<boolean>
  /** Is paused */
  isPaused: Readable<boolean>
  /** Current animation effect */
  effect: Readable<AnimationEffect>
  /** Skip all animations */
  skip: () => void
  /** Reset state */
  reset: () => void
  /** Pause animation */
  pause: () => void
  /** Resume animation */
  resume: () => void
  /** Dynamically update config */
  setOptions: (options: Partial<TransformerOptions>) => void
  /** Transformer instance */
  transformer: BlockTransformer<T>
}
```

#### Example

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
  <button on:click={skip}>Skip</button>
{/if}
```

### useDevTools

DevTools store, one-line enable developer tools.

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

```svelte
<!-- Recommended: Pass incremark object (auto-provides context) -->
<Incremark {incremark} />

<!-- Or use blocks directly -->
<Incremark 
  blocks={blocks}
  components={customComponents}
  showBlockStatus={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `incremark` | `UseIncremarkReturn` | - | **Recommended**: Incremark instance (auto-provides definitions context) |
| `blocks` | `Array<ParsedBlock & { stableId: string }>` | - | Blocks to render (required if `incremark` is not provided) |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |
| `showBlockStatus` | `boolean` | `true` | Show block status border |
| `pendingClass` | `string` | `'incremark-pending'` | CSS class for pending blocks |
| `completedClass` | `string` | `'incremark-completed'` | CSS class for completed blocks |

### IncremarkRenderer

Single block render component.

```svelte
<IncremarkRenderer node={block.node} components={customComponents} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `node` | `RootContent` | Required | AST node |
| `components` | `Record<string, Component>` | `{}` | Custom component mapping |

### AutoScrollContainer

Auto-scroll container for streaming content scenarios.

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-scroll |
| `threshold` | `number` | `50` | Bottom threshold to trigger auto-scroll (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |

#### How it works

- Auto-scroll to bottom when content updates
- Pause auto-scroll when user manually scrolls up
- Resume auto-scroll when user scrolls back to bottom
- Reset auto-scroll state when scrollbar disappears

**Note**: Styles are provided by `@incremark/theme` package. Import styles:

```ts
import '@incremark/svelte/style.css'
```

### IncremarkFootnotes

Footnotes list component (rendered automatically when using `Incremark` with `incremark` prop).

```svelte
<!-- Automatically rendered when using: -->
<Incremark {incremark} />

<!-- Or manually: -->
<IncremarkFootnotes />
```

Footnotes are automatically displayed at the bottom of the document when `isFinalized` is true.

### ThemeProvider

Theme provider component for applying themes.

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'default' \| 'dark' \| DesignTokens \| Partial<DesignTokens>` | Required | Theme configuration |
| `class` | `string` | `''` | Additional CSS class |

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
- `IncremarkHtmlElement` - HTML elements

## Context

### setDefinitionsContext / getDefinitionsContext

Functions for managing definitions and footnotes context.

```svelte
<script lang="ts">
  import { setDefinitionsContext, getDefinitionsContext } from '@incremark/svelte'

  // In parent component
  const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = setDefinitionsContext()

  // In child component
  const { definitions, footnoteDefinitions, footnoteReferenceOrder } = getDefinitionsContext()
</script>
```

## Theme

### Design Tokens

```ts
import { type DesignTokens, defaultTheme, darkTheme } from '@incremark/theme'
```

### Theme Utilities

```ts
import {
  applyTheme,
  generateCSSVars,
  mergeTheme
} from '@incremark/theme'
```

## Plugins

Plugins exported from `@incremark/svelte`:

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
} from '@incremark/svelte'
```

## Usage Examples

### Basic Usage

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

<!-- Recommended: Pass incremark object -->
<Incremark {incremark} />
```

### With Typewriter Effect

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
    <button on:click={() => typewriter.pause()}>Pause</button>
  {/if}
  {#if $typewriter.isPaused}
    <button on:click={() => typewriter.resume()}>Resume</button>
  {/if}
  {#if $typewriter.isProcessing}
    <button on:click={() => typewriter.skip()}>Skip</button>
  {/if}
</div>
```

### With HTML Fragments

HTML fragments in Markdown are automatically parsed and rendered:

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  
  const incremark = useIncremark()
  // Markdown with HTML:
  // <div class="custom">Hello</div>
</script>

<Incremark {incremark} />
```

### With Footnotes

Footnotes are automatically rendered at the bottom:

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'
  
  const incremark = useIncremark()
  // Markdown with footnotes:
  // Text[^1] and more[^2]
  // 
  // [^1]: First footnote
  // [^2]: Second footnote
</script>

<Incremark {incremark} />
```

### With Theme

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

### Typewriter Effect + Auto-scroll

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
  <button on:click={skip}>Skip</button>
{/if}
```

