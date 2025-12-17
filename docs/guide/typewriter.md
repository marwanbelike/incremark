# Typewriter Effect

BlockTransformer provides typewriter effect support, displaying AI output content character by character to simulate a real typing experience.

## Features

- ✅ **Smooth Animation** - Powered by `requestAnimationFrame`
- ✅ **Random Step** - Support `charsPerTick: [1, 3]` for natural typing
- ✅ **Animation Effects** - Support `typing` cursor effect
- ✅ **Auto Pause** - Automatically pauses when page is hidden
- ✅ **Plugin System** - Customize handling for special nodes
- ✅ **Cross-framework** - Framework-agnostic core with Vue/React adapters

## How It Works

```
Parser (Producer) → BlockTransformer (Middleware) → UI (Consumer)
     ↓                      ↓                          ↓
  Parse blocks        Control display speed       Render displayBlocks
```

BlockTransformer acts as middleware between parser and renderer:
- **Consumer Role**: Consumes `completedBlocks` from Parser
- **Producer Role**: Produces `displayBlocks` for UI rendering
- **Core Function**: Controls characters per tick and display interval

### Advantages over ant-design-x

| Feature | Incremark | ant-design-x |
|---------|-----------|--------------|
| Timer | requestAnimationFrame | requestAnimationFrame |
| Processing | AST nodes (preserves structure) | Plain text strings |
| Markdown Parsing | Incremental O(n) | Full parsing O(n²) |
| Complex Content | Plugin system | Not supported |
| Random Step | ✅ Supported | ✅ Supported |
| Page Visibility | ✅ Auto pause | ❌ Not supported |

## Vue Integration

```vue
<script setup>
import { computed, ref, watch } from 'vue'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  defaultPlugins 
} from '@incremark/vue'

// 1. Create parser
const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()

// 2. Configure typewriter parameters
const charsPerTick = ref(2)    // 2 chars per tick (or [1, 3] for random)
const tickInterval = ref(30)   // Every 30ms

// 3. Convert to SourceBlock format
const sourceBlocks = computed(() => 
  completedBlocks.value.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
)

// 4. Create BlockTransformer
const { 
  displayBlocks, 
  isProcessing,
  isPaused,
  effect,
  skip, 
  pause,
  resume,
  reset: resetTransformer,
  setOptions 
} = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 3],       // Random 1-3 characters
  tickInterval: 30,
  effect: 'typing',           // Cursor effect
  pauseOnHidden: true,        // Pause when page hidden
  plugins: defaultPlugins
})

// 5. Watch for config changes
watch([charsPerTick, tickInterval], ([speed, interval]) => {
  setOptions({ charsPerTick: speed, tickInterval: interval })
})

// 6. Convert to render format
const renderBlocks = computed(() => 
  displayBlocks.value.map(db => ({
    id: db.id,
    stableId: db.id,
    node: db.displayNode,
    status: db.isDisplayComplete ? 'completed' : 'pending'
  }))
)

// 7. Unified reset
function reset() {
  resetParser()
  resetTransformer()
}
</script>

<template>
  <div :class="['content', `effect-${effect}`]">
    <Incremark :blocks="renderBlocks" />
  </div>
  
  <!-- Speed controls -->
  <input type="range" v-model.number="charsPerTick" min="1" max="10" />
  <input type="range" v-model.number="tickInterval" min="10" max="200" />
  
  <!-- Control buttons -->
  <button v-if="isProcessing && !isPaused" @click="pause">Pause</button>
  <button v-if="isPaused" @click="resume">Resume</button>
  <button v-if="isProcessing" @click="skip">Skip</button>
</template>

<style>
/* Typing cursor effect - cursor character is embedded in content */
.effect-typing .incremark-pending {
  /* Cursor character is embedded in content */
}
</style>
```

## React Integration

