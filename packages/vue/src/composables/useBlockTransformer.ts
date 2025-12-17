import { ref, watch, computed, onUnmounted, type Ref, type ComputedRef } from 'vue'
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
  displayBlocks: ComputedRef<DisplayBlock<T>[]>
  /** 是否正在处理中 */
  isProcessing: ComputedRef<boolean>
  /** 是否已暂停 */
  isPaused: ComputedRef<boolean>
  /** 当前动画效果 */
  effect: ComputedRef<AnimationEffect>
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
 * Vue 3 Composable: Block Transformer
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
 * ```vue
 * <script setup>
 * import { useIncremark, useBlockTransformer, defaultPlugins } from '@incremark/vue'
 *
 * const { blocks, completedBlocks, append, finalize } = useIncremark()
 *
 * // 使用 completedBlocks 作为输入（ID 稳定）
 * const sourceBlocks = computed(() => completedBlocks.value.map(b => ({
 *   id: b.id,
 *   node: b.node,
 *   status: b.status
 * })))
 *
 * // 添加打字机效果
 * const { displayBlocks, isProcessing, skip, effect } = useBlockTransformer(sourceBlocks, {
 *   charsPerTick: [1, 3],  // 随机步长
 *   tickInterval: 30,
 *   effect: 'typing',      // 光标效果
 *   plugins: defaultPlugins
 * })
 * </script>
 *
 * <template>
 *   <Incremark :blocks="displayBlocks" :class="{ 'typing': effect === 'typing' }" />
 *   <button v-if="isProcessing" @click="skip">跳过</button>
 * </template>
 * ```
 */
export function useBlockTransformer<T = unknown>(
  sourceBlocks: Ref<SourceBlock<T>[]> | ComputedRef<SourceBlock<T>[]>,
  options: UseBlockTransformerOptions = {}
): UseBlockTransformerReturn<T> {
  const displayBlocksRef = ref<DisplayBlock<T>[]>([])
  const isProcessingRef = ref(false)
  const isPausedRef = ref(false)
  const effectRef = ref<AnimationEffect>(options.effect ?? 'none')

  const transformer = createBlockTransformer<T>({
    ...options,
    onChange: (blocks) => {
      displayBlocksRef.value = blocks as DisplayBlock<T>[]
      isProcessingRef.value = transformer.isProcessing()
      isPausedRef.value = transformer.isPausedState()
    }
  })

  // 监听源 blocks 变化
  watch(
    sourceBlocks,
    (blocks) => {
      // 推入新 blocks
      transformer.push(blocks)

      // 处理正在显示的 block 内容更新
      const currentDisplaying = displayBlocksRef.value.find((b) => !b.isDisplayComplete)
      if (currentDisplaying) {
        const updated = blocks.find((b) => b.id === currentDisplaying.id)
        if (updated) {
          transformer.update(updated)
        }
      }
    },
    { immediate: true, deep: true }
  )

  onUnmounted(() => {
    transformer.destroy()
  })

  return {
    displayBlocks: computed(() => displayBlocksRef.value) as ComputedRef<DisplayBlock<T>[]>,
    isProcessing: computed(() => isProcessingRef.value),
    isPaused: computed(() => isPausedRef.value),
    effect: computed(() => effectRef.value),
    skip: () => transformer.skip(),
    reset: () => transformer.reset(),
    pause: () => {
      transformer.pause()
      isPausedRef.value = true
    },
    resume: () => {
      transformer.resume()
      isPausedRef.value = false
    },
    setOptions: (opts) => {
      transformer.setOptions(opts)
      if (opts.effect !== undefined) {
        effectRef.value = opts.effect
      }
    },
    transformer
  }
}
