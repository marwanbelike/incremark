<!--
  @file IncremarkDefault.svelte - 默认组件
  @description 用于显示未实现的节点类型（降级处理）
-->

<script lang="ts">
  import type { RootContent } from 'mdast'

  /**
   * 组件 Props
   */
  interface Props {
    /** 节点 */
    node: RootContent
  }

  let { node }: Props = $props()
</script>

<div class="incremark-default">
  <span class="type-badge">{node.type}</span>
  <pre>{JSON.stringify(node, null, 2)}</pre>
</div>

