import type { ExtractionSettings } from '@common/types';
import { IconExtractService } from '@common/services/iconExtractService';
import { crop, MatManager, toDataUrl, fromFile, toGray } from '@common/utils/mat';
import { IconFeatureService } from '@common/services/iconFeatureService';
import { ItemMasterService } from '@common/services/itemMasterService';
import { TesseractOcrService } from '@common/services/tesseractOcrService';

declare const cv: any;

/**
 * 画像から抽出されたアイテム情報
 */
export interface AnalyzedItem {
  id?: number;
  iconDataUrl: string;
  name: string;
  quantity: number;
  descriptors: any | null;
  sourceImageIndex: number;
}


export class InventoryExtractionService {

  private readonly iconFeatureService: IconFeatureService;
  private readonly tesseractOcrService: TesseractOcrService;
  private readonly itemMasterService: ItemMasterService;

  private constructor(iconFeatureService: IconFeatureService, tesseractOcrService: TesseractOcrService, itemMasterService: ItemMasterService) {
    this.iconFeatureService = iconFeatureService;
    this.tesseractOcrService = tesseractOcrService;
    this.itemMasterService = itemMasterService;
  }

  public static async getInstanceAsync(): Promise<InventoryExtractionService> {
    const iconFeatureService = IconFeatureService.getInstance();
    const tesseractOcrService = await TesseractOcrService.getInstanceAsync({
      lang: 'eng',
      whitelist: '0123456789K',
      // TODO: SINGLE_LINE(7) だと1が7と1に二重計上されたので、一旦SINGLE_WORD(8)で様子見
      psm: '8',
    });
    const itemMasterService = await ItemMasterService.getInstanceAsync();
    const instance = new InventoryExtractionService(iconFeatureService, tesseractOcrService, itemMasterService);
    return instance;
  }

  public dispose(): void {
    this.tesseractOcrService?.dispose();
  }

  public [Symbol.dispose](): void {
    this.dispose();
  }

  /**
   * 画像ファイル配列を読み込み、解析から重複排除、ソートまですべて行う
   */
  public async extractAllAsync(
    files: File[],
    settings: ExtractionSettings,
    onProgress: (percent: number, message: string) => void
  ): Promise<AnalyzedItem[]> {
    const allExtractedItems: AnalyzedItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgIndex = i + 1;

      onProgress(
        (i / files.length) * 100,
        `画像読み込み中 (${imgIndex}/${files.length}): ${file.name}`
      );

      const src = await fromFile(file);

      const items = await this.analyzeAsync(src, i, settings, (percent, message) => {
        onProgress(
          (i / files.length) * 100 + (percent * (1 / files.length)),
          `画像 ${imgIndex}/${files.length}: ${message}`
        );
      });

      allExtractedItems.push(...items);
      src.delete();
    }

    onProgress(95, '重複アイテムを統合中...');
    const uniqueItems = this.deduplicate(allExtractedItems);
    // const uniqueItems = allExtractedItems;

    // descriptors を delete
    allExtractedItems.forEach(item => {
      if (item.descriptors) {
        item.descriptors.delete();
        item.descriptors = null;
      }
    });

    // マスターデータのID順にソート (IDが不明なものは末尾)
    // uniqueItems.sort((a, b) => {
    //   const idA = a.id ?? Number.MAX_SAFE_INTEGER;
    //   const idB = b.id ?? Number.MAX_SAFE_INTEGER;
    //   return idA - idB;
    // });

