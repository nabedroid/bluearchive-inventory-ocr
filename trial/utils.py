import cv2
import glob
import os

import numpy as np
import UnityPy
from PIL import Image

# バンドル内で使用されている背景画像の名前
BG_SPRITE_NAMES = ['Card_Item_Bg_N', 'Card_Item_Bg_R', 'Card_Item_Bg_SR', 'Card_Item_Bg_SSR']

def load_bgs(base_path: str) -> dict[str, Image.Image]:
  """レアリティごとの背景Textureを読み込む
  正確には Common という IconAtlas から切り出す"""
  ui_sprite_data = {}
  image = None
  # Common が含まれていそうなアセットを読み込む
  env = UnityPy.Environment()
  env.load_files(glob.glob(os.path.join(base_path, 'prologdepengroup-assets-_mx-uis-atlas-_mxprolog-*_assets_all_*.bundle')))
  # アセットの中から Common のデータを取得する
  for obj in env.objects:
    data = obj.read()

    # Common 以外はスキップ
    if data.m_Name != 'Common': continue

    if obj.type.name == 'MonoBehaviour':
      # カスタムデータを取得
      data = obj.read_typetree()
      for sprite in data['mSprites']:
        # カードの背景画像の定義（切り取り位置）を取得
        if sprite['name'] in BG_SPRITE_NAMES:
          ui_sprite_data[sprite['name']] = sprite
    elif obj.type.name == 'Texture2D':
      # アトラス画像を取得
      image = data.image
    # 背景画像とアトラス画像が揃ったらループを抜ける
    if len(ui_sprite_data) == len(BG_SPRITE_NAMES) and image is not None: break
  # どちらかが揃わなかったらエラー
  if len(ui_sprite_data) != len(BG_SPRITE_NAMES) or image is None:
    raise Exception('Failed to load bgs')
  # 背景画像を切り出す
  result = {}
  for bg_name, s in ui_sprite_data.items():
    result[bg_name] = image.crop((s['x'], s['y'], s['x'] + s['width'], s['y'] + s['height']))
  return result

def composite_icon(bg, item_image) -> Image.Image:
  """背景とアイコンを合成する
  MonoBehaviour からそれっぽい定義を見つけて、それっぽく合成している"""
  # ベース
  result = Image.new("RGBA", (265, 221), (0, 0, 0, 0))
  # 背景をリサイズ
  bg_resized = bg.resize((265, 221), Image.LANCZOS).convert("RGBA")
  # Position (0, -2.2) ずらして張り付け（本当にずらしているかは不明）
  result.paste(bg_resized, (0, 2), bg_resized)
  # 装備アイコンをリサイズ
  item_resized = item_image.resize((257, 203), Image.LANCZOS).convert("RGBA")
  # 装備アイコンを背景の中心に張り付け
  result.paste(item_resized, (4, 9), item_resized)
  return result


def normalize_icon(image: Image.Image) -> np.ndarray:
  """アイコン画像をフロントの仕様に沿って正規化する (iconExtractService.ts 相当)
  ここではアイコン作成に留めて、正規化はフロントで行った方がいいが、今さらその仕様にするのも面倒なので、ここでやる
  正規化の仕様が変わったらこっちも変える必要がある"""
  img_np = np.array(image)

  # グレースケール化
  gray = cv2.cvtColor(img_np, cv2.COLOR_RGBA2GRAY)

  # 二値化（threshold～255 を黒、それ以外を白にする）
  # iconExtractService.ts: cv.threshold(gray, binary, 200, 255, cv.THRESH_BINARY_INV)
  _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

  # 輪郭検出
  # iconExtractService.ts: cv.findContours(binary, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
  contours, _ = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

  # 最大の輪郭のバウンディングボックスを取得する
  # trial では1アイコンのみなので、アイコン条件チェック（縦横比・サイズ）は省略
  if len(contours) == 0:
    raise Exception('No contours found')

  largest = max(contours, key=cv2.contourArea)
  rx, ry, rw, rh = cv2.boundingRect(largest)

  # アイコンの上下左右の無駄な領域を切り取る
  # iconExtractService.ts:
  #   x: rect.x + rect.width * 0.15
  #   y: rect.y + rect.height * 0.06
  #   width: rect.width * 0.70
  #   height: rect.height * 0.88
  crop_x = int(rx + rw * 0.15)
  crop_y = int(ry + rh * 0.06)
  crop_w = int(rw * 0.70)
  crop_h = int(rh * 0.88)

  # 画像境界を超えないようにクランプ
  h, w = img_np.shape[:2]
  crop_x2 = min(crop_x + crop_w, w)
  crop_y2 = min(crop_y + crop_h, h)

  cropped = img_np[crop_y:crop_y2, crop_x:crop_x2]

  return cropped