/**
 * Incremark vs Traditional Parser Benchmark
 * 
 * 对比增量解析和传统解析（每次重新解析全部内容）的性能差异
 */

import { IncremarkParser } from '../parser/IncremarkParser'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'

// 短文本测试（~800 字符）
const shortMarkdown = `
# Hello World

This is a paragraph with **bold** and *italic* text.

## Code Example

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
  return {
    name: 'test',
    value: 42
  };
}
\`\`\`

## List Example

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

## Table Example

| Name | Age | City |
|------|-----|------|
| Alice | 25 | NYC |
| Bob | 30 | LA |

## Blockquote

> This is a quote
> with multiple lines
> and **formatted** text

## More Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Subsection

More text here with [links](https://example.com) and \`inline code\`.

1. Ordered item 1
2. Ordered item 2
3. Ordered item 3

---

The end.
`

// 生成长文本（模拟真实 AI 输出）
function generateLongMarkdown(targetLength: number): string {
  const sections = [
    `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.

## Key Concepts

### Supervised Learning

In supervised learning, the algorithm learns from labeled training data, and makes predictions based on that data. Common algorithms include:

- **Linear Regression** - For predicting continuous values
- **Logistic Regression** - For classification problems
- **Decision Trees** - For both classification and regression
- **Random Forest** - Ensemble method using multiple decision trees
- **Support Vector Machines** - For classification with clear margins

\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train the model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)
\`\`\`

### Unsupervised Learning

Unsupervised learning deals with unlabeled data. The algorithm tries to find patterns and relationships in the data.

| Algorithm | Use Case | Complexity |
|-----------|----------|------------|
| K-Means | Clustering | O(n*k*i) |
| DBSCAN | Density clustering | O(n log n) |
| PCA | Dimensionality reduction | O(n*d²) |
| t-SNE | Visualization | O(n²) |

> "The goal of unsupervised learning is to discover hidden patterns or data groupings without the need for human intervention." - Andrew Ng

`,
    `
## Deep Learning

Deep learning is a subset of machine learning that uses neural networks with many layers.

### Neural Network Architecture

\`\`\`
Input Layer → Hidden Layer 1 → Hidden Layer 2 → ... → Output Layer
     ↓              ↓                ↓                    ↓
  Features      Activations      Activations          Predictions
\`\`\`

### Common Activation Functions

1. **ReLU (Rectified Linear Unit)**
   - Formula: \`f(x) = max(0, x)\`
   - Most commonly used in hidden layers

2. **Sigmoid**
   - Formula: \`f(x) = 1 / (1 + e^(-x))\`
   - Used for binary classification

3. **Softmax**
   - Used for multi-class classification
   - Outputs probability distribution

\`\`\`python
import torch
import torch.nn as nn

class NeuralNetwork(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNetwork, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, num_classes)
    
    def forward(self, x):
        out = self.layer1(x)
        out = self.relu(out)
        out = self.layer2(out)
        return out
\`\`\`

`,
    `
## Natural Language Processing

NLP is a field of AI that focuses on the interaction between computers and humans through natural language.

### Key Tasks

- **Text Classification** - Categorizing text into predefined categories
- **Named Entity Recognition** - Identifying entities like names, locations, organizations
- **Sentiment Analysis** - Determining the emotional tone of text
- **Machine Translation** - Translating text from one language to another
- **Question Answering** - Answering questions based on context

### Transformer Architecture

The transformer architecture revolutionized NLP with the introduction of self-attention mechanisms.

\`\`\`
┌─────────────────────────────────────┐
│           Transformer               │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  │
│  │   Encoder   │  │   Decoder   │  │
│  │             │  │             │  │
│  │ Self-Attn   │  │ Self-Attn   │  │
│  │ Feed-Forward│  │ Cross-Attn  │  │
│  │             │  │ Feed-Forward│  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
\`\`\`

> Transformers have become the foundation for large language models like GPT, BERT, and Claude.

`,
    `
## Best Practices

### Data Preprocessing

1. Handle missing values appropriately
2. Normalize or standardize numerical features
3. Encode categorical variables
4. Split data into train/validation/test sets
5. Apply data augmentation when appropriate

### Model Evaluation

| Metric | Formula | Use Case |
|--------|---------|----------|
| Accuracy | (TP+TN)/(TP+TN+FP+FN) | Balanced classes |
| Precision | TP/(TP+FP) | When FP is costly |
| Recall | TP/(TP+FN) | When FN is costly |
| F1 Score | 2*(P*R)/(P+R) | Imbalanced classes |
| AUC-ROC | Area under ROC curve | Binary classification |

### Hyperparameter Tuning

\`\`\`python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

grid_search = GridSearchCV(
    estimator=RandomForestClassifier(),
    param_grid=param_grid,
    cv=5,
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train, y_train)
print(f"Best parameters: {grid_search.best_params_}")
\`\`\`

---

This concludes our overview of machine learning fundamentals.

`
  ]

  let result = ''
  let sectionIndex = 0
  
  while (result.length < targetLength) {
    result += sections[sectionIndex % sections.length]
    sectionIndex++
  }
  
  return result.slice(0, targetLength)
}

// 默认测试用的 Markdown 内容
const testMarkdown = shortMarkdown

