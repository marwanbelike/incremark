<!--
  @file IncremarkParagraph.svelte - 段落组件
  @description 渲染 Markdown 段落节点
-->

<script lang="ts">
  import type { Paragraph } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 段落节点 */
    node: Paragraph
  }

  let { node }: Props = $props()
</script>

<p class="incremark-paragraph">
  <IncremarkInline nodes={node.children} />
</p>

