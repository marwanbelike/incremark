<!--
  @file CustomHeading.svelte - 自定义标题组件
  @description 示例：自定义标题组件
-->

<script lang="ts">
  import type { Heading, PhrasingContent } from 'mdast'
  import { IncremarkInline } from '@incremark/svelte'

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
   */
  const tag = $derived(`h${node.depth}`)
</script>

<svelte:element this={tag} class="custom-heading">
  ✨ <IncremarkInline nodes={node.children as PhrasingContent[]} />
</svelte:element>

<style>
  .custom-heading {
    color: #7c3aed;
    border-bottom: 2px solid #7c3aed;
    padding-bottom: 0.5rem;
    margin: 0.5em 0;
    font-weight: 600;
    line-height: 1.3;
  }
</style>

