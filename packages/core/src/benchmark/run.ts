import { runBenchmark } from './index'

console.log('')
console.log('🔬 Running Incremark Benchmark Suite')
console.log('')

// 不同文档长度的测试
const documentSizes = [
  { name: 'Short (~1KB)', length: 1000 },
  { name: 'Medium (~5KB)', length: 5000 },
  { name: 'Long (~10KB)', length: 10000 },
  { name: 'Very Long (~20KB)', length: 20000 },
]

const allResults: Array<{
  docSize: string
  docLength: number
  chunkSize: number
  timeSaved: number
  charsSaved: number
  speedup: number
}> = []

for (const doc of documentSizes) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📄 Document Size: ${doc.name} (${doc.length} chars)`)
  console.log('='.repeat(60))
  
  // 测试不同 chunk 大小
  for (const chunkSize of [10, 50]) {
    console.log(`\n📦 Chunk size: ${chunkSize} chars\n`)
    const result = runBenchmark({ 
      chunkSize, 
      iterations: 20,
      markdownLength: doc.length
    })
    allResults.push({
      docSize: doc.name,
      docLength: doc.length,
      chunkSize,
      timeSaved: result.timeSaved,
      charsSaved: result.charsSaved,
      speedup: result.speedup
    })
  }
}

// 汇总报告
console.log('\n')
console.log('='.repeat(80))
console.log('📈 Complete Benchmark Summary')
console.log('='.repeat(80))
console.log('')
console.log('| Document Size    | Chunk | Time Saved | Chars Saved | Speedup |')
console.log('|------------------|-------|------------|-------------|---------|')
for (const r of allResults) {
  console.log(`| ${r.docSize.padEnd(16)} | ${r.chunkSize.toString().padEnd(5)} | ${r.timeSaved.toFixed(1).padStart(9)}% | ${r.charsSaved.toFixed(1).padStart(10)}% | ${r.speedup.toFixed(2).padStart(6)}x |`)
}
console.log('')

// 计算平均值
const avgTimeSaved = allResults.reduce((sum, r) => sum + r.timeSaved, 0) / allResults.length
const avgCharsSaved = allResults.reduce((sum, r) => sum + r.charsSaved, 0) / allResults.length
const avgSpeedup = allResults.reduce((sum, r) => sum + r.speedup, 0) / allResults.length

// 按文档大小分组计算
const byDocSize = new Map<string, typeof allResults>()
for (const r of allResults) {
  if (!byDocSize.has(r.docSize)) {
    byDocSize.set(r.docSize, [])
  }
  byDocSize.get(r.docSize)!.push(r)
}

console.log('-'.repeat(80))
console.log('')
console.log('📊 Average by Document Size:')
console.log('')
for (const [size, results] of byDocSize) {
  const avgSpeed = results.reduce((sum, r) => sum + r.speedup, 0) / results.length
  const avgTime = results.reduce((sum, r) => sum + r.timeSaved, 0) / results.length
  console.log(`   ${size}: ${avgSpeed.toFixed(2)}x faster, ${avgTime.toFixed(1)}% time saved`)
}
console.log('')

console.log('-'.repeat(80))
console.log('')
console.log(`🎯 Overall Average:`)
console.log(`   Time Saved: ${avgTimeSaved.toFixed(1)}%`)
console.log(`   Chars Saved: ${avgCharsSaved.toFixed(1)}%`)
console.log(`   Speedup: ${avgSpeedup.toFixed(2)}x`)
console.log('')
console.log('='.repeat(80))
