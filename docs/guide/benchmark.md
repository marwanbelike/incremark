# Benchmark

This page presents real performance test results comparing Incremark with traditional parsing approaches.

## Test Environment

- **Node.js**: v20+
- **Hardware**: Apple M-series / Intel Core
- **Test Content**: Mixed Markdown (headings, code blocks, lists, tables, quotes)
- **Comparison**: Traditional approach (re-parse all content every time) vs Incremark (incremental parsing)

## Results Summary

### Performance by Document Size

| Document Size | Speedup | Time Saved | Chars Saved |
|--------------|---------|------------|-------------|
| Short (~1KB) | **2.3x** | 57% | 94% |
| Medium (~5KB) | **10x** | 90% | 99% |
| Long (~10KB) | **20x** | 95% | 99.8% |
| Very Long (~20KB) | **46x** | 97.8% | 99.9% |

### Extreme Case: 20KB Document

In a typical AI streaming scenario (20KB document, 10-char chunks):

| Metric | Traditional | Incremark |
|--------|------------|-----------|
| Total Time | 183 seconds | **4 seconds** |
| Chars Parsed | 400,000,000 | 400,000 |
| Speedup | 1x | **46x** |

> 🚀 Traditional parsing takes **3 minutes**, Incremark takes just **4 seconds**!

## Why Such Dramatic Improvement?

### Traditional Approach: O(n²) Complexity

```
Chunk 1:  Parse "Hello"           → 5 chars
Chunk 2:  Parse "Hello World"     → 11 chars  
Chunk 3:  Parse "Hello World!"    → 12 chars
...
Chunk n:  Parse entire document   → n chars

Total: 5 + 11 + 12 + ... + n = O(n²)
```

### Incremark: O(n) Complexity

```
Chunk 1:  Parse "Hello"           → 5 chars (new)
Chunk 2:  Parse " World"          → 6 chars (new only)
Chunk 3:  Parse "!"               → 1 char (new only)
...
Chunk n:  Parse new content only  → constant

Total: 5 + 6 + 1 + ... = O(n)
```

## Detailed Results

### Short Document (~1KB)

```
📊 Traditional (re-parse all)
   Total time: 435.85 ms
   Total chars parsed: 1,010,000

⚡ Incremark (incremental)
   Total time: 171.50 ms
   Total chars parsed: 20,000

🎯 Result: 2.54x faster, 98% less parsing
```

### Medium Document (~5KB)

```
📊 Traditional (re-parse all)
   Total time: 10,335 ms
   Total chars parsed: 25,050,000

⚡ Incremark (incremental)
   Total time: 916 ms
   Total chars parsed: 100,000

🎯 Result: 11.28x faster, 99.6% less parsing
```

### Long Document (~10KB)

```
📊 Traditional (re-parse all)
   Total time: 40,596 ms
   Total chars parsed: 100,100,000

⚡ Incremark (incremental)
   Total time: 1,781 ms
   Total chars parsed: 200,000

🎯 Result: 22.78x faster, 99.8% less parsing
```

### Very Long Document (~20KB)

```
📊 Traditional (re-parse all)
   Total time: 183,844 ms (3+ minutes!)
   Total chars parsed: 400,200,000

⚡ Incremark (incremental)
   Total time: 3,997 ms (~4 seconds)
   Total chars parsed: 400,000

🎯 Result: 45.99x faster, 99.9% less parsing
```

## Raw Benchmark Output

<details>
<summary>Click to expand full benchmark output</summary>

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

## Run Your Own Benchmark

You can run the benchmark yourself:

```bash
git clone https://github.com/kingshuaishuai/incremark.git
cd incremark
pnpm install
pnpm benchmark
```

## Conclusion

| Scenario | Improvement |
|----------|-------------|
| Short responses (~1KB) | 2-4x faster |
| Medium responses (~5KB) | 10x faster |
| Long responses (~10KB) | 20x faster |
| Very long responses (~20KB+) | **40-50x faster** |

The longer the AI response, the more dramatic the performance improvement. For typical AI chat applications with responses of 5KB or more, expect **10x or better** performance gains.

