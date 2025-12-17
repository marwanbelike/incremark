import type { RootContent } from 'mdast'

/**
 * 计算 AST 节点的总字符数
 */
export function countChars(node: RootContent): number {
  let count = 0

  function traverse(n: any): void {
    // 文本类节点
    if (n.value && typeof n.value === 'string') {
      count += n.value.length
      return
    }

    // 容器节点，递归处理子节点
    if (n.children && Array.isArray(n.children)) {
      for (const child of n.children) {
        traverse(child)
      }
    }
  }

  traverse(node)
  return count
}

/**
 * 截断 AST 节点，只保留前 maxChars 个字符
 * 
 * @param node 原始节点
 * @param maxChars 最大字符数
 * @returns 截断后的节点，如果 maxChars <= 0 返回 null
 */
export function sliceAst(node: RootContent, maxChars: number): RootContent | null {
  if (maxChars <= 0) return null

  let remaining = maxChars

  function process(n: any): any {
    if (remaining <= 0) return null

    // 文本类节点：截断 value
    if (n.value && typeof n.value === 'string') {
      const take = Math.min(n.value.length, remaining)
      remaining -= take
      if (take === 0) return null
      return { ...n, value: n.value.slice(0, take) }
    }

    // 容器节点：递归处理 children
    if (n.children && Array.isArray(n.children)) {
      const newChildren: any[] = []
      for (const child of n.children) {
        if (remaining <= 0) break
        const processed = process(child)
        if (processed) {
          newChildren.push(processed)
        }
      }
      // 如果没有 children 了，根据节点类型决定是否保留
      if (newChildren.length === 0) {
        // 对于某些容器节点，即使没有内容也应该保留结构
        // 例如 list 节点如果没有 children 就不应该渲染
        return null
      }
      return { ...n, children: newChildren }
    }

    // 其他节点（如 thematicBreak, image）：整体处理
    // 算作 1 个字符的消耗
    remaining -= 1
    return { ...n }
  }

  return process(node)
}

/**
 * 深拷贝 AST 节点
 */
export function cloneNode<T extends RootContent>(node: T): T {
  return JSON.parse(JSON.stringify(node))
}

