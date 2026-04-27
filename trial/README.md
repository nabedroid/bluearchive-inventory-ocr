# 概要
アセットバンドルからフロントで使用するアイテムマスターを作成する。

# 使用方法
1. trial/.env.sample を .env に修正
2. .env に BlueArchive_JP へのパスを設定
3. コンテナ起動
```bash
docker compose run --rm trial bash
```
4. 実行
```bash
python main.py
```

3. trial/output/item-master.json が出力される
4. manager で item-master.json を読み込んで、特徴量を再計算

# 注意
1. コンテナ内の /app/BlueArchive_JP は変更しない
   ホストのインストールフォルダをボリュームマウントしているため、
   コンテナ内を更新するとホストのインストールフォルダも更新される。
2. イメージが不要になったら
   下記のコマンドで削除する
   ```bash
   docker rmi bluearchive-inventory-ocr-trial
   ```
