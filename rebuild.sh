#!/bin/bash

# ==============================================================================
# 🛠️ SHIN-VPS 高機能再構築スクリプト (Traefik 連携最適化版)
# ==============================================================================

# プロジェクト名を "shin-vps" に固定（Traefikのネットワーク設定と合わせるため必要なもの）
PROJECT_NAME="shin-vps"

# 1. 実行環境の自動判定
if [ -d "/mnt/e/shin-ssg" ]; then
    DEFAULT_ENV="work"
elif [ -d "/mnt/c/dev/SHIN-VPS" ]; then
    DEFAULT_ENV="home"
else
    DEFAULT_ENV="vps"
fi

# 2. ターゲットに応じて設定ファイルを決定
TARGET_ENV=${1:-$DEFAULT_ENV}
case $TARGET_ENV in
  "work") COMPOSE_FILE="/mnt/e/shin-ssg/docker-compose.yml" ;;
  "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
  "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
  "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
  *)      COMPOSE_FILE=$( [ -d "/mnt/e/shin-ssg" ] && echo "/mnt/e/shin-ssg/docker-compose.yml" || echo "/mnt/c/dev/SHIN-VPS/docker-compose.yml" ) ;;
esac

# 3. 利用可能なサービス名を取得
AVAILABLE_SERVICES=$(docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" config --services 2>/dev/null | xargs)

# 4. 使い方（ヘルプ）の表示関数
show_usage() {
    echo "📖 【 使い方 】"
    echo "  ./rebuild.sh [環境名] [サービス名] [オプション]"
    echo ""
    echo "💡 プロジェクト名: $PROJECT_NAME (固定)"
    echo "💡 環境名: home, work, stg, prod (省略時は $DEFAULT_ENV)"
    echo "💡 オプション: --no-cache (クリーンビルド)"
    echo ""
    echo "📦 指定可能なサービス名:"
    echo "  $AVAILABLE_SERVICES" | fold -s -w 80 | sed 's/^/  /'
    echo ""
}

# 5. 引数の解析
TARGET=$DEFAULT_ENV
NO_CACHE=""
SERVICES=""

for arg in "$@"
do
    case $arg in
        "home"|"work"|"stg"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--help"|"-h") show_usage; exit 0 ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

show_usage

echo "🎯 Target Env: $TARGET"
echo "📂 Config: $COMPOSE_FILE"
echo "🛠️ Execution: ${SERVICES:-全サービス} を再構築します"
echo "---------------------------------------"

# 6. 実行セクション (全て -p $PROJECT_NAME を付与)
echo "🚀 [1/4] 停止中..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] キャッシュ削除中..."
    docker system prune -f
else
    echo "⏭️ [2/4] キャッシュを利用します。"
fi

echo "🛠️ [3/4] ビルド中... ${NO_CACHE:-高速モード}"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $NO_CACHE $SERVICES

echo "✨ [4/4] 起動中..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build $SERVICES

echo "✅ すべての工程が完了しました！"
echo "---------------------------------------"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES