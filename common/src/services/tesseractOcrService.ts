import { createWorker } from 'tesseract.js';
import { toImageData } from '../utils/mat';

/**
 * Tesseract.js を用いた OCR サービス実装
 */
export class TesseractOcrService {
  private worker: any = null;

  private constructor(worker: any) {
    this.worker = worker;
  }

  public static async getInstanceAsync({
    lang = 'eng',
    whitelist = null,
    // AUTO: "3",
    // AUTO_ONLY: "2",
    // AUTO_OSD: "1",
    // CIRCLE_WORD: "9",
    // OSD_ONLY: "0",
    // RAW_LINE: "13",
    // SINGLE_BLOCK: "6",
    // SINGLE_BLOCK_VERT_TEXT: "5",
    // SINGLE_CHAR: "10",
    // SINGLE_COLUMN: "4",
    // SINGLE_LINE: "7",
    // SINGLE_WORD: "8",
    // SPARSE_TEXT: "11",
    // SPARSE_TEXT_OSD: "12",
    psm = '3',
  }: {
    lang?: string;
    whitelist?: string | null;
    psm?: string;
  } = {}): Promise<TesseractOcrService> {
    const worker = await createWorker(lang);
    const params: Record<string, any> = {};

    if (whitelist !== null) params.tessedit_char_whitelist = whitelist;
    params.tessedit_pageseg_mode = psm;

    if (Object.keys(params).length > 0) {
      await worker.setParameters(params);
    }

    return new TesseractOcrService(worker);
  }

  public async recognizeAsync(
    mat: any,
    rectangle: {
      x: number, y: number, width: number, height: number
    } | null = null,
  ): Promise<string> {

    const imageData = toImageData(mat);
    const canvas = document.createElement('canvas');
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    canvas.getContext('2d')?.putImageData(imageData, 0, 0);

    let text: string;
    if (rectangle) {
      const result = await this.worker.recognize(canvas, {
        rectangle: { top: rectangle.y, left: rectangle.x, width: rectangle.width, height: rectangle.height },
      });
      text = result.data.text;
    } else {
      const result = await this.worker.recognize(canvas);
      text = result.data.text;
    }

    return text.trim();
  }

  public async dispose(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.dispose();
  }
}
