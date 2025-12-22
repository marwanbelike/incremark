<!--
  @file CustomInputPanel.svelte - 自定义输入面板组件
  @description 用于输入自定义 Markdown 内容
-->

<script lang="ts">
  /**
   * 组件 Props
   */
  interface Props {
    /** 输入值 */
    value?: string
    /** 国际化消息 */
    t: {
      customInput: string
      inputPlaceholder: string
      useExample: string
    }
    /** 使用示例回调 */
    onUseExample?: () => void
  }

  let {
    value = $bindable(''),
    t,
    onUseExample
  }: Props = $props()
</script>

  <div class="input-panel">
  <div class="input-header">
    <span>✏️ {t.customInput}</span>
    <button class="use-example-btn" onclick={() => onUseExample?.()}>
      {t.useExample}
    </button>
  </div>
  <textarea 
    bind:value
    placeholder={t.inputPlaceholder}
    class="markdown-input"
    rows="8"
    oninput={(e) => {
      value = e.currentTarget.value
    }}
  ></textarea>
</div>

<style>
  .input-panel {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .use-example-btn {
    background: #e5e7eb;
    color: #374151;
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .use-example-btn:hover {
    background: #d1d5db;
  }

  .markdown-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 0.875rem;
    resize: vertical;
    line-height: 1.5;
  }

  .markdown-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
</style>

