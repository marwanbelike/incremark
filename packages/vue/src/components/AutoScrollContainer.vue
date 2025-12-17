<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  /** 是否启用自动滚动 */
  enabled?: boolean
  /** 触发自动滚动的底部阈值（像素） */
  threshold?: number
  /** 滚动行为 */
  behavior?: ScrollBehavior
}>(), {
  enabled: true,
  threshold: 50,
  behavior: 'instant'
})

const containerRef = ref<HTMLDivElement | null>(null)
const isUserScrolledUp = ref(false)

// 记录上一次滚动位置，用于判断滚动方向
let lastScrollTop = 0
let lastScrollHeight = 0

/**
 * 检查是否在底部附近
 */
function isNearBottom(): boolean {
  const container = containerRef.value
  if (!container) return true
  
  const { scrollTop, scrollHeight, clientHeight } = container
  return scrollHeight - scrollTop - clientHeight <= props.threshold
}

/**
 * 滚动到底部
 */
function scrollToBottom(force = false): void {
  const container = containerRef.value
  if (!container) return
  
  // 如果用户手动向上滚动了，且不是强制滚动，则不自动滚动
  if (isUserScrolledUp.value && !force) return
  
  container.scrollTo({
    top: container.scrollHeight,
    behavior: props.behavior
  })
}

/**
 * 检查是否有滚动条
 */
function hasScrollbar(): boolean {
  const container = containerRef.value
  if (!container) return false
  return container.scrollHeight > container.clientHeight
}

/**
 * 处理滚动事件
 */
function handleScroll(): void {
  const container = containerRef.value
  if (!container) return
  
  const { scrollTop, scrollHeight, clientHeight } = container
  
  // 如果没有滚动条，恢复自动滚动
  if (scrollHeight <= clientHeight) {
    isUserScrolledUp.value = false
    lastScrollTop = 0
    lastScrollHeight = scrollHeight
    return
  }
  
  // 检查用户是否滚动到底部附近
  if (isNearBottom()) {
    // 用户滚动到底部，恢复自动滚动
    isUserScrolledUp.value = false
  } else {
    // 判断是否是用户主动向上滚动
    // 条件：scrollTop 减少（向上滚动）且 scrollHeight 没有变化（不是因为内容增加）
    const isScrollingUp = scrollTop < lastScrollTop
    const isContentUnchanged = scrollHeight === lastScrollHeight
    
    if (isScrollingUp && isContentUnchanged) {
      // 用户主动向上滚动，暂停自动滚动
      isUserScrolledUp.value = true
    }
  }
  
  // 更新记录
  lastScrollTop = scrollTop
  lastScrollHeight = scrollHeight
}

// 监听 slot 内容变化（使用 MutationObserver）
let observer: MutationObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  
  // 初始化滚动位置记录
  lastScrollTop = containerRef.value.scrollTop
  lastScrollHeight = containerRef.value.scrollHeight
  
  observer = new MutationObserver(() => {
    nextTick(() => {
      if (!containerRef.value) return
      
      // 如果没有滚动条，重置状态
      if (!hasScrollbar()) {
        isUserScrolledUp.value = false
      }
      
      // 更新 scrollHeight 记录（内容变化后）
      lastScrollHeight = containerRef.value.scrollHeight
      
      // 自动滚动
      if (props.enabled && !isUserScrolledUp.value) {
        scrollToBottom()
      }
    })
  })
  
  observer.observe(containerRef.value, {
    childList: true,
    subtree: true,
    characterData: true
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

// 暴露方法给父组件
defineExpose({
  /** 强制滚动到底部 */
  scrollToBottom: () => scrollToBottom(true),
  /** 是否用户手动向上滚动了 */
  isUserScrolledUp: () => isUserScrolledUp.value,
  /** 容器元素引用 */
  container: containerRef
})
</script>

<template>
  <div
    ref="containerRef"
    class="auto-scroll-container"
    @scroll="handleScroll"
  >
    <slot />
  </div>
</template>

<style scoped>
.auto-scroll-container {
  overflow-y: auto;
  height: 100%;
}
</style>
