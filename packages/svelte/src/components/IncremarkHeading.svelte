<!--
  @file IncremarkHeading.svelte - 标题组件
  @description 渲染 Markdown 标题节点（h1-h6）
-->

<script lang="ts">
  import type { Heading } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 标题节点 */
    node: Heading
  }

  let { node }: Props = $props()

  /**
   * 根据 depth 计算标签名
   * depth 范围：1-6，对应 h1-h6
   */
  const tag = $derived(`h${node.depth}`)

  /**
   * CSS 类名
   */
  const className = $derived(`incremark-heading h${node.depth}`)
</script>

<svelte:element this={tag} class={className}>
  <IncremarkInline nodes={node.children} />
</svelte:element>

