/**
 * @file Definitions Context - 管理 Markdown 引用定义
 * 
 * @description
 * 提供 definitions 和 footnoteDefinitions 的 Context，
 * 用于支持引用式图片/链接的解析和渲染。
 * 
 * @author Incremark Team
 * @license MIT
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Definition, FootnoteDefinition } from 'mdast'

/**
 * Definitions Context 接口
 */
export interface DefinitionsContextValue {
  /** 图片/链接定义映射表 */
  definitions: Record<string, Definition>
  /** 脚注定义映射表 */
  footnoteDefinitions: Record<string, FootnoteDefinition>
  /** 脚注引用的出现顺序 */
  footnoteReferenceOrder: string[]
  /** 设置 definitions */
  setDefinitions: (definitions: Record<string, Definition>) => void
  /** 设置 footnoteDefinitions */
  setFootnoteDefinitions: (definitions: Record<string, FootnoteDefinition>) => void
  /** 设置 footnoteReferenceOrder */
  setFootnoteReferenceOrder: (order: string[]) => void
  /** 清空 definitions */
  clearDefinitions: () => void
  /** 清空 footnoteDefinitions */
  clearFootnoteDefinitions: () => void
  /** 清空 footnoteReferenceOrder */
  clearFootnoteReferenceOrder: () => void
  /** 清空所有定义 */
  clearAllDefinitions: () => void
}

/**
 * Definitions Context
 */
export const DefinitionsContext = createContext<DefinitionsContextValue | undefined>(undefined)

/**
 * Definitions Provider Props
 */
export interface DefinitionsProviderProps {
  children: ReactNode
}

/**
 * Definitions Provider 组件
 * 
 * @description
 * 为子组件提供 definitions 和 footnoteDefinitions。
 * 通常在 useIncremark 返回的数据更新时，调用 setDefinitions 和 setFootnoteDefinitions。
 * 
 * @example
 * ```tsx
 * import { DefinitionsProvider } from '@incremark/react'
 * 
 * function App() {
 *   return (
 *     <DefinitionsProvider>
 *       <Incremark blocks={blocks} />
 *     </DefinitionsProvider>
 *   )
 * }
 * ```
 */
export const DefinitionsProvider: React.FC<DefinitionsProviderProps> = ({ children }) => {
  const [definitions, setDefinitionsState] = useState<Record<string, Definition>>({})
  const [footnoteDefinitions, setFootnoteDefinitionsState] = useState<Record<string, FootnoteDefinition>>({})
  const [footnoteReferenceOrder, setFootnoteReferenceOrderState] = useState<string[]>([])

  const setDefinitions = useCallback((defs: Record<string, Definition>) => {
    setDefinitionsState(defs)
  }, [])

  const setFootnoteDefinitions = useCallback((defs: Record<string, FootnoteDefinition>) => {
    setFootnoteDefinitionsState(defs)
  }, [])

  const setFootnoteReferenceOrder = useCallback((order: string[]) => {
    setFootnoteReferenceOrderState(order)
  }, [])

  const clearDefinitions = useCallback(() => {
    setDefinitionsState({})
  }, [])

  const clearFootnoteDefinitions = useCallback(() => {
    setFootnoteDefinitionsState({})
  }, [])

  const clearFootnoteReferenceOrder = useCallback(() => {
    setFootnoteReferenceOrderState([])
  }, [])

  const clearAllDefinitions = useCallback(() => {
    setDefinitionsState({})
    setFootnoteDefinitionsState({})
    setFootnoteReferenceOrderState([])
  }, [])

  const value: DefinitionsContextValue = {
    definitions,
    footnoteDefinitions,
    footnoteReferenceOrder,
    setDefinitions,
    setFootnoteDefinitions,
    setFootnoteReferenceOrder,
    clearDefinitions,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinitions
  }

  return (
    <DefinitionsContext.Provider value={value}>
      {children}
    </DefinitionsContext.Provider>
  )
}

/**
 * useDefinitions Hook
 *
 * @description
 * 获取 definitions context。必须在 DefinitionsProvider 内部使用。
 *
 * @returns Definitions context value
 *
 * @throws 如果在 DefinitionsProvider 外部使用
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { definitions, footnoteDefinitions } = useDefinitions()
 *   // 使用 definitions...
 * }
 * ```
 */
export function useDefinitions(): DefinitionsContextValue {
  const context = useContext(DefinitionsContext)

  if (!context) {
    throw new Error('useDefinitions must be used within a DefinitionsProvider')
  }

  return context
}

/**
 * useProvideDefinitions Hook
 *
 * @description
 * 内部使用的 hook，用于在 useIncremark 中自动提供 definitions context。
 *
 * @returns Definitions context setters
 *
 * @internal
 */
export function useProvideDefinitions() {
  const [definitions, setDefinitionsState] = useState<Record<string, Definition>>({})
  const [footnoteDefinitions, setFootnoteDefinitionsState] = useState<Record<string, FootnoteDefinition>>({})
  const [footnoteReferenceOrder, setFootnoteReferenceOrderState] = useState<string[]>([])

  const setDefinitions = useCallback((defs: Record<string, Definition>) => {
    setDefinitionsState(defs)
  }, [])

  const setFootnoteDefinitions = useCallback((defs: Record<string, FootnoteDefinition>) => {
    setFootnoteDefinitionsState(defs)
  }, [])

  const setFootnoteReferenceOrder = useCallback((order: string[]) => {
    setFootnoteReferenceOrderState(order)
  }, [])

  const clearDefinitions = useCallback(() => {
    setDefinitionsState({})
  }, [])

  const clearFootnoteDefinitions = useCallback(() => {
    setFootnoteDefinitionsState({})
  }, [])

  const clearFootnoteReferenceOrder = useCallback(() => {
    setFootnoteReferenceOrderState([])
  }, [])

  const clearAllDefinitions = useCallback(() => {
    setDefinitionsState({})
    setFootnoteDefinitionsState({})
    setFootnoteReferenceOrderState([])
  }, [])

  const value: DefinitionsContextValue = {
    definitions,
    footnoteDefinitions,
    footnoteReferenceOrder,
    setDefinitions,
    setFootnoteDefinitions,
    setFootnoteReferenceOrder,
    clearDefinitions,
    clearFootnoteDefinitions,
    clearFootnoteReferenceOrder,
    clearAllDefinitions
  }

  return { value, setDefinitions, setFootnoteDefinitions, setFootnoteReferenceOrder }
}

