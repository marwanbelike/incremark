<!--
  @file IncremarkBlockquote.svelte - 引用组件
  @description 渲染 Markdown 引用块
-->

<script lang="ts">
  import type { Blockquote } from 'mdast'
  import IncremarkParagraph from './IncremarkParagraph.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 引用节点 */
    node: Blockquote
  }

  let { node }: Props = $props()
</script>

<blockquote class="incremark-blockquote">
  {#each node.children as child, index (index)}
    {#if child.type === 'paragraph'}
      <IncremarkParagraph node={child} />
    {:else}
      <div class="unknown-child">{child.type}</div>
    {/if}
  {/each}
</blockquote>

