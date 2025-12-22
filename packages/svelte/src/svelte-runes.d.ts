/**
 * @file Svelte 5 Runes 类型声明
 * @description 为 Svelte 5 的 runes 提供类型支持
 */

declare global {
  /**
   * $props rune - 定义组件 props
   */
  function $props<T extends Record<string, any> = {}>(): T

  /**
   * $derived rune - 定义派生状态
   */
  function $derived<T>(expression: T): T
  namespace $derived {
    function by<T>(fn: () => T): T
  }

  /**
   * $state rune - 定义响应式状态
   */
  function $state<T>(initial: T): T

  /**
   * $effect rune - 定义副作用
   */
  function $effect(fn: () => void | (() => void)): void
}

export {}

