// Composables
export { useIncremark, useStreamRenderer, useDevTools, useBlockTransformer } from './composables'
export type {
  UseIncremarkOptions,
  TypewriterOptions,
  TypewriterControls,
  UseStreamRendererOptions,
  UseDevToolsOptions,
  UseBlockTransformerOptions,
  UseBlockTransformerReturn
} from './composables'

// Components
export {
  Incremark,
  IncremarkRenderer,
  IncremarkHeading,
  IncremarkParagraph,
  IncremarkCode,
  IncremarkList,
  IncremarkTable,
  IncremarkBlockquote,
  IncremarkThematicBreak,
  IncremarkInline,
  IncremarkMath,
  IncremarkDefault,
  AutoScrollContainer
} from './components'
export type { ComponentMap, BlockWithStableId } from './components'

// Re-export core types
export type {
  ParsedBlock,
  IncrementalUpdate,
  ParserOptions,
  BlockStatus,
  Root,
  RootContent,
  // Transformer types
  SourceBlock,
  DisplayBlock,
  TransformerPlugin,
  TransformerOptions,
  TransformerState,
  AnimationEffect
} from '@incremark/core'

// Re-export transformer utilities and plugins
export {
  BlockTransformer,
  createBlockTransformer,
  countChars,
  sliceAst,
  cloneNode,
  codeBlockPlugin,
  mermaidPlugin,
  imagePlugin,
  mathPlugin,
  thematicBreakPlugin,
  defaultPlugins,
  allPlugins,
  createPlugin
} from '@incremark/core'
