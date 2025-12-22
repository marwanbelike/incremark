/**
 * @file Definitions Context - Svelte Context 实现
 * @description 管理 definitions 和 footnotes 的共享状态，对应 Vue 版本的 provide/inject
 */

import { setContext, getContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type { Definition, FootnoteDefinition } from 'mdast'

/**
 * Definitions Context 值类型
 */
export interface DefinitionsContextValue {
  /** Definitions 映射 */
  definations: Writable<Record<string, Definition>>
  /** Footnote definitions 映射 */
  footnoteDefinitions: Writable<Record<string, FootnoteDefinition>>
  /** Footnote 引用顺序 */
  footnoteReferenceOrder: Writable<string[]>
}

/**
 * Context key
 */
const DEFINITIONS_CONTEXT_KEY = Symbol('definitionsContext')

/**
 * 设置 Definitions Context
 * 
 * @description
 * 在父组件中调用，为子组件提供 definitions context
 * 
 * @returns 返回设置函数，用于更新 context 值
 * 
 * @example
 * ```svelte
 * <script>
 *   import { setDefinitionsContext } from '@incremark/svelte'
 *   
 *   const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = setDefinitionsContext()
 * </script>
 * ```
 */
export function setDefinitionsContext() {
  const definations = writable<Record<string, Definition>>({})
  const footnoteDefinitions = writable<Record<string, FootnoteDefinition>>({})
  const footnoteReferenceOrder = writable<string[]>([])

  const contextValue: DefinitionsContextValue = {
    definations,
    footnoteDefinitions,
    footnoteReferenceOrder
  }

  setContext(DEFINITIONS_CONTEXT_KEY, contextValue)

  /**
   * 设置 definitions
   */
  function setDefinations(definitions: Record<string, Definition>) {
    definations.set(definitions)
  }

  /**
   * 设置 footnote definitions
   */
  function setFootnoteDefinitions(definitions: Record<string, FootnoteDefinition>) {
    footnoteDefinitions.set(definitions)
  }

  /**
   * 设置 footnote 引用顺序
   */
  function setFootnoteReferenceOrder(order: string[]) {
    footnoteReferenceOrder.set(order)
  }

  /**
   * 清空 definitions
   */
  function clearDefinations() {
    definations.set({})
  }

  /**
   * 清空 footnote definitions
   */
  function clearFootnoteDefinitions() {
    footnoteDefinitions.set({})
  }

  /**
   * 清空 footnote 引用顺序
   */
  function clearFootnoteReferenceOrder() {
    footnoteReferenceOrder.set([])
  }

  /**
   * 清空所有 definitions
   */
  function clearAllDefinations() {
    clearDefinations()
    clearFootnoteDefinitions()
    clearFootnoteReferenceOrder()
  }

  return {
    setDefinations,
    setFootnoteDefinitions,
    setFootnoteReferenceOrder,
    clearDefinations,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinations
  }
}

/**
 * 获取 Definitions Context
 * 
 * @description
 * 在子组件中调用，获取父组件提供的 definitions context
 * 
 * @returns Definitions context 值
 * 
 * @throws 如果 context 不存在，抛出错误
 * 
 * @example
 * ```svelte
 * <script>
 *   import { getDefinitionsContext } from '@incremark/svelte'
 *   
 *   const { definations, footnoteDefinitions, footnoteReferenceOrder } = getDefinitionsContext()
 * </script>
 * ```
 */
export function getDefinitionsContext(): DefinitionsContextValue {
  const context = getContext<DefinitionsContextValue>(DEFINITIONS_CONTEXT_KEY)
  
  if (!context) {
    throw new Error('DefinitionsContext not found. Make sure to call setDefinitionsContext() in a parent component.')
  }
  
  return context
}

