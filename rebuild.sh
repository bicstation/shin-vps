#!/bin/bash

# ==============================================================================
# 🛠️ SHIN-VPS 高機能再構築スクリプト
# ==============================================================================

# 1. 実行環境の自動判定
if [ -d "/mnt/e/shin-vps" ]; then
    DEFAULT_ENV="work"
elif [ -d "/mnt/c/dev/SHIN-VPS" ]; then
    DEFAULT_ENV="home"
else
    DEFAULT_ENV="vps"
fi

# 2. ターゲットに応じて設定ファイルを決定（サービス名取得に必要）
TARGET_ENV=${1:-$DEFAULT_ENV} # 第1引数が環境名でなければ後で調整
case $TARGET_ENV in
  "work") COMPOSE_FILE="/mnt/e/shin-vps/docker-compose.yml" ;;
  "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
  "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
  "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
  *)      COMPOSE_FILE=$( [ -d "/mnt/e/shin-vps" ] && echo "/mnt/e/shin-vps/docker-compose.yml" || echo "/mnt/c/dev/SHIN-VPS/docker-compose.yml" ) ;;
esac

# 3. 利用可能なサービス名を取得 (docker-compose.yml から自動抽出)
AVAILABLE_SERVICES=$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null | xargs)

# 4. 使い方（ヘルプ）の表示関数
show_usage() {
    echo "📖 【 使い方 】"
    echo "  ./rebuild.sh [環境名] [サービス名] [オプション]"
    echo ""
    echo "💡 環境名: home, work, stg, prod (省略時は $DEFAULT_ENV)"
    echo "💡 オプション: --no-cache (クリーンビルド)"
    echo ""
    echo "📦 指定可能なサービス名 (個別ビルド用):"
    echo "  $AVAILABLE_SERVICES" | fold -s -w 80 | sed 's/^/  /'
    echo ""
    echo "📝 実行例:"
    echo "  ./rebuild.sh next-tiper-v2           # 特定のサービスのみ更新"
    echo "  ./rebuild.sh stg django-v2 --no-cache # STG環境でDjangoをクリーンビルド"
    echo "---------------------------------------"
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

# 初期表示
show_usage

echo "🎯 Target: $TARGET"
echo "🛠️ Execution: ${SERVICES:-全サービス} を再構築します"
echo "---------------------------------------"

# 6. 実行セクション
echo "🚀 [1/4] 停止中..."
docker compose -f "$COMPOSE_FILE" stop $SERVICES

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] キャッシュ削除中..."
    docker system prune -f
else
    echo "⏭️ [2/4] キャッシュを利用します。"
fi

echo "🛠️ [3/4] ビルド中... ${NO_CACHE:-高速モード}"
docker compose -f "$COMPOSE_FILE" build $NO_CACHE $SERVICES

echo "✨ [4/4] 起動中..."
docker compose -f "$COMPOSE_FILE" up -d $SERVICES

echo "✅ すべての工程が完了しました！"
echo "---------------------------------------"
docker compose -f "$COMPOSE_FILE" ps $SERVICES