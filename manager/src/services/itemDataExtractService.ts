import { IconFeatureService } from '@common/services/iconFeatureService';
import { IconExtractService } from '@common/services/iconExtractService';
import { crop, toBase64, toDataUrl, MatManager } from '@common/utils/mat';
import { ItemMasterData } from '@common/services/itemMasterService';
import { Rectangle } from '@common/types';

declare const cv: any;

/**
 * 物資画面のスクショからアイテムの情報を抽出する
 */
export class ItemDataExtractService {

  private readonly iconFeatureService: IconFeatureService;

  private constructor() {
    this.iconFeatureService = IconFeatureService.getInstance();
  }

  public static getInstance(): ItemDataExtractService {
    return new ItemDataExtractService();
  }

  public dispose(): void { }

  [Symbol.dispose](): void {
    this.dispose();
  }

  /**
   * 画像からアイテム情報を抽出する
   * @param src OpenCV Mat
   */
  public async extractAsync(
    src: any,
  ): Promise<ItemMasterData[]> {
    using matManager = new MatManager();

    // アイコンを検出
    const rects = await IconExtractService.extractAsync(src);

    if (rects.length === 0) {
      throw new Error('アイコンが見つかりませんでした。');
    }

    const items: ItemMasterData[] = [];
    for (const rect of rects) {
      // アイコンを切り出す
      const iconMat = matManager.add(crop(src, rect.x, rect.y, rect.width, rect.height));
      const iconDataUrl = toDataUrl(iconMat);

      // 特徴量と色の計算
      const descriptors = matManager.add(this.iconFeatureService.computeFeatures(iconMat));
      const descriptorsBase64 = toBase64(descriptors);
      const colorHash = this.iconFeatureService.computeColorHash(iconMat);

      items.push(new ItemMasterData({
        id: items.length + 1,
        iconDataUrl: iconDataUrl,
        name: '',
        features: descriptorsBase64,
        colorHash: colorHash,
      }));
    }

    return items;
  }
}
