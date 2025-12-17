import { useState, useCallback, useRef, useEffect } from 'react'
import {
  BlockTransformer,
  createBlockTransformer,
  type TransformerOptions,
  type DisplayBlock,
  type SourceBlock,
  type AnimationEffect
} from '@incremark/core'

export interface UseBlockTransformerOptions extends Omit<TransformerOptions, 'onChange'> {}

export interface UseBlockTransformerReturn<T = unknown> {
  /** 用于渲染的 display blocks */
  displayBlocks: DisplayBlock<T>[]
  /** 是否正在处理中 */
  isProcessing: boolean
  /** 是否已暂停 */
  isPaused: boolean
  /** 当前动画效果 */
  effect: AnimationEffect
  /** 跳过所有动画 */
  skip: () => void
  /** 重置状态 */
  reset: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>) => void
  /** transformer 实例（用于高级用法） */
  transformer: BlockTransformer<T>
}

/**
 * React Hook: Block Transformer
 *
 * 用于控制 blocks 的逐步显示（打字机效果）
 * 作为解析器和渲染器之间的中间层
 *
 * 特性：
 * - 使用 requestAnimationFrame 实现流畅动画
 * - 支持随机步长 `charsPerTick: [1, 3]`
 * - 支持动画效果 `effect: 'typing'`
 * - 页面不可见时自动暂停
 *
 * @example
 * ```tsx
 * import { useIncremark, useBlockTransformer, defaultPlugins } from '@incremark/react'
 *
 * function App() {
 *   const { completedBlocks, append, finalize } = useIncremark()
 *
 *   // 转换为 SourceBlock 格式
 *   const sourceBlocks = useMemo(() => completedBlocks.map(block => ({
 *     id: block.id,
 *     node: block.node,
 *     status: block.status
 *   })), [completedBlocks])
 *
 *   // 添加打字机效果
 *   const { displayBlocks, isProcessing, skip, effect } = useBlockTransformer(sourceBlocks, {
 *     charsPerTick: [1, 3],  // 随机步长
 *     tickInterval: 30,
 *     effect: 'typing',      // 光标效果
 *     plugins: defaultPlugins
 *   })
 *
 *   return (
 *     <div className={effect === 'typing' ? 'typing' : ''}>
 *       <Incremark blocks={displayBlocks} />
 *       {isProcessing && <button onClick={skip}>跳过</button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBlockTransformer<T = unknown>(
  sourceBlocks: SourceBlock<T>[],
  options: UseBlockTransformerOptions = {}
): UseBlockTransformerReturn<T> {
  const [displayBlocks, setDisplayBlocks] = useState<DisplayBlock<T>[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [effect, setEffect] = useState<AnimationEffect>(options.effect ?? 'none')

  // 使用 ref 保存 transformer 实例
  const transformerRef = useRef<BlockTransformer<T> | null>(null)

  // 懒初始化 transformer
  if (!transformerRef.current) {
    transformerRef.current = createBlockTransformer<T>({
      ...options,
      onChange: (blocks) => {
        setDisplayBlocks(blocks as DisplayBlock<T>[])
        setIsProcessing(transformerRef.current?.isProcessing() ?? false)
        setIsPaused(transformerRef.current?.isPausedState() ?? false)
      }
    })
  }

  const transformer = transformerRef.current

  // 监听 sourceBlocks 变化
  useEffect(() => {
    // 推入新 blocks
    transformer.push(sourceBlocks)

    // 处理正在显示的 block 内容更新
    const currentDisplaying = displayBlocks.find((b) => !b.isDisplayComplete)
    if (currentDisplaying) {
      const updated = sourceBlocks.find((b) => b.id === currentDisplaying.id)
      if (updated) {
        transformer.update(updated)
      }
    }
  }, [sourceBlocks, transformer])

  // 清理
  useEffect(() => {
    return () => {
      transformer.destroy()
    }
  }, [transformer])

  const skip = useCallback(() => {
    transformer.skip()
  }, [transformer])

  const reset = useCallback(() => {
    transformer.reset()
  }, [transformer])

  const pause = useCallback(() => {
    transformer.pause()
    setIsPaused(true)
  }, [transformer])

  const resume = useCallback(() => {
    transformer.resume()
    setIsPaused(false)
  }, [transformer])

  const setOptionsCallback = useCallback(
    (opts: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>) => {
      transformer.setOptions(opts)
      if (opts.effect !== undefined) {
        setEffect(opts.effect)
      }
    },
    [transformer]
  )

  return {
    displayBlocks,
    isProcessing,
    isPaused,
    effect,
    skip,
    reset,
    pause,
    resume,
    setOptions: setOptionsCallback,
    transformer
  }
}

export type UseBlockTransformerReturn_Exported = UseBlockTransformerReturn
