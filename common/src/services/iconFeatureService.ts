
import * as Feature from "../utils/feature";
import { MatManager, toGray, crop, toHsv } from "../utils/mat";

declare const cv: any;

/**
 * アイコンの特徴量を計算し、比較するサービス
 * FeatureMatcher をラップして、アイコンに特化した機能を提供する
 */
export class IconFeatureService {

  private static _instance: IconFeatureService | null = null;

  private constructor() { }

  public static getInstance(): IconFeatureService {
    if (!this._instance) {
      this._instance = new IconFeatureService();
    }
    return this._instance;
  }

  // 他のサービスと平仄を取りたいので、dispose を空実装
  public dispose(): void { }
  [Symbol.dispose](): void { this.dispose(); }

  /**
   * 特徴量、色情報計算の画像の前処理
   * 短い辺に合わせて、中央を正方形に切り取り、100x100にリサイズする
   */
  private static preprocessCompute(mat: any): any {
    // 128x128にリサイズ
    const resizedMat = new cv.Mat();
    cv.resize(mat, resizedMat, new cv.Size(128, 128), 0, 0, cv.INTER_AREA);

    return resizedMat;
  }

  /**
   * アイコンの特徴量を計算する
   */
  public computeFeatures(mat: any): any | null {
    // アイコンの中心部分のみを特徴量計算に使う
    using matManager = new MatManager();
    // グレースケールに変換
    const grayMat = toGray(mat);
    // リサイズ
    const resizedMat = matManager.add(IconFeatureService.preprocessCompute(grayMat));
    // マスク作成
    const mask = matManager.add(new cv.Mat.zeros(128, 128, cv.CV_8UC1));
    // 枠線、所持数部分以外を有効にする
    const roi = matManager.add(mask.roi(new cv.Rect(10, 10, 108, 80)));
    roi.setTo(new cv.Scalar(255));

    try {
      using result = Feature.compute(resizedMat, mask);
      const descriptors = result?.descriptors?.clone();
      return descriptors;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  /**
   * アイコンから色情報を計算する(中央部分の3x3 HSV配列)
   */
  public computeColorHash(mat: any): number[] {
    using matManager = new MatManager();
    // RGBA→RGB に正規化する。
    // cv.imshow 経由（DataUrl→PNG→imread）では alpha compositing で RGB 値が変化するため
    // 先にアルファを除去して両経路の結果を統一する
    const rgbMat = matManager.add(new cv.Mat());
    if (mat.channels() === 4) {
      cv.cvtColor(mat, rgbMat, cv.COLOR_RGBA2RGB);
    } else {
      mat.copyTo(rgbMat);
    }
    const resizedMat = matManager.add(IconFeatureService.preprocessCompute(rgbMat));
    // 枠線、所持数部分を除外する
    const cropMat = matManager.add(crop(resizedMat, 10, 10, 108, 80));
    // 3x3にリサイズ
    const miniMat = matManager.add(new cv.Mat());
    cv.resize(cropMat, miniMat, new cv.Size(3, 3));
    // HSVに変換
    const hsvMat = matManager.add(toHsv(miniMat));
    // データを配列に変換
    const data = Array.from(new Uint8Array(hsvMat.data));
    return data;
  }

  /**
   * 2つのアイコンの特徴量を比較し、一致するかどうかを返す
   */
  public compareDescriptors(descriptors1: any, descriptors2: any, threshold: number = 20): boolean {
    const score = Feature.compare(descriptors1, descriptors2);
    return score >= threshold;
  }

  /**
   * 色情報のハッシュを比較し、誤差を返す
   */
  public compareColor(hash1: number[], hash2: number[]): number | null {
    if (hash1.length !== hash2.length) return null;

    const channels = hash1.length / 9; // 3x3 = 9ピクセル

    if (channels === 3) {
      // HSV空間での比較とみなす
      let diffH = 0;
      let diffS = 0;
      let diffV = 0;

      for (let i = 0; i < hash1.length; i += 3) {
        const h1 = hash1[i];
        const s1 = hash1[i + 1];
        const v1 = hash1[i + 2];
        const h2 = hash2[i];
        const s2 = hash2[i + 1];
        const v2 = hash2[i + 2];

        // Hueは0-179の円環なので最短距離を求める
        const dH = Math.abs(h1 - h2);
        // 彩度が低い（無彩色に近い）場合は Hue の影響度を下げる
        const weightH = (s1 > 30 && s2 > 30) ? 1.5 : 0.2;
        diffH += Math.min(dH, 180 - dH) * weightH;
        diffS += Math.abs(s1 - s2);
        diffV += Math.abs(v1 - v2);
      }

      const avgDiffH = diffH / 9;
      const avgDiffS = diffS / 9;
      const avgDiffV = diffV / 9;

      // H(色相)の差はよりクリティカルなため重みをつけ、V(明度)の違いにはある程度寛容にする
      // H:1.5, S:1.0, V:0.5 など重み付けした平均差分を計算
      const avgDiff = (avgDiffH * 1.5 + avgDiffS * 1.0 + avgDiffV * 0.5) / 3;
      return avgDiff;
    } else {
      throw new Error(`computeColorHash: チャンネル数エラー（${channels}）`);
    }
  }
}