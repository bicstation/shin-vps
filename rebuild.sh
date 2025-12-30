#!/bin/bash

# ==============================================================================
# 🛠️ SHIN-VPS 高機能再構築スクリプト (パス自動判定・Traefik 連携版)
# ==============================================================================

# 1. 実行ディレクトリの取得 (スクリプトの場所を絶対パスで保持)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="shin-vps"

# 2. 現在の場所に基づいてデフォルト環境を判定
if [[ "$SCRIPT_DIR" == *"/mnt/e/dev/shin-vps"* || "$SCRIPT_DIR" == *"/mnt/e/shin-vps"* ]]; then
    DEFAULT_ENV="work"
elif [[ "$SCRIPT_DIR" == *"/mnt/c/dev/SHIN-VPS"* ]]; then
    DEFAULT_ENV="home"
else
    DEFAULT_ENV="vps"
fi

# 3. 引数の解析 (環境名、オプション、サービス名)
TARGET=$DEFAULT_ENV
NO_CACHE=""
SERVICES=""

for arg in "$@"; do
    case $arg in
        "home"|"work"|"stg"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--help"|"-h") echo "Usage: ./rebuild.sh [home|work|stg|prod] [service_name] [--no-cache]"; exit 0 ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

# 4. ターゲットに応じて設定ファイルのパスを決定 (現在のディレクトリを最優先)
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    # 今いる場所に compose ファイルがあればそれを使う (これが一番安全)
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
    # stg/prod の場合は専用ファイルがあるか確認
    [[ "$TARGET" == "stg" && -f "$SCRIPT_DIR/docker-compose.stg.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stg.yml"
    [[ "$TARGET" == "prod" && -f "$SCRIPT_DIR/docker-compose.prod.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
else
    # 既存のハードコードパス (フォールバック用)
    case $TARGET in
        "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.yml" ;;
        "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
        "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
        "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
    esac
fi

# 5. docker-compose コマンドの準備
# ※ docker compose は標準でカレントディレクトリの .env を読み込むため、
# 実行前にそのディレクトリへ移動するのが確実
cd "$SCRIPT_DIR"

# サービス一覧の取得 (エラー回避のため config を使用)
AVAILABLE_SERVICES=$(docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" config --services 2>/dev/null | xargs)

echo "---------------------------------------"
echo "🎯 Target Env : $TARGET"
echo "📂 Script Dir : $SCRIPT_DIR"
echo "📄 Config File: $COMPOSE_FILE"
echo "🛠️ Services   : ${SERVICES:-全サービス}"
echo "---------------------------------------"

# 6. 実行セクション
echo "🚀 [1/4] 既存コンテナの停止..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] 未使用イメージのクリーンアップ..."
    docker system prune -f
else
    echo "⏭️ [2/4] キャッシュを利用して高速ビルドします。"
fi

echo "🛠️ [3/4] ビルド開始..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $NO_CACHE $SERVICES

echo "✨ [4/4] コンテナ起動..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build $SERVICES

echo "---------------------------------------"
echo "✅ 再構築が完了しました！"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES