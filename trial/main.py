"""
アセットバンドルから装備マスターを作成する
"""
import base64
import cv2
import glob
import json
import os
from typing import Iterator

import UnityPy
from PIL import Image

import utils
from equip_master import EQUIP_MASTER

def iter_equipment_icons(base_path: str) -> Iterator[tuple[dict[str, dict], Image.Image]]:
  """装備アイコンを読み込む"""
  # Texture名からアイテムマスタを検索できるようにする
  equip_master = {item['filename']: item for item in EQUIP_MASTER}
  # 装備Textureが含まれていそうなアセットを読み込む
  env = UnityPy.Environment()
  env.load_files(glob.glob(os.path.join(base_path, 'uis-01_common-02_equipment-_mxload-textures-*_assets_all_*.bundle')))
  for obj in env.objects:
    if obj.type.name != 'Texture2D': continue
    texture = obj.read()
    # マスターに未登録の Texture はスキップ
    if equip_master.get(texture.m_Name) is None: continue
    yield equip_master[texture.m_Name], texture.image


if __name__ == "__main__":
  base_path = "BlueArchive_JP/BlueArchive_Data/StreamingAssets/AssetBundles"
  output_path = "output"
  output_equip_master = []
  os.makedirs(output_path, exist_ok=True)
  bgs = utils.load_bgs(base_path)
  for i, (item, item_image) in enumerate(iter_equipment_icons(base_path)):
    icon = utils.composite_icon(bgs[item['bg']], item_image)
    # フロントと同様に画像を変換、ここから ndarray
    icon_np = utils.normalize_icon(icon)
    icon_np = cv2.cvtColor(icon_np, cv2.COLOR_RGBA2BGRA)
    # ndarray を base64 に変換
    # 画像をメモリ内でエンコード
    _, buffer = cv2.imencode(f'.png', icon_np)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    # DataURLの形式に整える
    output_equip_master.append({
      'id': i + 1,
      'name': item['name'],
      'iconDataUrl': f"data:image/png;base64,{b64_str}",
      'features': None,
      'colorHash': None,
    })
    # 特に使わないけど画像も出力しておく
    # 出力が不要ならコメントアウトすること
    filepath = os.path.join(output_path, f"{item['filename']}.png")
    cv2.imwrite(filepath, icon_np)
    print(f"saved {filepath}")
  # item_master を json で出力
  with open(os.path.join(output_path, 'equip-master.json'), 'w', encoding='utf-8') as f:
    json.dump(output_equip_master, f, ensure_ascii=False, indent=2)
