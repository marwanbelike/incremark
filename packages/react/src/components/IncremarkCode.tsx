import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Code } from 'mdast'

export interface IncremarkCodeProps {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
  /** 自定义代码块组件映射，key 为代码语言名称 */
  customCodeBlocks?: Record<string, React.ComponentType<{ codeStr: string; lang?: string; completed?: boolean; takeOver?: boolean }>>
  /** 块状态，用于判断是否使用自定义组件 */
  blockStatus?: 'pending' | 'stable' | 'completed'
  /** 代码块配置映射，key 为代码语言名称 */
  codeBlockConfigs?: Record<string, { takeOver?: boolean }>
}

export const IncremarkCode: React.FC<IncremarkCodeProps> = ({
  node,
  theme = 'github-dark',
  fallbackTheme = 'github-dark',
  disableHighlight = false,
  mermaidDelay = 500,
  customCodeBlocks,
  blockStatus = 'completed',
  codeBlockConfigs
}) => {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [mermaidSvg, setMermaidSvg] = useState('')
  const [mermaidLoading, setMermaidLoading] = useState(false)
  const [mermaidViewMode, setMermaidViewMode] = useState<'preview' | 'source'>('preview')
  
  const mermaidRef = useRef<any>(null)
  const highlighterRef = useRef<any>(null)
  const mermaidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedLanguagesRef = useRef<Set<string>>(new Set())
  const loadedThemesRef = useRef<Set<string>>(new Set())
  
  const language = node.lang || 'text'
  const code = node.value
  const isMermaid = language === 'mermaid'

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = React.useMemo(() => {
    const component = customCodeBlocks?.[language]
    if (!component) return null

    // 检查该语言的配置
    const config = codeBlockConfigs?.[language]

    // 如果配置了 takeOver 为 true，则从一开始就使用
    if (config?.takeOver) {
      return component
    }

    // 否则，默认行为：只在 completed 状态使用
    if (blockStatus !== 'completed') {
      return null
    }

    return component
  }, [customCodeBlocks, language, blockStatus, codeBlockConfigs])

  // 是否使用自定义组件
  const useCustomComponent = !!CustomCodeBlock
  
  const toggleMermaidView = useCallback(() => {
    setMermaidViewMode(prev => prev === 'preview' ? 'source' : 'preview')
  }, [])
  
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 复制失败静默处理
    }
  }, [code])
  
  const doRenderMermaid = useCallback(async () => {
    if (!code) return
    
    try {
      if (!mermaidRef.current) {
        const mermaidModule = await import('mermaid')
        mermaidRef.current = mermaidModule.default
        mermaidRef.current.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose'
        })
      }
      
      const mermaid = mermaidRef.current
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const { svg } = await mermaid.render(id, code)
      setMermaidSvg(svg)
    } catch {
      setMermaidSvg('')
    } finally {
      setMermaidLoading(false)
    }
  }, [code])
  
  const scheduleRenderMermaid = useCallback(() => {
    if (!isMermaid || !code) return
    
    if (mermaidTimerRef.current) {
      clearTimeout(mermaidTimerRef.current)
    }
    
    setMermaidLoading(true)
    mermaidTimerRef.current = setTimeout(() => {
      doRenderMermaid()
    }, mermaidDelay)
  }, [isMermaid, code, mermaidDelay, doRenderMermaid])
  
  const highlight = useCallback(async () => {
    if (isMermaid) {
      scheduleRenderMermaid()
      return
    }

    if (!code || disableHighlight) {
      setHighlightedHtml('')
      return
    }

    setIsHighlighting(true)

    try {
      if (!highlighterRef.current) {
        const { createHighlighter } = await import('shiki')
        highlighterRef.current = await createHighlighter({
          themes: [theme as any],
          langs: []
        })
        loadedThemesRef.current.add(theme)
      }

      const highlighter = highlighterRef.current
      const lang = language

      // 按需加载语言
      if (!loadedLanguagesRef.current.has(lang) && lang !== 'text') {
        try {
          await highlighter.loadLanguage(lang)
          loadedLanguagesRef.current.add(lang)
        } catch {
          // 语言不支持，标记但不阻止
        }
      }

      // 按需加载主题
      if (!loadedThemesRef.current.has(theme)) {
        try {
          await highlighter.loadTheme(theme)
          loadedThemesRef.current.add(theme)
        } catch {
          // 主题不支持
        }
      }

      const html = highlighter.codeToHtml(code, {
        lang: loadedLanguagesRef.current.has(lang) ? lang : 'text',
        theme: loadedThemesRef.current.has(theme) ? theme : fallbackTheme
      })
      setHighlightedHtml(html)
    } catch {
      // Shiki 不可用或加载失败
      setHighlightedHtml('')
    } finally {
      setIsHighlighting(false)
    }
  }, [code, language, theme, fallbackTheme, disableHighlight, isMermaid, scheduleRenderMermaid])
  
  useEffect(() => {
    highlight()
  }, [highlight])
  
  useEffect(() => {
    return () => {
      if (mermaidTimerRef.current) {
        clearTimeout(mermaidTimerRef.current)
      }
    }
  }, [])
  
  // 自定义代码块组件
  if (useCustomComponent && CustomCodeBlock) {
    const config = codeBlockConfigs?.[language]
    return (
      <CustomCodeBlock
        codeStr={code}
        lang={language}
        completed={blockStatus === 'completed'}
        takeOver={config?.takeOver}
      />
    )
  }
  
  if (isMermaid) {
    return (
      <div className="incremark-mermaid">
        <div className="mermaid-header">
          <span className="language">MERMAID</span>
          <div className="mermaid-actions">
            <button 
              className="code-btn" 
              onClick={toggleMermaidView} 
              type="button"
              disabled={!mermaidSvg}
            >
              {mermaidViewMode === 'preview' ? '源码' : '预览'}
            </button>
            <button className="code-btn" onClick={copyCode} type="button">
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>
        <div className="mermaid-content">
          {mermaidLoading && !mermaidSvg ? (
            <div className="mermaid-loading">
              <pre className="mermaid-source-code">{code}</pre>
            </div>
          ) : mermaidViewMode === 'source' ? (
            <pre className="mermaid-source-code">{code}</pre>
          ) : mermaidSvg ? (
            <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
          ) : (
            <pre className="mermaid-source-code">{code}</pre>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="incremark-code">
      <div className="code-header">
        <span className="language">{language}</span>
        <button className="code-btn" onClick={copyCode} type="button">
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <div className="code-content">
        {isHighlighting && !highlightedHtml ? (
          <div className="code-loading">
            <pre><code>{code}</code></pre>
          </div>
        ) : highlightedHtml ? (
          <div className="shiki-wrapper" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <pre className="code-fallback"><code>{code}</code></pre>
        )}
      </div>
    </div>
  )
}

