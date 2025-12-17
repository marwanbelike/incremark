import type { RootContent, Code } from 'mdast'
import type { TransformerPlugin } from './types'

/**
 * 代码块插件：整体出现，不逐字符显示
 * 
 * 注意：默认不启用，代码块默认参与打字机效果
 * 如需整体显示代码块，可手动添加此插件
 */
export const codeBlockPlugin: TransformerPlugin = {
  name: 'code-block',
  match: (node: RootContent) => node.type === 'code',
  countChars: () => 1, // 算作 1 个字符，整体出现
  sliceNode: (node, displayedChars, totalChars) => {
    // 要么全部显示，要么不显示
    return displayedChars >= totalChars ? node : null
  }
}

/**
 * Mermaid 图表插件：整体出现
 * 
 * 注意：默认不启用，mermaid 默认参与打字机效果
 * 如需整体显示 mermaid，可手动添加此插件
 */
export const mermaidPlugin: TransformerPlugin = {
  name: 'mermaid',
  match: (node: RootContent) => {
    if (node.type !== 'code') return false
    const codeNode = node as Code
    return codeNode.lang === 'mermaid'
  },
  countChars: () => 1,
  sliceNode: (node, displayedChars) => (displayedChars > 0 ? node : null)
}

/**
 * 图片插件：立即显示（不参与打字机效果）
 * 图片没有文本内容，应立即显示
 */
export const imagePlugin: TransformerPlugin = {
  name: 'image',
  match: (node: RootContent) => node.type === 'image',
  countChars: () => 0 // 0 字符，立即显示
}

/**
 * 数学公式插件：整体出现
 * 
 * 注意：默认不启用，数学公式默认参与打字机效果
 * 如需整体显示公式，可手动添加此插件
 */
export const mathPlugin: TransformerPlugin = {
  name: 'math',
  match: (node: RootContent) => {
    const type = node.type as string
    return type === 'math' || type === 'inlineMath'
  },
  countChars: () => 1,
  sliceNode: (node, displayedChars) => (displayedChars > 0 ? node : null)
}

/**
 * 分割线插件：立即显示
 * 分隔线没有文本内容，应立即显示
 */
export const thematicBreakPlugin: TransformerPlugin = {
  name: 'thematic-break',
  match: (node: RootContent) => node.type === 'thematicBreak',
  countChars: () => 0
}

/**
 * 默认插件集合
 * 
 * 只包含确实需要特殊处理的节点：
 * - 图片：无文本内容，立即显示
 * - 分隔线：无文本内容，立即显示
 * 
 * 代码块、mermaid、数学公式默认参与打字机效果
 * 如需整体显示，可手动添加对应插件
 */
export const defaultPlugins: TransformerPlugin[] = [
  imagePlugin,
  thematicBreakPlugin
]

/**
 * 完整插件集合（所有特殊节点整体显示）
 * 包含代码块、mermaid、数学公式等的整体显示
 */
export const allPlugins: TransformerPlugin[] = [
  mermaidPlugin, // mermaid 优先于普通 code block
  codeBlockPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin
]

/**
 * 创建自定义插件的辅助函数
 */
export function createPlugin(
  name: string,
  matcher: (node: RootContent) => boolean,
  options: Partial<Omit<TransformerPlugin, 'name' | 'match'>> = {}
): TransformerPlugin {
  return {
    name,
    match: matcher,
    ...options
  }
}
