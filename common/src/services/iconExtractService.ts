import { Rectangle } from '../types';
import { MatManager } from '../utils/mat';

/**
 * OpenCV (cv) の型定義（簡易版）
 */
declare const cv: any;

/**
 * アイコン領域検出のオプション
 */
export interface IconExtractOptions {
  /** 二値化の閾値 */
  threshold?: number;
  /** アイコン枠の横縦比の最小値、1.0 だと完全な正方形 */
  minIconAspectRatio?: number;
  /** アイコン枠の横縦比の最大値、1.0 だと完全な正方形 */
  maxIconAspectRatio?: number;
  /** アイコン枠の横幅の最小値 */
  minIconWidthRatio?: number;
  /** アイコン枠の横幅の最大値 */
  maxIconWidthRatio?: number;
}

/**
 * アイコン領域を検出するサービス
 */
export class IconExtractService {

  /**
   * 画像からアイコン領域を検出し、各アイコンの座標を算出する
   *
   * min/maxIconWidthRatio の考察
   * 下記は画面サイズに対するアイコンの横幅の比率
   * 計測した環境 - 画面サイズ : アイコンの横幅
   * PC 16:9          - 1508 : 141 = 0.0935
   * PC 4:3           - 1280 : 120 = 0.09375
   * Android pixel 4a - 2340 : 194 = 0.0829
   * 上記を考慮して 0.075 から 0.100 に設定している
   */
  static async extractAsync(src: any, options: IconExtractOptions = {}): Promise<Rectangle[]> {
    const {
      threshold = 200,
      minIconAspectRatio = 1.18,
      maxIconAspectRatio = 1.28,
      minIconWidthRatio = 0.075,
      maxIconWidthRatio = 0.100,
    } = options;

    if (typeof cv === 'undefined' || !cv.Mat) {
      throw new Error('OpenCV.js がロードされていません。');
    }

    using matManager = new MatManager();

    // 輪郭検出のための前処理
    // 画面右側のアイテム領域以外を白で塗りつぶす
    const rect: Rectangle = {
      x: Math.floor(src.cols * 0.5),
      y: 0,
      width: Math.floor(src.cols * 0.5),
      height: src.rows
    };
    const maskedMat = matManager.add(new cv.Mat(src.rows, src.cols, src.type(), [255, 255, 255, 255]));
    const rightSideMat = matManager.add(src.roi(rect));
    const destMat = matManager.add(maskedMat.roi(rect));
    rightSideMat.copyTo(destMat);
    // グレースケール
    const gray = matManager.add(new cv.Mat());
    cv.cvtColor(maskedMat, gray, cv.COLOR_RGBA2GRAY);
    // 二値化（threshold～255 を黒、それ以外を白にする）
    const binary = matManager.add(new cv.Mat());
    cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY_INV);
    // 輪郭検出
    const contours = matManager.add(new cv.MatVector());
    const hierarchy = matManager.add(new cv.Mat());
    cv.findContours(binary, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    // 検出した輪郭からアイコン領域を抽出
    const candidates: Rectangle[] = [];
    const minIconWidth = Math.floor(src.cols * minIconWidthRatio);
    const maxIconWidth = Math.floor(src.cols * maxIconWidthRatio);
    for (let i = 0; i < contours.size(); ++i) {
      const cnt = contours.get(i);
      const rect = cv.boundingRect(cnt);
      const aspectRatio = rect.width / rect.height;

      // 検出した輪郭がアイコンの条件を満たすかチェック
      // アイコンの縦横比
      if (minIconAspectRatio <= aspectRatio && aspectRatio <= maxIconAspectRatio) {
        // アイコンのサイズ
        if (minIconWidth <= rect.width && rect.width <= maxIconWidth) {
          // TODO: アイコンの上下左右の無駄な領域を切り取る、値は要調整
          candidates.push({
            x: rect.x + rect.width * 0.15,
            y: rect.y + rect.height * 0.06,
            width: rect.width * 0.70,
            height: rect.height * 0.88,
          });
        }
      }
      cnt.delete();
    }

    // 座標順にソート（上から下、左から右）
    candidates.sort((a, b) => {
      const rowThreshold = a.height / 2;
      if (Math.abs(a.y - b.y) < rowThreshold) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    // 近接すぎる矩形（二重検出など）を除去
    const rects: Rectangle[] = [];
    for (const cand of candidates) {
      const minDistanceX = cand.width * 0.8;
      const minDistanceY = cand.height * 0.8;
      const isTooClose = rects.some(rect =>
        Math.abs(rect.x - cand.x) < minDistanceX && Math.abs(rect.y - cand.y) < minDistanceY
      );
      if (!isTooClose) {
        rects.push(cand);
      }
    }

    return rects;
  }
}
