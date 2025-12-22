/**
 * @file IncremarkContainerProvider - Incremark 容器级 Provider
 *
 * @description
 * 用于在 Incremark 的渲染树根部统一注入各种 Context / 全局能力。
 * 目前主要用于注入 DefinitionsContext（引用定义、脚注定义等）。
 *
 * 设计目标：
 * - **对用户隐藏实现细节**：用户只需 `<Incremark incremark={incremark} />`
 * - **为未来扩展留空间**：后续可在这里统一添加更多 Provider（主题、滚动、性能开关等）
 *
 * @author Incremark Team
 * @license MIT
 */

import React, { type ReactNode } from 'react'
import type { DefinitionsContextValue } from '../contexts/DefinitionsContext'
import { DefinitionsContext } from '../contexts/DefinitionsContext'

/**
 * IncremarkContainerProvider Props
 */
export interface IncremarkContainerProviderProps {
  /** 子节点 */
  children: ReactNode
  /** DefinitionsContext 的值 */
  definitions: DefinitionsContextValue
}

/**
 * IncremarkContainerProvider 组件
 *
 * @param props - 组件参数
 * @returns ReactElement
 */
export const IncremarkContainerProvider: React.FC<IncremarkContainerProviderProps> = ({ children, definitions }) => {
  return (
    <DefinitionsContext.Provider value={definitions}>
      {children}
    </DefinitionsContext.Provider>
  )
}


