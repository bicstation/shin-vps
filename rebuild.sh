#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (環境自動判別 & 安全ガード機能付き)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="shin-vps"
CURRENT_HOSTNAME=$(hostname)

# 💡 VPSかどうかの判定ロジック
# ホスト名に 'x162-43' が含まれるか、ユーザー名が VPS 標準の 'maya' である場合に VPS とみなす
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* || "$USER" == "maya" ]]; then
    IS_VPS=true
else
    IS_VPS=false
fi

# 2. パスに基づいたデフォルト環境の判定 (home / work)
if [[ "$SCRIPT_DIR" == *"/mnt/e/"* ]]; then
    DEFAULT_ENV="work"
elif [[ "$SCRIPT_DIR" == *"/mnt/c/"* ]]; then
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
        "--help"|"-h") 
            echo "Usage: ./rebuild.sh [home|work|stg|prod] [service_name] [--no-cache]"
            exit 0 
            ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

# ---------------------------------------------------------
# 🚨 4. 安全装置 (Environment Guard)
# ---------------------------------------------------------
echo "🔍 実行環境をチェックしています... (Host: $CURRENT_HOSTNAME)"

if [ "$IS_VPS" = true ]; then
    # 【VPS環境の場合】stg か prod 指定が必須
    if [[ "$TARGET" != "stg" && "$TARGET" != "prod" ]]; then
        echo "❌ エラー: VPS上では 'stg' または 'prod' を明示的に指定してください。"
        echo "   例: ./rebuild.sh stg"
        exit 1
    fi
else
    # 【ローカルPC環境の場合】stg/prod を指定しても home/work に強制変換
    if [[ "$TARGET" == "stg" || "$TARGET" == "prod" ]]; then
        echo "⚠️  警告: ローカルPCで '$TARGET' が指定されました。"
        echo "   安全のため、ローカル用設定 (docker-compose.yml) を使用します。"
        TARGET=$DEFAULT_ENV
    fi
fi
# ---------------------------------------------------------

# 5. 設定ファイルのパスを決定 (カレントディレクトリを最優先)
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
    # stg/prod の場合は専用ファイルがあればそれを使う
    [[ "$TARGET" == "stg" && -f "$SCRIPT_DIR/docker-compose.stg.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stg.yml"
    [[ "$TARGET" == "prod" && -f "$SCRIPT_DIR/docker-compose.prod.yml" ]] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
else
    # ファイルが見つからない場合のフォールバックパス
    case $TARGET in
        "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.yml" ;;
        "home") COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.yml" ;;
        "stg")  COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml" ;;
        "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
    esac
fi

# 指定された設定ファイルが存在するか最終確認
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# 6. 実行セクション
cd "$SCRIPT_DIR"

echo "---------------------------------------"
echo "🎯 Target Env : $TARGET"
echo "📂 Script Dir : $SCRIPT_DIR"
echo "📄 Config File: $COMPOSE_FILE"
echo "🛠️  Services   : ${SERVICES:-全サービス}"
echo "---------------------------------------"

echo "🚀 [1/4] 既存コンテナの停止..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES

if [ -n "$NO_CACHE" ]; then
    echo "🧹 [2/4] 未使用イメージのクリーンアップ (--no-cache 有効)..."
    docker system prune -f
else
    echo "⏭️  [2/4] キャッシュを利用してビルドします。"
fi

echo "🛠️  [3/4] ビルド開始..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $NO_CACHE $SERVICES

echo "✨ [4/4] コンテナの作成と起動..."
# --build を付けることで、イメージが更新されている場合に確実に反映させます
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build $SERVICES

echo "---------------------------------------"
echo "✅ 再構築が完了しました！"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES