import React from 'react'
import type { Blockquote } from 'mdast'
import { IncremarkRenderer } from './IncremarkRenderer'

export interface IncremarkBlockquoteProps {
  node: Blockquote
}

export const IncremarkBlockquote: React.FC<IncremarkBlockquoteProps> = ({ node }) => {
  return (
    <blockquote className="incremark-blockquote">
      {node.children.map((child, index) => (
        <React.Fragment key={index}>
          <IncremarkRenderer node={child} />
        </React.Fragment>
      ))}
    </blockquote>
  )
}

