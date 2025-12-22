# Svelte Integration

`@incremark/svelte` provides deep integration with Svelte 5.

## Installation

```bash
pnpm add @incremark/svelte
```

## Basic Usage

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
  <p>Received {$markdown.length} characters</p>
  <!-- Recommended: Pass incremark object -->
  <Incremark {incremark} />
</div>
```

## useIncremark

Core store that manages parsing state and optional typewriter effect.

### Return Values

```ts
const {
  // State
  markdown,        // Writable<string> - Complete Markdown
  blocks,          // Readable<Block[]> - Blocks for rendering (includes typewriter effect if enabled)
  completedBlocks, // Writable<Block[]> - Completed blocks
  pendingBlocks,   // Writable<Block[]> - Pending blocks
  ast,             // Readable<Root> - Complete AST
  isLoading,       // Writable<boolean> - Loading state
  isFinalized,     // Writable<boolean> - Finalized state
  footnoteReferenceOrder, // Writable<string[]> - Footnote reference order
  
  // Methods
  append,          // (chunk: string) => Update
  finalize,        // () => Update
  abort,           // () => Update - Force abort
  reset,           // () => void - Reset parser and typewriter
  render,          // (content: string) => Update - One-shot render
  
  // Typewriter controls
  typewriter,      // TypewriterControls - Typewriter control object
  
  // Instance
  parser           // IncremarkParser - Underlying parser
} = useIncremark(options)
```

### Configuration Options

```ts
interface UseIncremarkOptions {
  // Parser options
  gfm?: boolean              // Enable GFM
  containers?: boolean       // Enable ::: containers
  extensions?: Extension[]   // micromark extensions
  mdastExtensions?: Extension[]  // mdast extensions
  
  // Typewriter options (pass to enable)
  typewriter?: {
    enabled?: boolean              // Enable/disable (default: true)
    charsPerTick?: number | [number, number]  // Chars per tick (default: [1, 3])
    tickInterval?: number          // Interval in ms (default: 30)
    effect?: 'none' | 'fade-in' | 'typing'  // Animation effect
    cursor?: string                // Cursor character (default: '|')
    pauseOnHidden?: boolean        // Pause when hidden (default: true)
  }
}
```

## With Typewriter Effect

The typewriter effect is now integrated into `useIncremark`:

```svelte
<script lang="ts">
  import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/svelte'

  const incremark = useIncremark({
    gfm: true,
    typewriter: {
      enabled: true,
      charsPerTick: [1, 3],
      tickInterval: 30,
      effect: 'typing',  // or 'fade-in'
      cursor: '|'
    }
  })
  const { blocks, typewriter } = incremark
</script>

<div class="content effect-{$typewriter.effect}">
  <AutoScrollContainer>
    <!-- blocks already includes typewriter effect! -->
    <Incremark {incremark} />
  </AutoScrollContainer>
  
  <!-- Typewriter controls -->
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

### Typewriter Controls

```ts
interface TypewriterControls {
  enabled: Readable<boolean>               // Whether enabled
  setEnabled: (enabled: boolean) => void  // Set enabled state
  isProcessing: Readable<boolean>          // Animation ongoing
  isPaused: Readable<boolean>              // Paused state
  effect: Readable<AnimationEffect>       // Current effect
  skip: () => void                         // Skip all animations
  pause: () => void                        // Pause animation
  resume: () => void                       // Resume animation
  setOptions: (options) => void            // Update options
}
```

## Incremark Component

Main rendering component that accepts blocks and renders them.

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `incremark` | `UseIncremarkReturn` | - | **Recommended**: Incremark instance (auto-provides definitions context) |
| `blocks` | `Block[]` | - | Blocks to render (required if `incremark` is not provided) |
| `components` | `Record<string, Component>` | `{}` | Custom components |
| `showBlockStatus` | `boolean` | `true` | Show block status border |

## Custom Components

Override default rendering components:

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

Custom components receive a `node` prop:

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

## Math Formula Support

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
  useDevTools(incremark)  // One line to enable!
</script>
```

## HTML Fragments

v0.2.0 supports HTML fragments in Markdown:

```svelte
<script lang="ts">
  import { useIncremark, Incremark } from '@incremark/svelte'

  const incremark = useIncremark()
  // Markdown with HTML:
  // <div class="custom">
  //   <span>Hello</span>
  // </div>
</script>

<Incremark {incremark} />
```

HTML fragments are automatically parsed and rendered as structured HTML elements.

## Footnotes

v0.2.0 supports footnotes:

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

Footnotes are automatically rendered at the bottom of the document when `isFinalized` is true.

## Theme

v0.2.0 introduces a new theme system:

```svelte
<script lang="ts">
  import { useIncremark, Incremark, ThemeProvider } from '@incremark/svelte'
  import { darkTheme, mergeTheme, defaultTheme } from '@incremark/theme'

  const incremark = useIncremark()
</script>

<!-- Use preset theme -->
<ThemeProvider theme="dark">
  <Incremark {incremark} />
</ThemeProvider>

<!-- Or use custom theme -->
<ThemeProvider theme={customTheme}>
  <Incremark {incremark} />
</ThemeProvider>
```

## Complete Example

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
        {isStreaming ? 'Generating...' : 'Start Chat'}
      </button>
      <span>{$markdown.length} characters</span>
      
      {#if $typewriter.isProcessing}
        <button on:click={() => typewriter.skip()}>Skip</button>
      {/if}
    </header>
    
    <AutoScrollContainer class="content">
      <Incremark {incremark} />
    </AutoScrollContainer>
  </div>
</ThemeProvider>
```

## Fade-in Animation CSS

If using `effect: 'fade-in'`, add this CSS:

```css
.effect-fade-in .incremark-fade-in {
  animation: incremark-fade-in 0.3s ease-out forwards;
}

@keyframes incremark-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Next Steps

- [Typewriter Effect](./typewriter) - Detailed typewriter configuration
- [Auto Scroll](./auto-scroll) - Auto-scroll container
- [Custom Components](./custom-components) - Custom rendering
- [API Reference](/api/svelte) - Complete API documentation

