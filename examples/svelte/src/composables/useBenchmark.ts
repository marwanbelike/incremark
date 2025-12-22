/**
 * @file useBenchmark - 性能测试 Store
 * @description 用于对比传统方式和 Incremark 的性能
 */

import { writable, type Writable } from 'svelte/store'
import { createIncremarkParser } from '@incremark/core'

/**
 * 性能测试统计
 */
export interface BenchmarkStats {
  traditional: { time: number; parseCount: number; totalChars: number }
  incremark: { time: number; parseCount: number; totalChars: number }
}

/**
 * useBenchmark Store
 * 
 * @param append - 追加内容的函数
 * @param finalize - 完成解析的函数
 * @param reset - 重置的函数
 * @returns 性能测试相关的状态和方法
 */
export function useBenchmark(
  append: (chunk: string) => void,
  finalize: () => void,
  reset: () => void
) {
  const benchmarkMode = writable(false)
  const benchmarkRunning = writable(false)
  const benchmarkProgress = writable(0)
  const benchmarkStats = writable<BenchmarkStats>({
    traditional: { time: 0, parseCount: 0, totalChars: 0 },
    incremark: { time: 0, parseCount: 0, totalChars: 0 }
  })

  /**
   * 运行性能测试
   */
  async function runBenchmark(content: string) {
    reset()
    benchmarkRunning.set(true)
    benchmarkProgress.set(0)

    const chunks = content.match(/[\s\S]{1,20}/g) || []

    // 1. 测试传统方式：每次追加都重新从头解析全部内容
    let traditionalTime = 0
    let traditionalParseCount = 0
    let traditionalTotalChars = 0
    let accumulated = ''

    for (let i = 0; i < chunks.length; i++) {
      accumulated += chunks[i]
      const start = performance.now()
      const traditionalParser = createIncremarkParser({ gfm: true })
      traditionalParser.append(accumulated)
      traditionalParser.finalize()
      traditionalParser.getCompletedBlocks()
      traditionalTime += performance.now() - start
      traditionalParseCount++
      traditionalTotalChars += accumulated.length
      benchmarkProgress.set(((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }

    // 2. 测试 Incremark 增量方式
    reset()
    let incremarkTime = 0
    let incremarkParseCount = 0
    let incremarkTotalChars = 0

    for (let i = 0; i < chunks.length; i++) {
      const start = performance.now()
      append(chunks[i])
      incremarkTime += performance.now() - start
      incremarkParseCount++
      incremarkTotalChars += chunks[i].length
      benchmarkProgress.set(50 + ((i + 1) / chunks.length) * 50)
      await new Promise(r => setTimeout(r, 5))
    }
    finalize()

    benchmarkStats.set({
      traditional: { time: traditionalTime, parseCount: traditionalParseCount, totalChars: traditionalTotalChars },
      incremark: { time: incremarkTime, parseCount: incremarkParseCount, totalChars: incremarkTotalChars }
    })

    benchmarkRunning.set(false)
    benchmarkProgress.set(100)
  }

  return {
    benchmarkMode,
    benchmarkRunning,
    benchmarkProgress,
    benchmarkStats,
    runBenchmark
  }
}

