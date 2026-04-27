/**
 * グリッド検出結果のアイコン領域
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 解析の閾値設定
 */
export interface ExtractionSettings {
  /** ORB最小一致点数 (1-100, default: 5) */
  minGoodMatches: number;
  /** 早期リターン閾値 (1-100, default: 10) */
  earlyReturnThreshold: number;
  /** 色許容誤差 (1-100, default: 30) */
  colorThreshold: number;
}
