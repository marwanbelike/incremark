/**
 * 脚注列表组件
 *
 * 在文档底部渲染所有脚注定义，按引用出现的顺序排列
 *
 * @component IncremarkFootnotes
 *
 * @remarks
 * 样式定义在 @incremark/theme 中的 footnotes.less
 * footnoteReferenceOrder 自动从 context 获取，无需手动传递
 */

import React from 'react'
import type { RootContent } from 'mdast'
import { useDefinitions } from '../contexts/DefinitionsContext'
import { IncremarkRenderer } from './IncremarkRenderer'

/**
 * IncremarkFootnotes 组件
 *
 * 渲染文档底部的脚注列表，支持：
 * - 按引用出现顺序排列
 * - 双向跳转（引用 ↔ 定义）
 * - 高亮当前查看的脚注
 *
 * @example
 * ```tsx
 * <IncremarkFootnotes />
 * ```
 */
export const IncremarkFootnotes: React.FC = () => {
  const { footnoteDefinitions, footnoteReferenceOrder } = useDefinitions()

  // 按引用顺序排列的脚注列表（只显示已有定义的脚注）
  const orderedFootnotes = React.useMemo(() => {
    return footnoteReferenceOrder
      .map(identifier => ({
        identifier,
        definition: footnoteDefinitions[identifier]
      }))
      .filter(item => item.definition !== undefined)
  }, [footnoteReferenceOrder, footnoteDefinitions])

  // 如果没有脚注，不渲染
  if (orderedFootnotes.length === 0) {
    return null
  }

  return (
    <section className="incremark-footnotes">
      <hr className="incremark-footnotes-divider" />
      <ol className="incremark-footnotes-list">
        {orderedFootnotes.map((item, index) => (
          <li
            key={item.identifier}
            id={`fn-${item.identifier}`}
            className="incremark-footnote-item"
          >
            <div className="incremark-footnote-content">
              {/* 脚注序号 */}
              <span className="incremark-footnote-number">{index + 1}.</span>
              
              {/* 脚注内容 */}
              <div className="incremark-footnote-body">
                {item.definition.children.map((child: RootContent, childIndex: number) => (
                  <IncremarkRenderer key={childIndex} node={child} />
                ))}
              </div>
            </div>
            
            {/* 返回链接 */}
            <a 
              href={`#fnref-${item.identifier}`} 
              className="incremark-footnote-backref"
              aria-label="返回引用位置"
            >
              ↩
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