    onProgress(100, '解析完了！');
    return uniqueItems;
  }

  /**
   * 画像からアイコンを検出し、OCRおよび特徴量からアイテム情報を抽出する
   * @param src 解析対象の cv.Mat
   * @param sourceImageIndex 画像のインデックス番号
   * @param onProgress プログレス通知コールバック
   * @returns 解析抽出されたアイテム結果のリスト
   */
  public async analyzeAsync(
    src: any,
    sourceImageIndex: number,
    settings: ExtractionSettings,
    onProgress?: (percent: number, message: string) => void
  ): Promise<AnalyzedItem[]> {
    // アイコン領域を検出
    const iconRects = await IconExtractService.extractAsync(src);
    const results: AnalyzedItem[] = [];

    for (let i = 0; i < iconRects.length; i++) {
      using matManager = new MatManager();
      const rect = iconRects[i];
      // console.log('icon: ', rect.x, rect.y, rect.width, rect.height);

      if (onProgress) {
        onProgress((i / iconRects.length) * 100, `アイテム ${i + 1}/${iconRects.length}`);
      }

      // アイコン領域を切り出し
      const iconMat = matManager.add(crop(src, rect.x, rect.y, rect.width, rect.height));
      // DataUrlに変換
      const iconDataUrl = toDataUrl(iconMat);
      // OCR して所持数を抽出
      // TODO: 処理時間がやたら長いので改善したい
      const quantity = await this.ocrNumberAsync(iconMat);
      if (quantity === null) {
        // 所持数が読み取れない場合はスキップ
        // console.log('skip: cannot read quantity');
        continue;
      }

      // アイコンの特徴量を計算
      // descriptors は呼び出し元で delete する
      const descriptors = this.iconFeatureService.computeFeatures(iconMat);
      if (!descriptors) {
        // 特徴量が計算できない場合はスキップ
        // console.log('skip: cannot compute features');
        continue;
      }

      // アイコンの色情報を計算
      const colorHash = this.iconFeatureService.computeColorHash(iconMat);
      // 特徴量をもとにアイテム名を検索
      const itemData = this.itemMasterService.findItem(
        descriptors,
        colorHash,
        settings.minGoodMatches,
        settings.earlyReturnThreshold,
      );

      results.push({
        id: itemData?.id,
        iconDataUrl,
        name: itemData?.name || '',
        quantity: quantity,
        descriptors: descriptors,
        sourceImageIndex,
      });
    }

    return results;
  }

  /**
   * アイコン画像から所持数を抽出する
   * @param src アイコン画像
   * @returns 所持数
   */
  private async ocrNumberAsync(src: any): Promise<number | null> {
    using matManager = new MatManager();
    // 数字が描かれている領域を切り出す（装備の Tier を除く）
    const numberX = Math.floor(src.cols * 0.33);
    const numberY = Math.floor(src.rows * 0.77);
    const numberWidth = src.cols - numberX;
    const numberHeight = src.rows - numberY;
    const numberMat = matManager.add(crop(src, numberX, numberY, numberWidth, numberHeight));
    // グレースケール
    const grayMat = toGray(numberMat);
    // 3倍に拡大（文字間隔を広げないと文字が繋がったり、1文字が2文字に認識されたりする）
    const gray3xMat = matManager.add(new cv.Mat());
    cv.resize(grayMat, gray3xMat, new cv.Size(grayMat.cols * 3, grayMat.rows * 3), 0, 0, cv.INTER_CUBIC);
    // 二値化
    const binaryMat = matManager.add(new cv.Mat());
    cv.threshold(gray3xMat, binaryMat, 220, 255, cv.THRESH_BINARY_INV);
    // 輪郭抽出
    const contours = matManager.add(new cv.MatVector());
    const hierarchy = matManager.add(new cv.Mat());
    cv.findContours(binaryMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    // 数字らしき輪郭だけ有効にするマスク
    const mask = matManager.add(cv.Mat.zeros(gray3xMat.rows, gray3xMat.cols, cv.CV_8UC1));
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      // 輪郭を矩形にする
      const rect = cv.boundingRect(cnt);
      // 数字の輪郭条件
      // 1. 輪郭が画像端でないこと
      const isInner = 2 < rect.x && rect.x < (binaryMat.cols - 2) && 2 < rect.y && rect.y < (binaryMat.rows - 2);
      // 2. 輪郭のアスペクト比が1:1以上であること（数字のみなら1.2でも大丈夫）
      const isAspect = (rect.height / rect.width) >= 1.0;
      // 3. 縦幅が画像の0.5～0.9
      const isHeight = (binaryMat.rows * 0.5) <= rect.height && rect.height <= (binaryMat.rows * 0.9);
      // 4. 矩形が画像の中央付近（Y座標）
      const centerY = rect.y + rect.height / 2;
      const isCenterY = (binaryMat.rows * 0.3) <= centerY && centerY <= (binaryMat.rows * 0.7);
      // 条件を満たすなら輪郭の内部をマスクする
      if (isInner && isAspect && isHeight && isCenterY) {
        cv.drawContours(mask, contours, i, new cv.Scalar(255), -1, cv.LINE_8, hierarchy, 0);
      }
      cnt.delete();
    }
    // 白背景を作成
    const gray3xNumberMat = matManager.add(new cv.Mat(gray3xMat.rows, gray3xMat.cols, cv.CV_8UC1, [255, 255, 255, 255]));
    // グレースケールの数字を合成
    gray3xMat.copyTo(gray3xNumberMat, mask);
    // ocr
    const recognizedText = await this.tesseractOcrService.recognizeAsync(gray3xNumberMat);
    // 文字列を数字に変換
    const regex = /([0-9]+)([kK]){0,1}$/;
    const match = recognizedText.match(regex);
    if (match === null) return null;
    // K があれば 1000 倍する
    const digits = match[1] + (match[2] ? '000' : '');

    return parseInt(digits);
  }

  /**
   * 重複しているアイコンを除外した配列を返す
   */
  private deduplicate(items: AnalyzedItem[], orbThreshold: number = 30): AnalyzedItem[] {
    const uniqueItems: AnalyzedItem[] = [];
    const seenNames = new Set<string>();

    for (const item of items) {
      if (item.name) {
        // アイテム名が取得できている場合は名前で比較する
        if (seenNames.has(item.name)) {
          continue;
        }
        seenNames.add(item.name);
        uniqueItems.push(item);
      } else {
        // 不明なアイテムの場合のみ、特徴量の厳格なチェックを行う
        let isDuplicate = false;
        for (const uniqueItem of uniqueItems) {
          const isMatch = this.iconFeatureService.compareDescriptors(item.descriptors, uniqueItem.descriptors, orbThreshold);
          if (isMatch) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          uniqueItems.push(item);
        }
      }
    }

    return uniqueItems;
  }
}

