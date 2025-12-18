# 🚀 Incremark React 示例

欢迎使用 **Incremark**！这是一个专为 AI 流式输出设计的增量 Markdown 解析器。

## 📋 功能特点

- **增量解析**：只解析新增内容，节省 90% 以上的 CPU 开销
- **打字机效果**：逐字符显示，模拟真实打字体验
- **React 集成**：简洁的 Hooks API
- **GFM 支持**：表格、任务列表、删除线等

## ⌨️ 打字机效果

BlockTransformer 提供了打字机效果的支持：

- **逐字符显示**：控制每次显示的字符数
- **速度可调**：调节 tick 间隔实现不同速度
- **跳过功能**：随时跳过动画显示全部内容
- **插件系统**：代码块、图片等可整体显示

## 💻 代码示例

```typescript
import { useIncremark, useBlockTransformer, Incremark } from '@incremark/react'

function App() {
  const { completedBlocks, append, finalize } = useIncremark()
  
  // 转换为 SourceBlock 格式
  const sourceBlocks = completedBlocks.map(block => ({
    id: block.id,
    node: block.node,
    status: block.status
  }))
  
  // 添加打字机效果
  const { displayBlocks, isProcessing, skip } = useBlockTransformer(sourceBlocks, {
    charsPerTick: 2,
    tickInterval: 50
  })
  
  return (
    <div>
      <Incremark blocks={displayBlocks} />
      {isProcessing && <button onClick={skip}>跳过</button>}
    </div>
  )
}
```

## 📊 性能对比

| 指标 | 传统方式 | Incremark | 提升 |
|------|----------|-----------|------|
| 解析量 | ~50万字符 | ~5万字符 | 90% ↓ |
| CPU 占用 | 高 | 低 | 80% ↓ |
| 渲染帧率 | 卡顿 | 流畅 | ✅ |

## 📝 任务清单

- [x] 核心解析器
- [x] Vue 3 集成
- [x] React 集成
- [x] 打字机效果
- [ ] 更多扩展

## 📝 引用示例

> 💡 **提示**：Incremark 的核心优势是 **解析层增量化**，而非仅仅是渲染层优化。

**感谢使用 Incremark！** 🙏

