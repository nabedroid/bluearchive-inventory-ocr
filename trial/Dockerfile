FROM python:3.12-slim

# bash をインストール
RUN apt-get update && apt-get install -y bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# opencv-python は headless （GUIなし）を使う
# 通常の opencv-python を使うなら前提となるライブラリをインストールする必要がある
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir opencv-python-headless UnityPy
