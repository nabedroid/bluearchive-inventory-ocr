"""
AssetBundleのファイル名とアセット名を一覧表示する
"""
import UnityPy
import os
import glob

if __name__ == "__main__":
  base_path = "BlueArchive_JP/BlueArchive_Data/StreamingAssets/AssetBundles"

  for filepath in glob.iglob(os.path.join(base_path, '*.bundle')):
    filename = os.path.split(filepath)[-1]
    env = UnityPy.load(filepath)
    for asset in env.assets:
      print(filename, asset.name)