interface BenchmarkResult {
  name: string
  totalTime: number
  parseCount: number
  avgTimePerParse: number
  totalCharsParsed: number
}

/**
 * 模拟流式输入，将文本按 chunk 大小分割
 */
function simulateStream(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * 传统方式：每次收到新内容都重新解析全部文本
 */
function benchmarkTraditional(chunks: string[], iterations: number): BenchmarkResult {
  let totalTime = 0
  let totalCharsParsed = 0
  let parseCount = 0

  for (let iter = 0; iter < iterations; iter++) {
    let buffer = ''
    
    for (const chunk of chunks) {
      buffer += chunk
      
      const start = performance.now()
      fromMarkdown(buffer, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown()]
      })
      const end = performance.now()
      
      totalTime += (end - start)
      totalCharsParsed += buffer.length
      parseCount++
    }
  }

  return {
    name: 'Traditional (re-parse all)',
    totalTime,
    parseCount,
    avgTimePerParse: totalTime / parseCount,
    totalCharsParsed
  }
}

/**
 * Incremark 方式：增量解析
 */
function benchmarkIncremental(chunks: string[], iterations: number): BenchmarkResult {
  let totalTime = 0
  let totalCharsParsed = 0
  let parseCount = 0

  for (let iter = 0; iter < iterations; iter++) {
    const parser = new IncremarkParser({ gfm: true })
    
    for (const chunk of chunks) {
      const start = performance.now()
      parser.append(chunk)
      const end = performance.now()
      
      totalTime += (end - start)
      totalCharsParsed += chunk.length
      parseCount++
    }
    
    const start = performance.now()
    parser.finalize()
    const end = performance.now()
    totalTime += (end - start)
  }

  return {
    name: 'Incremark (incremental)',
    totalTime,
    parseCount,
    avgTimePerParse: totalTime / parseCount,
    totalCharsParsed
  }
}

/**
 * 运行 benchmark
 */
export function runBenchmark(options: {
  chunkSize?: number
  iterations?: number
  markdown?: string
  markdownLength?: number
} = {}) {
  const {
    chunkSize = 10,
    iterations = 100,
    markdownLength
  } = options
  
  // 如果指定了长度，生成对应长度的 Markdown
  const markdown = markdownLength 
    ? generateLongMarkdown(markdownLength) 
    : (options.markdown || testMarkdown)

  const chunks = simulateStream(markdown, chunkSize)
  
  console.log('='.repeat(60))
  console.log('Incremark Benchmark')
  console.log('='.repeat(60))
  console.log(`Markdown length: ${markdown.length} chars`)
  console.log(`Chunk size: ${chunkSize} chars`)
  console.log(`Total chunks: ${chunks.length}`)
  console.log(`Iterations: ${iterations}`)
  console.log('='.repeat(60))
  console.log('')

  // 预热
  console.log('Warming up...')
  benchmarkTraditional(chunks, 5)
  benchmarkIncremental(chunks, 5)
  console.log('')

  // 正式测试
  console.log('Running benchmark...')
  console.log('')

  const traditional = benchmarkTraditional(chunks, iterations)
  const incremental = benchmarkIncremental(chunks, iterations)

  // 计算节省百分比
  const timeSaved = ((traditional.totalTime - incremental.totalTime) / traditional.totalTime * 100).toFixed(1)
  const charsSaved = ((traditional.totalCharsParsed - incremental.totalCharsParsed) / traditional.totalCharsParsed * 100).toFixed(1)

  console.log('Results:')
  console.log('-'.repeat(60))
  console.log('')
  
  console.log(`📊 ${traditional.name}`)
  console.log(`   Total time: ${traditional.totalTime.toFixed(2)} ms`)
  console.log(`   Parse count: ${traditional.parseCount}`)
  console.log(`   Avg time per parse: ${traditional.avgTimePerParse.toFixed(4)} ms`)
  console.log(`   Total chars parsed: ${traditional.totalCharsParsed.toLocaleString()}`)
  console.log('')
  
  console.log(`⚡ ${incremental.name}`)
  console.log(`   Total time: ${incremental.totalTime.toFixed(2)} ms`)
  console.log(`   Parse count: ${incremental.parseCount}`)
  console.log(`   Avg time per parse: ${incremental.avgTimePerParse.toFixed(4)} ms`)
  console.log(`   Total chars parsed: ${incremental.totalCharsParsed.toLocaleString()}`)
  console.log('')

  console.log('-'.repeat(60))
  console.log('')
  console.log(`🎯 Performance Improvement:`)
  console.log(`   Time saved: ${timeSaved}%`)
  console.log(`   Chars parsing saved: ${charsSaved}%`)
  console.log(`   Speedup: ${(traditional.totalTime / incremental.totalTime).toFixed(2)}x faster`)
  console.log('')
  console.log('='.repeat(60))

  return {
    traditional,
    incremental,
    timeSaved: parseFloat(timeSaved),
    charsSaved: parseFloat(charsSaved),
    speedup: traditional.totalTime / incremental.totalTime
  }
}

// 如果直接运行此文件
if (typeof process !== 'undefined' && process.argv[1]?.includes('benchmark')) {
  runBenchmark()
}

