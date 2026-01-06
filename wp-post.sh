#!/bin/bash

# =====================================================================
# 🚀 WordPress 自動投稿用ラッパーシェル
# 使い方: ./wp-post.sh [post|bicstation] "タイトル" "本文内容"
# =====================================================================

TYPE=$1    # post または bicstation
TITLE=$2
CONTENT=$3

# 引数が足りない場合のチェック
if [ -z "$CONTENT" ]; then
    echo "使用法: $0 [タイプ] \"タイトル\" \"本文\""
    echo "例: $0 bicstation \"シェルテスト\" \"これはテストです\""
    exit 1
fi

# Docker経由でPythonスクリプトを実行
# python -c を使って、その場でロジックを動かします
docker exec -t django-v2 python3 -c "
import requests
from requests.auth import HTTPBasicAuth
import sys

# 基本設定
USER = 'bicstation'
APP_PASSWORD = '9re0 t3de WCe1 u1IL MudX 31IY'
BASE_URL = 'https://blog.tiper.live/wp-json/wp/v2'

post_type = '$TYPE'
title = '$TITLE'
content = '$CONTENT'

def post():
    url = f'{BASE_URL}/{post_type}'
    payload = {
        'title': title,
        'content': content,
        'status': 'publish'
    }
    res = requests.post(url, json=payload, auth=HTTPBasicAuth(USER, APP_PASSWORD))
    if res.status_code == 201:
        print(f'投稿成功! ID: {res.json().get(\"id\")} (タイプ: {post_type})')
    else:
        print(f'エラー: {res.status_code}')
        print(res.text)

post()
"