import React from 'react'
import type { Messages } from '../locales'

interface CustomInputPanelProps {
  value: string
  onChange: (value: string) => void
  onUseExample: () => void
  t: Pick<Messages, 'customInput' | 'inputPlaceholder' | 'useExample'>
}

export const CustomInputPanel: React.FC<CustomInputPanelProps> = ({ 
  value, 
  onChange, 
  onUseExample, 
  t 
}) => {
  return (
    <div className="input-panel">
      <div className="input-header">
        <span>✏️ {t.customInput}</span>
        <button className="use-example-btn" onClick={onUseExample}>
          {t.useExample}
        </button>
      </div>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.inputPlaceholder}
        className="markdown-input"
        rows={8}
      />
    </div>
  )
}

