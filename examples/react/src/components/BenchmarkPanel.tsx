import React from 'react'
import type { BenchmarkStats } from '../hooks'
import type { Messages } from '../locales'

interface BenchmarkPanelProps {
  stats: BenchmarkStats
  running: boolean
  progress: number
  t: Pick<Messages, 'benchmark' | 'runBenchmark' | 'running' | 'traditional' | 'incremark' | 'totalTime' | 'totalChars' | 'speedup' | 'benchmarkNote'>
  onRun: () => void
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({ 
  stats, 
  running, 
  progress, 
  t, 
  onRun 
}) => {
  return (
    <div className="benchmark-panel">
      <div className="benchmark-header">
        <h2>⚡ {t.benchmark}</h2>
        <button 
          className="benchmark-btn"
          onClick={onRun} 
          disabled={running}
        >
          {running ? t.running : t.runBenchmark}
        </button>
      </div>
      
      {running && (
        <div className="benchmark-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      {stats.traditional.time > 0 && (
        <div className="benchmark-results">
          <div className="benchmark-card traditional">
            <h3>🐢 {t.traditional}</h3>
            <div className="stat">
              <span className="label">{t.totalTime}</span>
              <span className="value">{stats.traditional.time.toFixed(2)} ms</span>
            </div>
            <div className="stat">
              <span className="label">{t.totalChars}</span>
              <span className="value">{(stats.traditional.totalChars / 1000).toFixed(1)}K</span>
            </div>
          </div>
          
          <div className="benchmark-card incremark">
            <h3>🚀 {t.incremark}</h3>
            <div className="stat">
              <span className="label">{t.totalTime}</span>
              <span className="value">{stats.incremark.time.toFixed(2)} ms</span>
            </div>
            <div className="stat">
              <span className="label">{t.totalChars}</span>
              <span className="value">{(stats.incremark.totalChars / 1000).toFixed(1)}K</span>
            </div>
          </div>
          
          <div className="benchmark-card speedup">
            <h3>📈 {t.speedup}</h3>
            <div className="speedup-value">
              {(stats.traditional.time / stats.incremark.time).toFixed(1)}x
            </div>
          </div>
        </div>
      )}
      
      <p className="benchmark-note">💡 {t.benchmarkNote}</p>
    </div>
  )
}

