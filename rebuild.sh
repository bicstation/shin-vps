#!/bin/bash

# ==============================================================================
# 🛠️ SHIN-VPS 再構築スクリプト (rebuild.sh)
#
# 【 使い方 】
#   1. 通常ビルド (高速・自動判定):
#      ./rebuild.sh
#
#   2. キャッシュを完全に捨ててクリーンビルド:
#      ./rebuild.sh --no-cache
# ==============================================================================

# 1. 実行環境（PC）の自動判定
if [ -d "/mnt/e/shin-vps" ]; then
    DEFAULT_ENV="work"
elif [ -d "/mnt/c/dev/SHIN-VPS" ]; then
    DEFAULT_ENV="home"
else
    DEFAULT_ENV="vps"
fi

# 2. 引数の解析
TARGET=$DEFAULT_ENV
NO_CACHE=""

for arg in "$@"
do
    case $arg in
        "home"|"work"|"stg"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
    esac
done

# 3. ターゲットに応じて設定ファイルを切り替え
case $TARGET in
  "work") COMPOSE_FILE="/mnt/e/shin-vps/docker-compose.yml" ;;
  "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
  "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
  "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
  *) echo "❌ 判定失敗"; exit 1 ;;
esac

echo "🎯 Target File: $COMPOSE_FILE"

# 4. 実行セクション
echo "---------------------------------------"
echo "🚀 [1/4] コンテナを停止中..."
docker compose -f "$COMPOSE_FILE" down

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] --no-cacheが指定されたため、未使用キャッシュを削除します..."
    docker system prune -f
else
    echo "⏭️ [2/4] キャッシュを利用します。"
fi

echo "🛠️ [3/4] ビルド中... ${NO_CACHE:-高速モード}"
docker compose -f "$COMPOSE_FILE" build $NO_CACHE

echo "✨ [4/4] コンテナを起動中..."
docker compose -f "$COMPOSE_FILE" up -d

echo "✅ すべての工程が完了しました！"
echo "---------------------------------------"
# ここが修正ポイント：確実に変数を繋げて実行
docker compose -f "$COMPOSE_FILE" ps