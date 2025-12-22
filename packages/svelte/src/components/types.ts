/**
 * @file Component Types - 组件类型定义
 * @description 定义组件相关的类型
 */

import type { ParsedBlock } from '@incremark/core'

/**
 * 组件映射类型
 * 使用 any 以支持不同类型的组件
 */
export type ComponentMap = Partial<Record<string, any>>

/**
 * 带稳定 ID 的块类型
 */
export interface BlockWithStableId extends ParsedBlock {
  stableId: string
  isLastPending?: boolean // 是否是最后一个 pending 块
}

