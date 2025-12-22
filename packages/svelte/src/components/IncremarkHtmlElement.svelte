<!--
  @file IncremarkHtmlElement.svelte - HTML 元素组件
  @description 渲染结构化的 HTML 元素节点
-->

<script lang="ts">
  import type { RootContent, PhrasingContent } from 'mdast'
  import IncremarkInline from './IncremarkInline.svelte'
  import IncremarkHtmlElement from './IncremarkHtmlElement.svelte'

  /**
   * HtmlElementNode 类型定义（与 @incremark/core 中的定义一致）
   */
  interface HtmlElementNode {
    type: 'htmlElement'
    tagName: string
    attrs: Record<string, string>
    children: RootContent[]
    data?: {
      rawHtml?: string
      parsed?: boolean
      originalType?: string
    }
  }

  /**
   * 组件 Props
   */
  interface Props {
    /** HTML 元素节点 */
    node: HtmlElementNode
  }

  let { node }: Props = $props()

  /**
   * 判断是否是行内元素
   */
  function isInlineElement(tagName: string): boolean {
    const inlineElements = [
      'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 
      'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 
      'object', 'output', 'q', 'samp', 'script', 'select', 'small', 
      'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var'
    ]
    return inlineElements.includes(tagName.toLowerCase())
  }

  /**
   * 判断是否是自闭合元素
   */
  function isVoidElement(tagName: string): boolean {
    const voidElements = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]
    return voidElements.includes(tagName.toLowerCase())
  }

  /**
   * 判断子节点是否都是行内内容
   */
  function hasOnlyInlineChildren(children: RootContent[]): boolean {
    if (!children || children.length === 0) return true
    
    return children.every(child => {
      const type = child.type
      // 常见的行内类型
      const inlineTypes = ['text', 'strong', 'emphasis', 'inlineCode', 'link', 'image', 'break', 'html', 'htmlElement']
      if (inlineTypes.includes(type)) {
        // 如果是 htmlElement，检查是否是行内元素
        if (type === 'htmlElement') {
          return isInlineElement((child as unknown as HtmlElementNode).tagName)
        }
        return true
      }
      return false
    })
  }

  /**
   * 将属性对象转换为 HTML 属性对象（过滤危险属性）
   */
  function getAttrs(attrs: Record<string, string>): Record<string, string> {
    // 过滤掉可能有问题的属性
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(attrs)) {
      // 跳过事件属性（已在解析时过滤，这里双重保险）
      if (key.startsWith('on')) continue
      result[key] = value
    }
    return result
  }

  /**
   * 计算属性
   */
  const attrs = $derived(getAttrs(node.attrs))
  const className = $derived(`incremark-html-element incremark-${node.tagName}`)
  const isVoid = $derived(isVoidElement(node.tagName))
  const hasOnlyInline = $derived(hasOnlyInlineChildren(node.children))
</script>

<svelte:element 
  this={node.tagName} 
  {...attrs}
  class={className}
>
  {#if !isVoid}
    <!-- 如果子节点都是行内内容，使用 IncremarkInline -->
    {#if hasOnlyInline}
      <IncremarkInline nodes={node.children as PhrasingContent[]} />
    {:else}
      <!-- 否则递归渲染每个子节点 -->
      {#each node.children as child, idx (idx)}
        <!-- 如果子节点是 htmlElement，递归 -->
        {#if child.type === 'htmlElement'}
          <IncremarkHtmlElement node={child as unknown as HtmlElementNode} />
        <!-- 如果是文本节点 -->
        {:else if child.type === 'text'}
          {(child as any).value}
        <!-- 其他类型尝试用 IncremarkInline -->
        {:else if ['strong', 'emphasis', 'inlineCode', 'link', 'image', 'break'].includes(child.type)}
          <IncremarkInline nodes={[child as PhrasingContent]} />
        <!-- 段落等块级元素 -->
        {:else if child.type === 'paragraph'}
          <p>
            <IncremarkInline nodes={((child as any).children as PhrasingContent[])} />
          </p>
        <!-- 其他未知类型，显示原始 -->
        {:else}
          <div class="incremark-unknown-child">{child.type}</div>
        {/if}
      {/each}
    {/if}
  {/if}
</svelte:element>

