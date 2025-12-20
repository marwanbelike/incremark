import type { RootContent, Text } from 'mdast'
import type { AstNode } from '../types'

/**
 * 文本块片段（用于渐入动画）
 */
export interface TextChunk {
  /** 文本内容 */
  text: string
  /** 创建时间戳 */
  createdAt: number
}

/**
 * 扩展的文本节点（支持 chunks）
 */
export interface TextNodeWithChunks extends Text {
  /** 稳定部分的长度（不需要动画） */
  stableLength?: number
  /** 临时的文本片段，用于渐入动画 */
  chunks?: TextChunk[]
}

/**
 * 计算 AST 节点的总字符数
 */
export function countChars(node: RootContent): number {
  return countCharsInNode(node as AstNode)
}

/**
 * 计算单个 AST 节点的字符数（内部辅助函数）
 */
function countCharsInNode(n: AstNode): number {
  if (n.value && typeof n.value === 'string') {
    return n.value.length
  }
  if (n.children && Array.isArray(n.children)) {
    let count = 0
    for (const child of n.children) {
      count += countCharsInNode(child)
    }
    return count
  }
  // 其他节点（如 thematicBreak, image）算作 1 个字符
  return 1
}

/**
 * 累积的 chunks 信息
 */
export interface AccumulatedChunks {
  /** 已经稳定显示的字符数（不需要动画） */
  stableChars: number
  /** 累积的 chunk 列表 */
  chunks: TextChunk[]
}

/** chunk 范围信息 */
interface ChunkRange {
  start: number
  end: number
  chunk: TextChunk
}

/**
 * 截断 AST 节点，只保留前 maxChars 个字符
 * 支持 chunks（用于渐入动画）
 * 支持增量模式：跳过已处理的字符，只处理新增部分
 * 
 * @param node 原始节点
 * @param maxChars 最大字符数
 * @param accumulatedChunks 累积的 chunks 信息（用于渐入动画）
 * @param skipChars 跳过前 N 个字符（已处理的部分，用于增量追加）
 * @returns 截断后的节点，如果 maxChars <= 0 返回 null
 */
export function sliceAst(
  node: RootContent, 
  maxChars: number,
  accumulatedChunks?: AccumulatedChunks,
  skipChars: number = 0
): RootContent | null {
  if (maxChars <= 0) return null
  if (skipChars >= maxChars) return null

  let remaining = maxChars - skipChars  // 只处理新增部分
  let charIndex = 0
  
  // 计算 chunks 在文本中的范围
  const chunkRanges: ChunkRange[] = []
  if (accumulatedChunks && accumulatedChunks.chunks.length > 0) {
    let chunkStart = accumulatedChunks.stableChars
    for (const chunk of accumulatedChunks.chunks) {
      chunkRanges.push({
        start: chunkStart,
        end: chunkStart + chunk.text.length,
        chunk
      })
      chunkStart += chunk.text.length
    }
  }

  function process(n: AstNode): AstNode | null {
    if (remaining <= 0) return null

    // 文本类节点：截断 value，可能添加 chunks
    if (n.value && typeof n.value === 'string') {
      const nodeStart = charIndex
      const nodeEnd = charIndex + n.value.length
      
      // 如果整个节点都在 skipChars 之前，跳过
      if (nodeEnd <= skipChars) {
        charIndex = nodeEnd
        return null
      }
      
      // 如果节点跨越 skipChars，需要从 skipChars 位置开始取
      const skipInNode = Math.max(0, skipChars - nodeStart)
      const take = Math.min(n.value.length - skipInNode, remaining)
      remaining -= take
      if (take === 0) return null

      const slicedValue = n.value.slice(skipInNode, skipInNode + take)
      charIndex = nodeEnd
      
      const result: AstNode & { stableLength?: number; chunks?: TextChunk[] } = { 
        ...n, 
        value: slicedValue 
      }
      
      // 检查是否有 chunks 落在这个节点范围内
      if (chunkRanges.length > 0 && accumulatedChunks) {
        const nodeChunks: TextChunk[] = []
        let firstChunkLocalStart = take  // 第一个 chunk 在节点中的起始位置
        
        for (const range of chunkRanges) {
          // 计算 chunk 与当前节点的交集（考虑 skipChars）
          const overlapStart = Math.max(range.start, nodeStart + skipInNode)
          const overlapEnd = Math.min(range.end, nodeStart + skipInNode + take)
          
          if (overlapStart < overlapEnd) {
            // 有交集，提取对应的文本（相对于 slicedValue）
            const localStart = overlapStart - (nodeStart + skipInNode)
            const localEnd = overlapEnd - (nodeStart + skipInNode)
            const chunkText = slicedValue.slice(localStart, localEnd)
            
            if (chunkText.length > 0) {
              // 记录第一个 chunk 的起始位置
              if (nodeChunks.length === 0) {
                firstChunkLocalStart = localStart
              }
              nodeChunks.push({
                text: chunkText,
                createdAt: range.chunk.createdAt
              })
            }
          }
        }
        
        if (nodeChunks.length > 0) {
          result.stableLength = firstChunkLocalStart
          result.chunks = nodeChunks
        }
      }
      
      return result
    }

    // 容器节点：递归处理 children
    if (n.children && Array.isArray(n.children)) {
      const newChildren: AstNode[] = []
      let childCharIndex = charIndex
      
      for (const child of n.children) {
        if (remaining <= 0) break
        
        // 计算子节点的字符范围
        const childChars = countCharsInNode(child as AstNode)
        const childStart = childCharIndex
        const childEnd = childCharIndex + childChars
        
        // 如果子节点完全在 skipChars 之前，跳过
        if (childEnd <= skipChars) {
          childCharIndex = childEnd
          continue
        }
        
        // 如果子节点跨越 skipChars，需要处理
        // 临时更新 charIndex 以便子节点正确处理 skipChars
        const savedCharIndex = charIndex
        charIndex = childStart
        const processed = process(child)
        charIndex = savedCharIndex
        
        if (processed) {
          newChildren.push(processed)
        }
        
        childCharIndex = childEnd
      }
      
      if (newChildren.length === 0) {
        return null
      }
      return { ...n, children: newChildren }
    }

    // 其他节点（如 thematicBreak, image）
    remaining -= 1
    charIndex += 1
    return { ...n }
  }

  return process(node as AstNode) as RootContent | null
}

