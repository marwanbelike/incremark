<!--
  @file IncremarkRenderer.svelte - 渲染器组件
  @description 用于渲染单个 RootContent 节点
-->

<script lang="ts">
  import type { RootContent, HTML } from 'mdast'
  import IncremarkHeading from './IncremarkHeading.svelte'
  import IncremarkParagraph from './IncremarkParagraph.svelte'
  import IncremarkCode from './IncremarkCode.svelte'
  import IncremarkList from './IncremarkList.svelte'
  import IncremarkTable from './IncremarkTable.svelte'
  import IncremarkBlockquote from './IncremarkBlockquote.svelte'
  import IncremarkThematicBreak from './IncremarkThematicBreak.svelte'
  import IncremarkMath from './IncremarkMath.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'
  import IncremarkDefault from './IncremarkDefault.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 要渲染的节点 */
    node: RootContent
  }

  let { node }: Props = $props()

  /**
   * 组件映射
   */
  const componentMap: Record<string, any> = {
    heading: IncremarkHeading,
    paragraph: IncremarkParagraph,
    code: IncremarkCode,
    list: IncremarkList,
    table: IncremarkTable,
    blockquote: IncremarkBlockquote,
    thematicBreak: IncremarkThematicBreak,
    math: IncremarkMath,
    inlineMath: IncremarkMath,
    htmlElement: IncremarkHtmlElement,
  }

  /**
   * 获取组件
   */
  function getComponent(type: string): any {
    return componentMap[type] || IncremarkDefault
  }

  /**
   * 检查是否是 html 节点
   */
  function isHtmlNode(node: RootContent): node is HTML {
    return node.type === 'html'
  }
</script>

<!-- HTML 节点：渲染为代码块显示源代码 -->
{#if isHtmlNode(node)}
  <pre class="incremark-html-code"><code>{node.value}</code></pre>
{:else}
  <!-- 其他节点：使用对应组件 -->
  {@const Component = getComponent(node.type)}
  {#if Component}
    <Component node={node} />
  {/if}
{/if}

