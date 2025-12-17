# Auto-scroll

AutoScrollContainer is a smart auto-scroll container designed for streaming content scenarios.

## Features

- ✅ Auto-scroll to bottom when content updates
- ✅ Pause auto-scroll when user manually scrolls up
- ✅ Resume auto-scroll when user scrolls back to bottom
- ✅ Reset auto-scroll state when scrollbar disappears

## Vue Usage

```vue
<script setup>
import { ref } from 'vue'
import { useIncremark, Incremark, AutoScrollContainer } from '@incremark/vue'

const { blocks, append, finalize, reset } = useIncremark()
const scrollRef = ref()
const autoScrollEnabled = ref(true)
</script>

<template>
  <AutoScrollContainer 
    ref="scrollRef" 
    :enabled="autoScrollEnabled"
    :threshold="50"
    behavior="instant"
    class="content"
  >
    <Incremark :blocks="blocks" />
  </AutoScrollContainer>
  
  <!-- Toggle -->
  <label>
    <input type="checkbox" v-model="autoScrollEnabled" />
    Auto-scroll
  </label>
  
  <!-- Status -->
  <span v-if="scrollRef?.isUserScrolledUp?.()">
    Paused (user scrolled up)
  </span>
  
  <!-- Force scroll -->
  <button @click="scrollRef?.scrollToBottom()">
    Scroll to Bottom
  </button>
</template>

<style>
.content {
  max-height: 70vh;
  overflow: hidden;
}
</style>
```

## React Usage

```tsx
import { useRef, useState } from 'react'
import { 
  useIncremark, 
  Incremark, 
  AutoScrollContainer,
  type AutoScrollContainerRef 
} from '@incremark/react'

function App() {
  const { blocks, append, finalize, reset } = useIncremark()
  const scrollRef = useRef<AutoScrollContainerRef>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  return (
    <div>
      <AutoScrollContainer 
        ref={scrollRef} 
        enabled={autoScrollEnabled}
        threshold={50}
        behavior="instant"
        className="content"
      >
        <Incremark blocks={blocks} />
      </AutoScrollContainer>
      
      {/* Toggle */}
      <label>
        <input 
          type="checkbox" 
          checked={autoScrollEnabled}
          onChange={e => setAutoScrollEnabled(e.target.checked)}
        />
        Auto-scroll
      </label>
      
      {/* Status */}
      {scrollRef.current?.isUserScrolledUp() && (
        <span>Paused (user scrolled up)</span>
      )}
      
      {/* Force scroll */}
      <button onClick={() => scrollRef.current?.scrollToBottom()}>
        Scroll to Bottom
      </button>
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-scroll |
| `threshold` | `number` | `50` | Bottom threshold to trigger auto-scroll (pixels) |
| `behavior` | `ScrollBehavior` | `'instant'` | Scroll behavior |

### behavior Options

| Value | Description |
|-------|-------------|
| `'instant'` | Instant scroll (default, recommended for streaming) |
| `'smooth'` | Smooth scroll (may lag behind content updates) |
| `'auto'` | Browser default behavior |

## Exposed Methods

Access via `ref`:

| Method | Description |
|--------|-------------|
| `scrollToBottom()` | Force scroll to bottom (ignores isUserScrolledUp) |
| `isUserScrolledUp()` | Returns whether user manually scrolled up |
| `container` | Container DOM element reference |

## How It Works

### Pause Logic

Auto-scroll only pauses when:
1. User **actively scrolls up** (scrollTop decreases)
2. AND content height **hasn't changed** (scrollHeight unchanged)

This distinguishes "user manual scroll" from "position change due to content growth".

### Resume Logic

Auto-scroll resumes when:
1. User scrolls to bottom area (distance ≤ threshold)
2. Scrollbar disappears (content height ≤ container height)

## With Typewriter Effect

Recommended to use with BlockTransformer:

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

## Styling Tips

```css
/* Container needs fixed height */
.content {
  max-height: 70vh;
  overflow: hidden;  /* Hide container's own scrollbar */
}

/* AutoScrollContainer handles scrolling internally */
```

## FAQ

### Why is scrolling not immediate?

Default `behavior="instant"` should be immediate. If using `behavior="smooth"`, animation may lag behind content update speed.

### Why does it pause when content updates?

This was a bug in older versions, now fixed. Only user active scroll up (scrollTop decreases AND scrollHeight unchanged) triggers pause.

### How to restore auto-scroll after content reset?

When scrollbar disappears (content cleared), auto-scroll state automatically resets.

## Next Steps

- [Typewriter Effect](./typewriter) - BlockTransformer usage guide
- [Custom Components](./custom-components) - Custom render components
- [API Reference](/api/vue) - Complete API documentation