/**
 * 增量追加：将新增的字符范围追加到现有的 displayNode
 * 这是真正的增量追加实现，只处理新增部分，不重复遍历已稳定的节点
 * 
 * @param baseNode 已截断的基础节点（稳定的部分）
 * @param sourceNode 原始完整节点
 * @param startChars 起始字符位置（已处理的字符数）
 * @param endChars 结束字符位置（新的进度）
 * @param accumulatedChunks 累积的 chunks 信息（用于渐入动画）
 * @returns 追加后的完整节点
 */
export function appendToAst(
  baseNode: RootContent,
  sourceNode: RootContent,
  startChars: number,
  endChars: number,
  accumulatedChunks?: AccumulatedChunks
): RootContent {
  // 如果新增字符数为 0，直接返回 baseNode
  if (endChars <= startChars) {
    return baseNode
  }

  // 从 sourceNode 中提取新增的字符范围（跳过已处理的部分）
  const newChars = endChars - startChars
  const newPart = sliceAst(sourceNode, endChars, accumulatedChunks, startChars)
  
  // 如果提取失败，返回 baseNode
  if (!newPart) {
    return baseNode
  }

  // 将新增部分合并到 baseNode
  return mergeAstNodes(baseNode, newPart)
}

/**
 * 合并两个 AST 节点
 * 将 newPart 追加到 baseNode 的最后一个可追加节点中
 */
function mergeAstNodes(baseNode: RootContent, newPart: RootContent): RootContent {
  // 如果两个节点类型不同，无法合并，返回 baseNode
  if (baseNode.type !== newPart.type) {
    return baseNode
  }

  const base = baseNode as AstNode
  const part = newPart as AstNode

  // 如果是文本节点，合并文本和 chunks
  if (base.value && typeof base.value === 'string' && part.value && typeof part.value === 'string') {
    const baseChunks = (base as TextNodeWithChunks).chunks || []
    const partChunks = (part as TextNodeWithChunks).chunks || []
    
    // 合并所有 chunks：累积所有读取的 chunks
    // chunks 数组包含每次读取的新文本片段，它们 join 到一起就是 value
    const mergedChunks = [...baseChunks, ...partChunks]
    
    // 根据设计：value = stableText + chunks[0].text + chunks[1].text + ... + chunks[n].text
    // base.value = baseStableText + baseChunks[0].text + ... + baseChunks[n].text
    // part.value = partStableText + partChunks[0].text + ... + partChunks[m].text
    // 合并后：value = base.value + part.value（完整文本）
    const mergedValue = base.value + part.value
    
    // stableLength 是稳定部分的长度（不需要动画的部分）
    // base 的稳定部分保持不变，base 的 chunks 和 part 的 chunks 都需要动画
    const baseStableLength = (base as TextNodeWithChunks).stableLength ?? 0
    
    // 验证：mergedValue 应该等于 baseStableText + 所有 chunks 的文本
    // baseStableText = base.value.slice(0, baseStableLength)
    // 所有 chunks 的文本 = baseChunks + partChunks 的文本
    const result = {
      ...base,
      value: mergedValue,
      stableLength: mergedChunks.length > 0 ? baseStableLength : undefined,
      chunks: mergedChunks.length > 0 ? mergedChunks : undefined
    } as TextNodeWithChunks
    
    return result as RootContent
  }

  // 如果是容器节点，合并 children
  if (base.children && Array.isArray(base.children) && part.children && Array.isArray(part.children)) {
    // 如果 base 的最后一个子节点和 part 的第一个子节点类型相同，尝试合并
    if (base.children.length > 0 && part.children.length > 0) {
      const lastBaseChild = base.children[base.children.length - 1]
      const firstPartChild = part.children[0]
      
      if (lastBaseChild.type === firstPartChild.type) {
        // 尝试合并最后一个和第一个子节点
        const merged = mergeAstNodes(lastBaseChild as RootContent, firstPartChild as RootContent)
        return {
          ...base,
          children: [
            ...base.children.slice(0, -1),
            merged as AstNode,
            ...part.children.slice(1)
          ]
        } as RootContent
      }
    }

    // 否则直接追加所有子节点
    return {
      ...base,
      children: [...base.children, ...part.children]
    } as RootContent
  }

  // 其他情况，返回 baseNode（无法合并）
  return baseNode
}

/**
 * 深拷贝 AST 节点
 * 使用递归浅拷贝实现，比 JSON.parse/stringify 更高效
 * 且保持对象结构完整性
 */
export function cloneNode<T extends RootContent>(node: T): T {
  // 优先使用 structuredClone（Node 17+ / 现代浏览器）
  if (typeof structuredClone === 'function') {
    return structuredClone(node)
  }
  
  // 回退到递归拷贝
  return deepClone(node) as T
}

/**
 * 递归深拷贝对象
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}
