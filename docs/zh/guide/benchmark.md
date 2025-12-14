# 性能测试报告

本页展示 Incremark 与传统解析方式的真实性能对比测试结果。

## 测试环境

- **Node.js**: v20+
- **硬件**: Apple M 系列 / Intel Core
- **测试内容**: 混合 Markdown（标题、代码块、列表、表格、引用）
- **对比方式**: 传统方式（每次重新解析全部内容）vs Incremark（增量解析）

## 结果摘要

### 不同文档大小的性能表现

| 文档大小 | 加速比 | 时间节省 | 解析量减少 |
|---------|-------|---------|-----------|
| 短文档 (~1KB) | **2.3x** | 57% | 94% |
| 中等文档 (~5KB) | **10x** | 90% | 99% |
| 长文档 (~10KB) | **20x** | 95% | 99.8% |
| 超长文档 (~20KB) | **46x** | 97.8% | 99.9% |

### 极端场景：20KB 文档

在典型 AI 流式输出场景（20KB 文档，每次输入 10 字符）：

| 指标 | 传统方式 | Incremark |
|-----|---------|-----------|
| 总耗时 | 183 秒 | **4 秒** |
| 解析字符量 | 4 亿 | 40 万 |
| 加速比 | 1x | **46x** |

> 🚀 传统方式需要 **3 分钟**，Incremark 只需 **4 秒**！

## 为什么有如此巨大的提升？

### 传统方式：O(n²) 复杂度

```
Chunk 1:  解析 "你好"           → 2 字符
Chunk 2:  解析 "你好世界"        → 4 字符  
Chunk 3:  解析 "你好世界！"      → 5 字符
...
Chunk n:  解析整个文档           → n 字符

总计: 2 + 4 + 5 + ... + n = O(n²)
```

### Incremark：O(n) 复杂度

```
Chunk 1:  解析 "你好"           → 2 字符（新增）
Chunk 2:  解析 "世界"           → 2 字符（仅新增部分）
Chunk 3:  解析 "！"             → 1 字符（仅新增部分）
...
Chunk n:  仅解析新增内容         → 常量

总计: 2 + 2 + 1 + ... = O(n)
```

## 详细测试结果

### 短文档 (~1KB)

```
📊 传统方式 (重新解析全部)
   总耗时: 435.85 ms
   解析字符量: 1,010,000

⚡ Incremark (增量解析)
   总耗时: 171.50 ms
   解析字符量: 20,000

🎯 结果: 快 2.54 倍，解析量减少 98%
```

### 中等文档 (~5KB)

```
📊 传统方式 (重新解析全部)
   总耗时: 10,335 ms
   解析字符量: 25,050,000

⚡ Incremark (增量解析)
   总耗时: 916 ms
   解析字符量: 100,000

🎯 结果: 快 11.28 倍，解析量减少 99.6%
```

### 长文档 (~10KB)

```
📊 传统方式 (重新解析全部)
   总耗时: 40,596 ms
   解析字符量: 100,100,000

⚡ Incremark (增量解析)
   总耗时: 1,781 ms
   解析字符量: 200,000

🎯 结果: 快 22.78 倍，解析量减少 99.8%
```

### 超长文档 (~20KB)

```
📊 传统方式 (重新解析全部)
   总耗时: 183,844 ms (超过 3 分钟！)
   解析字符量: 400,200,000

⚡ Incremark (增量解析)
   总耗时: 3,997 ms (约 4 秒)
   解析字符量: 400,000

🎯 结果: 快 45.99 倍，解析量减少 99.9%
```

## 原始测试输出

<details>
<summary>点击展开完整测试输出</summary>

