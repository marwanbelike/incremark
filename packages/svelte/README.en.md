# @incremark/svelte

Svelte 5 integration for Incremark.

**[🇨🇳 中文](./README.md)** | 🇺🇸 English

## Features

- 📦 **Out of the Box** - Provides `useIncremark` store and `<Incremark>` component
- 🎨 **Customizable** - Support for custom render components
- ⚡ **High Performance** - Optimized with Svelte 5 Runes
- 🔧 **DevTools** - Built-in developer tools

## Installation

```bash
pnpm add @incremark/core @incremark/svelte
```

## Quick Start

**1. Import Styles**

```ts
import '@incremark/svelte/style.css'
```

**2. Use in Your Component**

```svelte
<script>
  import { useIncremark, Incremark } from '@incremark/svelte'
  import '@incremark/svelte/style.css'

  const { blocks, append, finalize, reset } = useIncremark({ gfm: true })

  async function handleStream(stream) {
    reset()
    for await (const chunk of stream) {
      append(chunk)
    }
    finalize()
  }
</script>

<button on:click={handleStream}>Start</button>
<Incremark {blocks} />
```

## API

### useIncremark(options)

Core store.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `markdown` | `Writable<string>` | Complete Markdown |
| `blocks` | `Readable<Block[]>` | All blocks |
| `completedBlocks` | `Writable<Block[]>` | Completed blocks |
| `pendingBlocks` | `Writable<Block[]>` | Pending blocks |
| `append` | `Function` | Append content |
| `finalize` | `Function` | Complete parsing |
| `reset` | `Function` | Reset state |
| `render` | `Function` | Render once (reset + append + finalize) |

### useDevTools(incremark)

Enable DevTools.

```ts
const incremark = useIncremark()
useDevTools(incremark)
```

### \<Incremark\>

Render component.

```svelte
<Incremark 
  {blocks}
  components={{ heading: MyHeading }}
/>
```

## License

MIT

