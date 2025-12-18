# 🚀 Incremark React Example

Welcome to **Incremark**! An incremental Markdown parser designed for AI streaming output.

## 📋 Features

- **Incremental Parsing**: Only parse new content, saving 90%+ CPU overhead
- **Typewriter Effect**: Character-by-character display for realistic typing experience
- **React Integration**: Clean Hooks API
- **GFM Support**: Tables, task lists, strikethrough, etc.

## ⌨️ Typewriter Effect

BlockTransformer provides typewriter effect support:

- **Character-by-character display**: Control chars displayed per tick
- **Adjustable speed**: Change tick interval for different speeds
- **Skip function**: Skip animation to show all content immediately
- **Plugin system**: Code blocks, images can display as a whole

## 💻 Code Example

```typescript
import { useIncremark, useBlockTransformer, Incremark } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()
  
  // Convert to SourceBlock format
  const sourceBlocks = completedBlocks.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
  
  // Add typewriter effect
  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50
  })
  
  return (
    <div>
      <Incremark blocks={displayBlocks} />
      {isProcessing && <button onClick={skip}>Skip</button>}
    </div>
  )
}
```

## 📊 Performance Comparison

| Metric | Traditional | Incremark | Improvement |
|--------|-------------|-----------|-------------|
| Parse Volume | ~500K chars | ~50K chars | 90% ↓ |
| CPU Usage | High | Low | 80% ↓ |
| Frame Rate | Laggy | Smooth | ✅ |

## 📝 Task List

- [x] Core Parser
- [x] Vue 3 Integration
- [x] React Integration
- [x] Typewriter Effect
- [ ] More Extensions

## 📝 Quote Example

> 💡 **Tip**: Incremark's core advantage is **parsing-level incrementalization**, not just render-level optimization.

**Thanks for using Incremark!** 🙏

