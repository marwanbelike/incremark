import React from 'react'
import type { ParsedBlock } from '@incremark/core'
import { IncremarkRenderer } from './IncremarkRenderer'

interface BlockWithStableId extends ParsedBlock {
  stableId: string
  isLastPending?: boolean // 是否是最后一个 pending 块
}

export interface IncremarkProps {
  /** 要渲染的块列表 */
  blocks: BlockWithStableId[]
  /** 自定义组件映射 */
  components?: Partial<Record<string, React.ComponentType<{ node: any }>>>
  /** 是否显示块状态（待处理块边框） */
  showBlockStatus?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * Incremark 主渲染组件
 *
 * @example
 * ```tsx
 * import { useIncremark, Incremark } from '@incremark/react'
 *
 * function App() {
 *   const { blocks } = useIncremark()
 *   return <Incremark blocks={blocks} />
 * }
 * ```
 */
export const Incremark: React.FC<IncremarkProps> = ({
  blocks,
  components,
  showBlockStatus = true,
  className = ''
}) => {
  return (
    <div className={`incremark ${className}`}>
      {blocks.map((block) => {
        const isPending = block.status === 'pending'
        const classes = [
          'incremark-block',
          isPending ? 'incremark-pending' : 'incremark-completed',
          block.isLastPending ? 'incremark-last-pending' : ''
        ].filter(Boolean).join(' ')
        
        return (
          <div key={block.stableId} className={classes}>
            <IncremarkRenderer node={block.node} components={components} />
          </div>
        )
      })}
    </div>
  )
}

