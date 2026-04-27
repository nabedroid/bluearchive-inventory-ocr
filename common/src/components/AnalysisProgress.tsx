export interface AnalysisProgressProps {
  /** 進捗率 (0-100) */
  percent: number;
  /** メッセージ */
  message: string;
}

export function AnalysisProgress({ percent, message }: AnalysisProgressProps) {
  return (
    <div className="analysis-progress">
      <div className="progress-info">
        <span className="step-label">{message}</span>
        <span className="percent-label">{Math.round(percent)}%</span>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  )
}
