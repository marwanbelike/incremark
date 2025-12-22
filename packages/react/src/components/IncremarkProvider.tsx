/**
 * @file IncremarkProvider - 兼容层（已废弃）
 *
 * @description
 * 历史遗留的 Provider 组件。为了兼容旧代码保留此导出。
 *
 * 新推荐使用：`IncremarkContainerProvider`
 *
 * @deprecated 请使用 `IncremarkContainerProvider`
 * @author Incremark Team
 * @license MIT
 */

export {
  IncremarkContainerProvider as IncremarkProvider,
  type IncremarkContainerProviderProps as IncremarkProviderProps
} from './IncremarkContainerProvider'
