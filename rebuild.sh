#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (フル・クリーンビルド対応版)
# ==============================================================================
# 【使い方 / Usage】
#  1. 通常の再構築 (環境を自動判別して再起動):
#     ./rebuild.sh
#
#  2. 特定の環境を指定して再構築:
#     ./rebuild.sh work  (職場の Eドライブ環境)
#     ./rebuild.sh home  (自宅の Cドライブ環境)
#
#  3. まっさらな状態からやり直す (クリーンビルド):
#     ./rebuild.sh --clean
#     ※ 既存コンテナ、匿名ボリューム、ビルドキャッシュを全削除してからビルドします。
#
#  4. キャッシュを使わずにビルドのみ実行:
#     ./rebuild.sh --no-cache
#
#  5. 特定のサービスのみ再構築:
#     ./rebuild.sh wordpress-v2
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="shin-vps"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPSかどうかの判定ロジック
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
else
    IS_VPS=false
fi

# 2. パスに基づいたデフォルト環境の判定
if [[ "$SCRIPT_DIR" == *"/mnt/e/"* ]]; then
    DEFAULT_ENV="work"
elif [[ "$SCRIPT_DIR" == *"/mnt/c/"* ]]; then
    DEFAULT_ENV="home"
else
    if [ "$IS_VPS" = true ]; then
        DEFAULT_ENV="vps-manual-required"
    else
        DEFAULT_ENV="home"
    fi
fi

# 3. 引数の解析
TARGET=""
NO_CACHE=""
CLEAN_ALL=false
SERVICES=""

for arg in "$@"; do
    case $arg in
        "home"|"work"|"stg"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--clean") CLEAN_ALL=true ;;
        "--help"|"-h") 
            echo "Usage: ./rebuild.sh [home|work|stg|prod] [service_name] [--no-cache] [--clean]"
            echo ""
            echo "Options:"
            echo "  --no-cache : Dockerのビルドキャッシュを使用せずにビルドします。"
            echo "  --clean    : コンテナ、ネットワーク、匿名ボリューム、ビルドキャッシュを完全に削除してから再構築します。"
            exit 0 
            ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

# 引数がない場合はデフォルトを適用
[ -z "$TARGET" ] && TARGET=$DEFAULT_ENV

# ---------------------------------------------------------
# 🚨 4. 安全装置 (Environment Guard)
# ---------------------------------------------------------
echo "🔍 実行環境チェック: Host=$CURRENT_HOSTNAME, User=$CURRENT_USER, Detected_Target=$TARGET"

if [ "$IS_VPS" = true ]; then
    if [[ "$TARGET" != "stg" && "$TARGET" != "prod" ]]; then
        echo "❌ エラー: VPS上では 'stg' または 'prod' を指定してください。"
        exit 1
    fi
else
    if [[ "$TARGET" == "stg" || "$TARGET" == "prod" ]]; then
        echo "⚠️  ローカルPCのため、安全のため 'home' 設定へリダイレクトします。"
        TARGET="home"
    fi
    if [[ "$TARGET" == "vps-manual-required" || -z "$TARGET" ]]; then
        TARGET="home"
    fi
fi

# ---------------------------------------------------------
# 5. 設定ファイルのパス決定
# ---------------------------------------------------------
if [ -f "$SCRIPT_DIR/docker-compose.$TARGET.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.$TARGET.yml"
elif [ -f "$SCRIPT_DIR/docker-compose.yml" ] && [ "$TARGET" != "work" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
else
    case $TARGET in
        "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.work.yml" ;;
        "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
        "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
        "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
    esac
fi

# 最終チェック
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# ---------------------------------------------------------
# 6. 実行セクション
# ---------------------------------------------------------
cd "$SCRIPT_DIR"
echo "---------------------------------------"
echo "🎯 Target Env : $TARGET"
echo "📄 Config File: $COMPOSE_FILE"
echo "🛠️  Services   : ${SERVICES:-全サービス}"
[ "$CLEAN_ALL" = true ] && echo "🧹 Mode       : FULL CLEAN (更地にしてからビルド)"
echo "---------------------------------------"

# ステップ1: 停止とクリーンアップ
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [1/4] 強制クリーンアップ中 (Down & Remove Volumes)..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --volumes --remove-orphans
    echo "🧹 ビルドキャッシュの物理削除..."
    docker builder prune -af
else
    echo "🚀 [1/4] 既存コンテナの停止..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES
fi

# ステップ2: システム全体のクリーンアップ
if [ -n "$NO_CACHE" ] || [ "$CLEAN_ALL" = true ]; then
    echo "🧹 [2/4] 未使用イメージのクリーンアップ..."
    docker system prune -f
else
    echo "⏭️  [2/4] キャッシュを利用してビルドを開始します。"
fi

# ステップ3: ビルド
echo "🛠️  [3/4] ビルド開始..."
FINAL_NO_CACHE=$NO_CACHE
[ "$CLEAN_ALL" = true ] && FINAL_NO_CACHE="--no-cache"

docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $FINAL_NO_CACHE $SERVICES

# ステップ4: 起動
echo "✨ [4/4] コンテナ起動..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build $SERVICES

echo "---------------------------------------"
echo "✅ 再構築完了！"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES