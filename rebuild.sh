#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (判定ロジック修正版)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="shin-vps"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPSかどうかの判定ロジック (より確実に)
# ホスト名に 'x162-43' が含まれる、または環境が Linux かつユーザー名が 'maya' (VPS側) の場合
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
    # パスで判別できない場合は IS_VPS の結果に従う
    if [ "$IS_VPS" = true ]; then
        DEFAULT_ENV="vps-manual-required"
    else
        DEFAULT_ENV="home"
    fi
fi

# 3. 引数の解析
TARGET=""
NO_CACHE=""
SERVICES=""

for arg in "$@"; do
    case $arg in
        "home"|"work"|"stg"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--help"|"-h") 
            echo "Usage: ./rebuild.sh [home|work|stg|prod] [service_name] [--no-cache]"
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
    # 【VPS環境】stg か prod 指定が必須
    if [[ "$TARGET" != "stg" && "$TARGET" != "prod" ]]; then
        echo "❌ エラー: VPS上では 'stg' または 'prod' を指定してください。"
        exit 1
    fi
else
    # 【ローカルPC環境】
    if [[ "$TARGET" == "stg" || "$TARGET" == "prod" ]]; then
        echo "⚠️  ローカルPCのため、本番設定を回避して 'home' 設定を使用します。"
        TARGET="home"
    fi
    # デフォルト値が未設定なら home にする
    if [[ "$TARGET" == "vps-manual-required" || -z "$TARGET" ]]; then
        TARGET="home"
    fi
fi
# ---------------------------------------------------------

# 5. 設定ファイルのパス決定
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
    [[ "$TARGET" == "stg" && -f "$SCRIPT_DIR/docker-compose.stg.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stg.yml"
    [[ "$TARGET" == "prod" && -f "$SCRIPT_DIR/docker-compose.prod.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
else
    case $TARGET in
        "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.yml" ;;
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

# 6. 実行セクション
cd "$SCRIPT_DIR"
echo "---------------------------------------"
echo "🎯 Target Env : $TARGET"
echo "📄 Config File: $COMPOSE_FILE"
echo "🛠️  Services   : ${SERVICES:-全サービス}"
echo "---------------------------------------"

echo "🚀 [1/4] 既存コンテナの停止..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] 未使用イメージのクリーンアップ..."
    docker system prune -f
else
    echo "⏭️  [2/4] キャッシュを利用してビルドします。"
fi

echo "🛠️  [3/4] ビルド開始..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $NO_CACHE $SERVICES

echo "✨ [4/4] コンテナ起動..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build $SERVICES

echo "---------------------------------------"
echo "✅ 再構築完了！"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES