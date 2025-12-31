#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (VPS一本化・クリーンビルド対応版)
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

# 2. 引数の解析
TARGET=""
NO_CACHE=""
CLEAN_ALL=false
SERVICES=""

for arg in "$@"; do
    case $arg in
        "home"|"work"|"prod") TARGET=$arg ;;
        "stg") 
            echo "❌ エラー: ステージング(stg)環境は廃止されました。prod を使用してください。"
            exit 1 
            ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--clean") CLEAN_ALL=true ;;
        "--help"|"-h") 
            echo "Usage: ./rebuild.sh [home|work|prod] [service_name] [--no-cache] [--clean]"
            exit 0 
            ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

# ---------------------------------------------------------
# 🚨 3. ターゲット自動決定 & 安全装置
# ---------------------------------------------------------
if [ "$IS_VPS" = true ]; then
    # VPSなら、何が何でも prod 
    if [ -z "$TARGET" ] || [ "$TARGET" != "prod" ]; then
        echo "🌐 VPS環境を検知しました。自動的に 'prod' 設定を適用します。"
        TARGET="prod"
    fi
else
    # ローカルPCの場合
    if [ "$TARGET" == "prod" ]; then
        echo "⚠️  ローカルPCで 'prod' は実行できません。安全のため 'home' に切り替えます。"
        TARGET="home"
    fi
    # 未指定ならディレクトリ名から判定
    if [ -z "$TARGET" ]; then
        if [[ "$SCRIPT_DIR" == *"/mnt/e/"* ]]; then
            TARGET="work"
        else
            TARGET="home"
        fi
    fi
fi

# ---------------------------------------------------------
# 4. 設定ファイルのパス決定
# ---------------------------------------------------------
# 優先順位1: スクリプトと同じ階層の docker-compose.[target].yml
if [ -f "$SCRIPT_DIR/docker-compose.$TARGET.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.$TARGET.yml"
# 優先順位2: 特定の絶対パス（念のため残す）
else
    case $TARGET in
        "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.work.yml" ;;
        "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
        *)      COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml" ;;
    esac
fi

# 最終チェック
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# ---------------------------------------------------------
# 5. 実行セクション
# ---------------------------------------------------------
cd "$SCRIPT_DIR"
echo "---------------------------------------"
echo "🎯 実行環境   : $TARGET"
echo "📄 設定ファイル : $COMPOSE_FILE"
echo "🛠️  対象サービス : ${SERVICES:-全サービス}"
[ "$CLEAN_ALL" = true ] && echo "🧹 モード     : FULL CLEAN (全消去後に再構築)"
echo "---------------------------------------"

# ステップ1: 停止とクリーンアップ
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [1/4] 強制クリーンアップ開始..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --volumes --remove-orphans
    echo "🧹 ビルドキャッシュを破棄..."
    docker builder prune -af
else
    echo "🚀 [1/4] 既存コンテナを停止..."
    # $SERVICES が空なら全停止、あれば特定サービスのみ
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop $SERVICES
fi

# ステップ2: システム最適化
if [ -n "$NO_CACHE" ] || [ "$CLEAN_ALL" = true ]; then
    echo "🧹 [2/4] 未使用イメージを削除..."
    docker system prune -f
else
    echo "⏭️  [2/4] キャッシュを利用して高速ビルドします。"
fi

# ステップ3: ビルド
echo "🛠️  [3/4] Dockerビルド実行..."
FINAL_NO_CACHE=$NO_CACHE
[ "$CLEAN_ALL" = true ] && FINAL_NO_CACHE="--no-cache"

docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build $FINAL_NO_CACHE $SERVICES

# ステップ4: 起動
echo "✨ [4/4] コンテナ起動..."
# --build を付けることで、ビルドした最新イメージを確実に反映させます
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build --remove-orphans $SERVICES

echo "---------------------------------------"
echo "✅ 再構築が完了しました！"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps $SERVICES