```tsx
import { useMemo, useState, useEffect, useCallback } from 'react'
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  defaultPlugins 
} from '@incremark/react'

function App() {
  // 1. Create parser
  const { completedBlocks, append, finalize, reset: resetParser } = useIncremark()
  
  // 2. Configure typewriter parameters
  const [charsPerTick, setCharsPerTick] = useState(2)
  const [tickInterval, setTickInterval] = useState(30)

  // 3. Convert to SourceBlock format
  const sourceBlocks = useMemo(() => 
    completedBlocks.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status
    })),
    [completedBlocks]
  )

  // 4. Create BlockTransformer
  const { 
    displayBlocks, 
    isProcessing,
    isPaused,
    effect,
    skip,
    pause,
    resume,
    reset: resetTransformer,
    setOptions 
  } = useBlockTransformer(sourceBlocks, {
    charsPerTick: [1, 3],       // Random step
    tickInterval: 30,
    effect: 'typing',
    pauseOnHidden: true,
    plugins: defaultPlugins
  })

  // 5. Watch for config changes
  useEffect(() => {
    setOptions({ charsPerTick, tickInterval })
  }, [charsPerTick, tickInterval, setOptions])

  // 6. Convert to render format
  const renderBlocks = useMemo(() => 
    displayBlocks.map(db => ({
      ...db,
      stableId: db.id,
      node: db.displayNode,
      status: db.isDisplayComplete ? 'completed' : 'pending'
    })),
    [displayBlocks]
  )

  // 7. Unified reset
  const reset = useCallback(() => {
    resetParser()
    resetTransformer()
  }, [resetParser, resetTransformer])

  return (
    <div className={`content effect-${effect}`}>
      <Incremark blocks={renderBlocks} />
      
      {/* Speed controls */}
      <input 
        type="range" 
        value={charsPerTick} 
        onChange={e => setCharsPerTick(Number(e.target.value))}
        min="1" 
        max="10" 
      />
      
      {/* Control buttons */}
      {isProcessing && !isPaused && <button onClick={pause}>Pause</button>}
      {isPaused && <button onClick={resume}>Resume</button>}
      {isProcessing && <button onClick={skip}>Skip</button>}
    </div>
  )
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `charsPerTick` | `number \| [number, number]` | `1` | Characters per tick, array for random range |
| `tickInterval` | `number` | `20` | Interval in milliseconds |
| `effect` | `'none' \| 'typing'` | `'none'` | Animation effect |
| `pauseOnHidden` | `boolean` | `true` | Pause when page is hidden |
| `plugins` | `TransformerPlugin[]` | `[]` | Plugin list |

### Random Step

Use random step for more natural typing effect:

```ts
const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  charsPerTick: [1, 4],  // Random 1-4 characters each tick
  tickInterval: 30
})
```

### Animation Effects

```ts
// Typing cursor effect
const { effect } = useBlockTransformer(sourceBlocks, {
  effect: 'typing'  // Show cursor at the end of typing block
})
```

The cursor character is automatically appended to the end of the typing block content, defaults to `|`.

```css
/* Typing cursor effect - cursor character is embedded in content */
.effect-typing .incremark-pending {
  /* Cursor character is embedded in content */
}
```

### Speed Examples

| Scenario | charsPerTick | tickInterval | Effect |
|----------|--------------|--------------|--------|
| Slow typing | 1 | 100 | 1 char every 100ms |
| Normal speed | 2 | 50 | 2 chars every 50ms |
| Natural typing | [1, 3] | 30 | Random 1-3 chars every 30ms |
| Fast output | 5 | 30 | 5 chars every 30ms |
| Turbo mode | 10 | 10 | 10 chars every 10ms |

## Plugin System

### Default Plugins

By default, all content participates in typewriter effect. `defaultPlugins` only includes:
- `imagePlugin` - Images display immediately (no text content)
- `thematicBreakPlugin` - Dividers display immediately (no text content)

```ts
import { defaultPlugins } from '@incremark/vue'
// or
import { defaultPlugins } from '@incremark/react'
```

### All Plugins

If you want code blocks, mermaid, math formulas to display as a whole:

```ts
import { allPlugins } from '@incremark/vue'

const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  plugins: allPlugins  // Code blocks etc. display as whole
})
```

`allPlugins` includes:
- `imagePlugin` - Images display immediately
- `thematicBreakPlugin` - Dividers display immediately
- `codeBlockPlugin` - Code blocks display as whole
- `mermaidPlugin` - Mermaid charts display as whole
- `mathPlugin` - Math formulas display as whole

### Custom Plugins

```ts
import { createPlugin } from '@incremark/vue'

// Make tables display as whole
const tablePlugin = createPlugin(
  'table',
  (node) => node.type === 'table',
  {
    countChars: () => 1,  // Count as 1 character
    sliceNode: (node, displayed, total) => displayed >= total ? node : null
  }
)

const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  plugins: [...defaultPlugins, tablePlugin]
})
```

## Pause and Resume

BlockTransformer supports manual pause and resume:

```ts
const { pause, resume, isPaused } = useBlockTransformer(sourceBlocks)

// Pause animation
pause()

// Resume animation
resume()

// Check if paused
console.log(isPaused)  // true / false
```

Auto pause on page visibility:

```ts
const { displayBlocks } = useBlockTransformer(sourceBlocks, {
  pauseOnHidden: true  // Enabled by default
})

// Automatically pauses when user switches to another tab
// Automatically resumes when user switches back
```

## With Auto Scroll

Typewriter effect usually needs auto scroll:

```vue
<script setup>
import { 
  useIncremark, 
  useBlockTransformer, 
  Incremark,
  AutoScrollContainer,
  defaultPlugins 
} from '@incremark/vue'

// ... transformer setup ...

const scrollRef = ref()
</script>

<template>
  <AutoScrollContainer ref="scrollRef" class="content">
    <Incremark :blocks="renderBlocks" />
  </AutoScrollContainer>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

See [Auto Scroll](./auto-scroll) guide for details.

## API Reference

### useBlockTransformer Return Values

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `displayBlocks` | `DisplayBlock[]` | Blocks for rendering |
| `isProcessing` | `boolean` | Whether processing is ongoing |
| `isPaused` | `boolean` | Whether paused |
| `effect` | `AnimationEffect` | Current animation effect |
| `skip()` | `Function` | Skip all animations |
| `reset()` | `Function` | Reset state |
| `pause()` | `Function` | Pause animation |
| `resume()` | `Function` | Resume animation |
| `setOptions()` | `Function` | Update options dynamically |
| `transformer` | `BlockTransformer` | Raw instance |

### DisplayBlock Structure

```ts
interface DisplayBlock {
  id: string                // Block ID
  node: RootContent         // Source AST node
  displayNode: RootContent  // Current display node (may be truncated)
  progress: number          // Display progress 0-1
  isDisplayComplete: boolean // Whether display is complete
}
```

### AnimationEffect Type

```ts
type AnimationEffect = 'none' | 'typing'
```

## Next Steps

- [Auto Scroll](./auto-scroll) - AutoScrollContainer usage guide
- [Custom Components](./custom-components) - Custom rendering components
- [API Reference](/api/vue) - Complete API documentation
