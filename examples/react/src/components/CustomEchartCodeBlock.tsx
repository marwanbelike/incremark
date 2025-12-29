import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

export interface CustomEchartCodeBlockProps {
  codeStr: string
  lang?: string
  completed?: boolean
  takeOver?: boolean
}

export const CustomEchartCodeBlock: React.FC<CustomEchartCodeBlockProps> = ({ codeStr, completed, takeOver }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  // 是否应该显示图表
  const shouldShowChart = takeOver === true || completed

  function renderChart() {
    if (!codeStr || !chartRef.current) return

    setError('')

    try {
      const option = JSON.parse(codeStr)
      console.log(option)

      const chart = echarts.getInstanceByDom(chartRef.current)
      if (chart) {
        chart.setOption(option)
      } else {
        echarts.init(chartRef.current).setOption(option)
      }
    } catch (e: any) {
      setError(e.message || '渲染失败')
    }
  }

  // 监听 completed 变化
  useEffect(() => {
    console.log('completed 变化:', completed, 'takeOver:', takeOver)
    if (shouldShowChart) {
      setTimeout(() => renderChart(), 0)
    }
  }, [completed])

  return (
    <div className="custom-echart-code-block">
      <div className="echart-header">
        <span className="language">ECHART</span>
      </div>
      <div className="echart-content">
        {!shouldShowChart ? (
          <div className="echart-loading">解析中...</div>
        ) : error ? (
          <div className="echart-error">{error}</div>
        ) : (
          <div 
            ref={chartRef} 
            className="echart-chart" 
            style={{ 
              width: '100%', 
              height: '400px',
              display: shouldShowChart ? 'block' : 'none'
            }}
          />
        )}
      </div>
    </div>
  )
}
