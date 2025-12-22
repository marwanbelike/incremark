<!--
  @file IncremarkList.svelte - 列表组件
  @description 渲染 Markdown 列表（有序列表和无序列表），支持任务列表
-->

<script lang="ts">
  import type { List, ListItem, PhrasingContent } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 列表节点 */
    node: List
  }

  let { node }: Props = $props()

  /**
   * 根据 ordered 属性计算标签名
   */
  const tag = $derived(node.ordered ? 'ol' : 'ul')

  /**
   * 判断是否是任务列表
   */
  const isTaskList = $derived(
    node.children.some(item => item.checked !== null && item.checked !== undefined)
  )

  /**
   * 获取列表项内容
   * 
   * @param item - 列表项节点
   * @returns 行内内容数组
   */
  function getItemContent(item: ListItem): PhrasingContent[] {
    const firstChild = item.children[0]
    if (firstChild?.type === 'paragraph') {
      return firstChild.children as PhrasingContent[]
    }
    return []
  }

  /**
   * 判断列表项是否是任务项
   * 
   * @param item - 列表项节点
   * @returns 是否是任务项
   */
  function isTaskItem(item: ListItem): boolean {
    return item.checked !== null && item.checked !== undefined
  }
</script>

<svelte:element 
  this={tag} 
  class="incremark-list"
  class:task-list={isTaskList}
>
  {#each node.children as item, index (index)}
    <li 
      class="incremark-list-item"
      class:task-item={isTaskItem(item)}
    >
      {#if isTaskItem(item)}
        <label class="task-label">
          <input 
            type="checkbox" 
            checked={item.checked} 
            disabled 
            class="checkbox"
          />
          <span class="task-content">
            <IncremarkInline nodes={getItemContent(item)} />
          </span>
        </label>
      {:else}
        <IncremarkInline nodes={getItemContent(item)} />
      {/if}
    </li>
  {/each}
</svelte:element>

