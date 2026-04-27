"""
レアリティごとの背景Textureを使用しているGameObjectを調査する
"""
import os
import UnityPy
import zipfile
import json

def print_game_object(go, hierarchy: int = 0) -> None:
  """GameObjectの情報を表示する
  子オブジェクトも再帰的に表示する
  """
  indent = '  ' * hierarchy * 2
  # 名前
  print(indent + 'name: ', go.m_Name)
  # transform
  transform = go.m_Components[0].read()
  r = transform.m_LocalRotation
  p = transform.m_LocalPosition
  s = transform.m_LocalScale
  print(indent + 'transform: ', f'Rotation({r.x}, {r.y}, {r.z}, {r.w})', f'Position({p.x}, {p.y}, {p.z})', f'Scale({s.x}, {s.y}, {s.z})')
  # コンポーネント
  for i, comp_ptr in enumerate(go.m_Components):
    print(indent + '  ' + f'component[{i}]: ', end='')
    if comp_ptr.type.name == 'MonoBehaviour':
      comp = comp_ptr.read()
      script = comp.m_Script.read()
      if script.m_ClassName.find('Sprite') != -1:
        print(f"MonoBehaviour({script.m_ClassName} / {comp.mSpriteName} {comp.mWidth}x{comp.mHeight} {comp.mPivot})")
      elif script.m_ClassName == 'UITexture':
        m_Name = '?' if comp.mTexture.m_PathID == 0 else comp.mTexture.read().m_Name
        print(f"MonoBehaviour({script.m_ClassName} / {m_Name} {comp.mWidth}x{comp.mHeight} {comp.mPivot})")
      else:
        print(f"MonoBehaviour({script.m_ClassName})")
    else:
      print(comp_ptr.type.name)
  # 子オブジェクト
  for child_ptr in transform.m_Children:
    # 再帰的に子オブジェクトを表示
    print_game_object(child_ptr.read().m_GameObject.read(), hierarchy + 1)