```
============================================================
Incremark Benchmark
============================================================
Markdown length: 771 chars
Chunk size: 10 chars
Total chunks: 78
Iterations: 100
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 2608.41 ms
   Parse count: 7800
   Avg time per parse: 0.3344 ms
   Total chars parsed: 3,080,100

⚡ Incremark (incremental)
   Total time: 638.36 ms
   Parse count: 7800
   Avg time per parse: 0.0818 ms
   Total chars parsed: 77,100

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 75.5%
   Chars parsing saved: 97.5%
   Speedup: 4.09x faster

============================================================

🔬 Running Incremark Benchmark Suite


============================================================
📄 Document Size: Short (~1KB) (1000 chars)
============================================================

📦 Chunk size: 10 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 1000 chars
Chunk size: 10 chars
Total chunks: 100
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 435.85 ms
   Parse count: 2000
   Avg time per parse: 0.2179 ms
   Total chars parsed: 1,010,000

⚡ Incremark (incremental)
   Total time: 171.50 ms
   Parse count: 2000
   Avg time per parse: 0.0858 ms
   Total chars parsed: 20,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 60.7%
   Chars parsing saved: 98.0%
   Speedup: 2.54x faster

============================================================

📦 Chunk size: 50 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 1000 chars
Chunk size: 50 chars
Total chunks: 20
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 92.33 ms
   Parse count: 400
   Avg time per parse: 0.2308 ms
   Total chars parsed: 210,000

⚡ Incremark (incremental)
   Total time: 43.77 ms
   Parse count: 400
   Avg time per parse: 0.1094 ms
   Total chars parsed: 20,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 52.6%
   Chars parsing saved: 90.5%
   Speedup: 2.11x faster

============================================================

============================================================
📄 Document Size: Medium (~5KB) (5000 chars)
============================================================

📦 Chunk size: 10 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 5000 chars
Chunk size: 10 chars
Total chunks: 500
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 10335.94 ms
   Parse count: 10000
   Avg time per parse: 1.0336 ms
   Total chars parsed: 25,050,000

⚡ Incremark (incremental)
   Total time: 916.48 ms
   Parse count: 10000
   Avg time per parse: 0.0916 ms
   Total chars parsed: 100,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 91.1%
   Chars parsing saved: 99.6%
   Speedup: 11.28x faster

============================================================

📦 Chunk size: 50 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 5000 chars
Chunk size: 50 chars
Total chunks: 100
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 2120.47 ms
   Parse count: 2000
   Avg time per parse: 1.0602 ms
   Total chars parsed: 5,050,000

⚡ Incremark (incremental)
   Total time: 223.64 ms
   Parse count: 2000
   Avg time per parse: 0.1118 ms
   Total chars parsed: 100,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 89.5%
   Chars parsing saved: 98.0%
   Speedup: 9.48x faster

============================================================

============================================================
📄 Document Size: Long (~10KB) (10000 chars)
============================================================

📦 Chunk size: 10 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 10000 chars
Chunk size: 10 chars
Total chunks: 1000
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 40596.85 ms
   Parse count: 20000
   Avg time per parse: 2.0298 ms
   Total chars parsed: 100,100,000

⚡ Incremark (incremental)
   Total time: 1781.89 ms
   Parse count: 20000
   Avg time per parse: 0.0891 ms
   Total chars parsed: 200,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 95.6%
   Chars parsing saved: 99.8%
   Speedup: 22.78x faster

============================================================

📦 Chunk size: 50 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 10000 chars
Chunk size: 50 chars
Total chunks: 200
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 8095.40 ms
   Parse count: 4000
   Avg time per parse: 2.0239 ms
   Total chars parsed: 20,100,000

⚡ Incremark (incremental)
   Total time: 473.23 ms
   Parse count: 4000
   Avg time per parse: 0.1183 ms
   Total chars parsed: 200,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 94.2%
   Chars parsing saved: 99.0%
   Speedup: 17.11x faster

============================================================

============================================================
📄 Document Size: Very Long (~20KB) (20000 chars)
============================================================

📦 Chunk size: 10 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 20000 chars
Chunk size: 10 chars
Total chunks: 2000
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 183844.78 ms
   Parse count: 40000
   Avg time per parse: 4.5961 ms
   Total chars parsed: 400,200,000

⚡ Incremark (incremental)
   Total time: 3997.77 ms
   Parse count: 40000
   Avg time per parse: 0.0999 ms
   Total chars parsed: 400,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 97.8%
   Chars parsing saved: 99.9%
   Speedup: 45.99x faster

============================================================

📦 Chunk size: 50 chars

============================================================
Incremark Benchmark
============================================================
Markdown length: 20000 chars
Chunk size: 50 chars
Total chunks: 400
Iterations: 20
============================================================

Warming up...

Running benchmark...

Results:
------------------------------------------------------------

📊 Traditional (re-parse all)
   Total time: 37400.52 ms
   Parse count: 8000
   Avg time per parse: 4.6751 ms
   Total chars parsed: 80,200,000

⚡ Incremark (incremental)
   Total time: 1001.10 ms
   Parse count: 8000
   Avg time per parse: 0.1251 ms
   Total chars parsed: 400,000

------------------------------------------------------------

🎯 Performance Improvement:
   Time saved: 97.3%
   Chars parsing saved: 99.5%
   Speedup: 37.36x faster

============================================================


================================================================================
📈 Complete Benchmark Summary
================================================================================

| Document Size    | Chunk | Time Saved | Chars Saved | Speedup |
|------------------|-------|------------|-------------|---------|
| Short (~1KB)     | 10    |      60.7% |       98.0% |   2.54x |
| Short (~1KB)     | 50    |      52.6% |       90.5% |   2.11x |
| Medium (~5KB)    | 10    |      91.1% |       99.6% |  11.28x |
| Medium (~5KB)    | 50    |      89.5% |       98.0% |   9.48x |
| Long (~10KB)     | 10    |      95.6% |       99.8% |  22.78x |
| Long (~10KB)     | 50    |      94.2% |       99.0% |  17.11x |
| Very Long (~20KB) | 10    |      97.8% |       99.9% |  45.99x |
| Very Long (~20KB) | 50    |      97.3% |       99.5% |  37.36x |

--------------------------------------------------------------------------------

📊 Average by Document Size:

   Short (~1KB): 2.33x faster, 56.7% time saved
   Medium (~5KB): 10.38x faster, 90.3% time saved
   Long (~10KB): 19.94x faster, 94.9% time saved
   Very Long (~20KB): 41.67x faster, 97.5% time saved

--------------------------------------------------------------------------------

🎯 Overall Average:
   Time Saved: 84.8%
   Chars Saved: 98.0%
   Speedup: 18.58x

================================================================================
```

</details>

## 自己运行测试

你可以自己运行性能测试：

```bash
git clone https://github.com/kingshuaishuai/incremark.git
cd incremark
pnpm install
pnpm benchmark
```

## 结论

| 场景 | 性能提升 |
|-----|---------|
| 短回复 (~1KB) | 2-4 倍加速 |
| 中等回复 (~5KB) | 10 倍加速 |
| 长回复 (~10KB) | 20 倍加速 |
| 超长回复 (~20KB+) | **40-50 倍加速** |

AI 回复越长，性能提升越惊人。对于典型的 AI 聊天应用（回复 5KB 以上），预期可获得 **10 倍以上**的性能提升。

---

> 💡 **一句话总结**：传统方式需要 3 分钟，Incremark 只要 4 秒。这就是增量解析的威力！

