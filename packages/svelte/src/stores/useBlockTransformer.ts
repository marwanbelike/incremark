/**
 * @file useBlockTransformer Store - 块转换器
 * @description 用于控制 blocks 的逐步显示（打字机效果）
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store'
import {
  BlockTransformer,
  createBlockTransformer,
  type TransformerOptions,
  type DisplayBlock,
  type SourceBlock,
  type AnimationEffect
} from '@incremark/core'

/**
 * useBlockTransformer 选项
 */
export interface UseBlockTransformerOptions extends Omit<TransformerOptions, 'onChange'> {}

/**
 * useBlockTransformer 返回值
 */
export interface UseBlockTransformerReturn<T = unknown> {
  /** 用于渲染的 display blocks */
  displayBlocks: Readable<DisplayBlock<T>[]>
  /** 是否正在处理中 */
  isProcessing: Readable<boolean>
  /** 是否已暂停 */
  isPaused: Readable<boolean>
  /** 当前动画效果 */
  effect: Readable<AnimationEffect>
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
 * Svelte 5 Store: Block Transformer
 *
 * @description
 * 用于控制 blocks 的逐步显示（打字机效果）
 * 作为解析器和渲染器之间的中间层
 *
 * 特性：
 * - 使用 requestAnimationFrame 实现流畅动画
 * - 支持随机步长 `charsPerTick: [1, 3]`
 * - 支持动画效果 `effect: 'typing'`
 * - 页面不可见时自动暂停
 *
 * @param sourceBlocks - 源 blocks store
 * @param options - 转换器选项
 * @returns 转换器状态和控制对象
 *
 * @example
 * ```svelte
 * <script>
 *   import { useIncremark, useBlockTransformer, defaultPlugins } from '@incremark/svelte'
 *   import { derived } from 'svelte/store'
 *
 *   const { completedBlocks, append, finalize } = useIncremark()
 *
 *   // 使用 completedBlocks 作为输入（ID 稳定）
 *   const sourceBlocks = derived(completedBlocks, ($blocks) => 
 *     $blocks.map(b => ({
 *       id: b.id,
 *       node: b.node,
 *       status: b.status
 *     }))
 *   )
 *
 *   // 添加打字机效果
 *   const { displayBlocks, isProcessing, skip, effect } = useBlockTransformer(sourceBlocks, {
 *     charsPerTick: [1, 3],
 *     tickInterval: 30,
 *     effect: 'typing',
 *     plugins: defaultPlugins
 *   })
 * </script>
 *
 * <template>
 *   <Incremark blocks={$displayBlocks} class:typing={$effect === 'typing'} />
 *   {#if $isProcessing}
 *     <button on:click={skip}>跳过</button>
 *   {/if}
 * </template>
 * ```
 */
export function useBlockTransformer<T = unknown>(
  sourceBlocks: Readable<SourceBlock<T>[]>,
  options: UseBlockTransformerOptions = {}
): UseBlockTransformerReturn<T> {
  const displayBlocks = writable<DisplayBlock<T>[]>([])
  const isProcessing = writable(false)
  const isPaused = writable(false)
  const effect = writable<AnimationEffect>(options.effect ?? 'none')

  const transformer = createBlockTransformer<T>({
    ...options,
    onChange: (blocks) => {
      displayBlocks.set(blocks as DisplayBlock<T>[])
      isProcessing.set(transformer.isProcessing())
      isPaused.set(transformer.isPausedState())
    }
  })

  // 监听源 blocks 变化
  sourceBlocks.subscribe((blocks) => {
    // 推入新 blocks
    transformer.push(blocks)

    // 处理正在显示的 block 内容更新
    displayBlocks.update((displayBlocksValue) => {
      const currentDisplaying = displayBlocksValue.find((b) => !b.isDisplayComplete)
      if (currentDisplaying) {
        const updated = blocks.find((b) => b.id === currentDisplaying.id)
        if (updated) {
          transformer.update(updated)
        }
      }
      return displayBlocksValue
    })
  })

  return {
    displayBlocks: derived(displayBlocks, ($blocks) => $blocks),
    isProcessing: derived(isProcessing, ($processing) => $processing),
    isPaused: derived(isPaused, ($paused) => $paused),
    effect: derived(effect, ($effect) => $effect),
    skip: () => transformer.skip(),
    reset: () => transformer.reset(),
    pause: () => {
      transformer.pause()
      isPaused.set(true)
    },
    resume: () => {
      transformer.resume()
      isPaused.set(false)
    },
    setOptions: (opts) => {
      transformer.setOptions(opts)
      if (opts.effect !== undefined) {
        effect.set(opts.effect)
      }
    },
    transformer
  }
}