if __name__ == "__main__":
  base_path = "BlueArchive_JP/BlueArchive_Data/StreamingAssets/AssetBundles"
  # 背景Texture の名前
  bg_names = ['Card_Item_Bg_N', 'Card_Item_Bg_R', 'Card_Item_Bg_SR', 'Card_Item_Bg_SSR']
  # *Equip*というオブジェクト名を含むバンドルをすべて読み込み
  bundle_files = ['academy-_mxload-prefabs-2025-07-02_assets_all_445507400.bundle', 'assets-_mx-minigame-cardgame-_mxdependency-textures-2025-07-02_assets_all_417268752.bundle', 'minigame-card-artlevel-_mxload-scenes-2025-07-02_scenes_all_4121932707.bundle', 'minigame-card-effect-_mxload-prefabs-2025-07-02_assets_all_1697159475.bundle', 'minigame-card-image-cards-_mxload-textures-2025-07-02_assets_all_4226695836.bundle', 'minigame-card-prefab-_mxload-prefabs-2025-07-02_assets_all_2260316663.bundle', 'minigame-cardtest-resource-materials-_mxload-materials-2025-07-02_assets_all_1223250708.bundle', 'minigame-cardtest-resource-textures-_mxload-textures-2025-07-02_assets_all_964051358.bundle', 'minigame-cardtest-resource-_mxload-meshes-2025-07-02_assets_all_1507482845.bundle', 'MX_monoscripts_3078210876.bundle', 'prologdepengroup-assets-_mx-addressableasset-ui-_mxprolog-2025-07-02_assets_all_3436275152.bundle', 'prologgroup-assets-_mx-addressableasset-ui-_mxprolog-2025-07-02_assets_all_2928350206.bundle', 'tactic-dropbox-_mxload-prefabs-2025-07-02_assets_all_2529150905.bundle', 'ui-uiassetobject-_mxload-prefabs-2025-07-02_assets_all_3186089555.bundle', 'ui-uiassetobject-_mxload-prefabs-2025-07-30_assets_all_1075468179.bundle', 'ui-uiassetobject-_mxload-prefabs-2025-08-26_assets_all_4146171365.bundle', 'ui-uiassetobject-_mxload-prefabs-2026-01-04_assets_all_2559761135.bundle', 'ui-uicafe-_mxload-prefabs-2025-07-02_assets_all_3031289351.bundle', 'ui-uiinformation-_mxload-prefabs-2025-07-02_assets_all_2731921807.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1035661541.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1068359318.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1218543549.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1225874177.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1244974503.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1255308225.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1269916585.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1303875265.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1343883682.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1379996360.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1519486967.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1525075421.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1539129134.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1542169424.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1551916405.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1602497584.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1719578973.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1760755498.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1802859117.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_1816418792.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_194946476.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2020111326.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2213159294.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2243190761.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2299956157.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_237495731.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_238096071.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2460120799.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2500562784.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2522321157.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2541286791.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2668345278.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2718860158.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_272619278.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2732849053.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2752503144.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_276057440.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2778497601.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2788975930.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2802129945.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2850704927.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2932025930.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2939404739.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_2997931633.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3030263101.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3104715664.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3105358564.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3113539655.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3149115898.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3289747351.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3435376996.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3454735376.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3495818653.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3572881350.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3655359084.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3730938091.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3731922086.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3775192438.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3918883269.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3933986548.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_3948900654.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4050127871.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4059382757.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4114927429.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4116898539.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_412367932.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4170944982.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4182604693.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_4210174224.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_663554955.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_665744823.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_756031951.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_766691595.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_775030651.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_790069498.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_886997615.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_890504167.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_905126927.bundle', 'ui-_mxload-prefabs-2025-07-02_assets_all_9897663.bundle', 'ui-_mxload-prefabs-2025-11-28_assets_all_2341163404.bundle', 'ui-_mxload-prefabs-2026-01-04_assets_all_2225054029.bundle', 'ui-_mxload-prefabs-2026-01-04_assets_all_2635741952.bundle', 'uis-01_common-02_equipment-_mxload-textures-2025-07-02_assets_all_3078770153.bundle', 'uis-01_common-02_equipment-_mxload-textures-2026-03-24_assets_all_1862770784.bundle', 'uis-01_common-03_nonequipment-_mxload-textures-2025-07-02_assets_all_3386203100.bundle', 'uis-01_common-03_nonequipment-_mxload-textures-2026-03-29_assets_all_3590529951.bundle', 'uis-01_common-03_nonequipment-_mxload-textures-2026-04-02_assets_all_3951958583.bundle', 'uis-01_common-23_tutorialfailure-_mxload-textures-2025-07-02_assets_all_1621274237.bundle', 'uis-01_common-26_shopcontent-_mxload-textures-2025-07-02_assets_all_340394284.bundle', 'uis-01_common-26_shopcontent-_mxload-textures-2026-03-27_assets_all_1617012758.bundle', 'uis-01_common-28_information-_mxload-textures-2025-07-02_assets_all_2767537794.bundle', 'uis-01_common-34_minigame-cardgame-2dcards-equipment-_mxload-textures-2025-07-02_assets_all_3340808096.bundle']
  # 何かで必要だったので追加
  bundle_files.append('prologdepengroup-assets-_mx-addressableasset-uis-_mxprolog-2025-07-02_assets_all_3908289339.bundle')
  env = UnityPy.Environment()
  env.load_files([os.path.join(base_path, bundle_file) for bundle_file in bundle_files])

  for obj in env.objects:
    # 装備アイコン全体を管理している GameObject を探す
    if obj.type.name != 'MonoBehaviour': continue
    try:
      mono = obj.read()
      if mono.m_Script.m_PathID == 0: continue
      script = mono.m_Script.read()
      if script.m_ClassName != 'UISprite': continue
      if mono.mSpriteName not in bg_names: continue
      # UISpriteを所持しているGameObject
      go = mono.m_GameObject.read()
      transform = go.m_Components[0].read()

      # 親 GameObject の名前を表示
      if not transform or transform.m_Father.m_PathID == 0: continue
      parent_go = transform.m_Father.read().m_GameObject.read()
      # 更に親
      grand_parent_go = parent_go.m_Components[0].read().m_Father.read().m_GameObject.read()
      # UIUIEquipmentCard の MonoBehaviour を確認する
      if grand_parent_go.m_Name != 'UIEquipmentCard': continue
      # おおもとの GameObject を表示
      print_game_object(grand_parent_go)

    except Exception as e:
      # エラー内容を表示
      print(f"Error: {e}")
      print(e.__traceback__)
      # 終了する必要がないならコメントアウトする
      raise e
