#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (安全・完全版 + ステータス確認)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="" 
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPS判定ロジック
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
else
    IS_VPS=false
fi

# 2. 変数初期化
TARGET=""
NO_CACHE=""
CLEAN=false
CLEAN_ALL=false
SERVICES=""

# ---------------------------------------------------------
# 🚨 3. 引数の解析 & ヘルプ表示
# ---------------------------------------------------------
show_help() {
    echo "================================================================"
    echo "🛠  SHIN-VPS REBUILD SCRIPT HELP"
    echo "================================================================"
    echo "Usage: ./rebuild.sh [TARGET] [SERVICE...] [OPTIONS]"
    echo ""
    echo "TARGET (自動判定されます):"
    echo "  home          家環境 (Local)"
    echo "  work          仕事環境 (WSL/mnt/e/)"
    echo "  prod          本番環境 (VPS)"
    echo ""
    echo "OPTIONS:"
    echo "  --clean       コンテナとイメージを削除 (ボリュームは保持: DBデータは安全)"
    echo "  --clean-all   ボリュームを含む全てを強制削除 (DBデータも消えます：危険)"
    echo "  --no-cache    キャッシュを使わずにビルド"
    echo "  -h, --help    このヘルプを表示"
    echo ""
    echo "FEATURES:"
    echo "  - 実行後に自動的に 'docker ps' で稼働状況を表示します"
    echo "  - ビルド時に '--pull' を行い、常に最新のベースイメージを使用します"
    echo ""
    echo "EXAMPLES:"
    echo "  ./rebuild.sh prod frontend --no-cache  # 本番のfrontendを最新状態で更新"
    echo "  ./rebuild.sh --clean                   # データを守りつつリフレッシュ"
    echo "================================================================"
}

for arg in "$@"; do
    case $arg in
        "home"|"work"|"prod") TARGET=$arg ;;
        "stg") 
            echo "❌ エラー: ステージング(stg)環境は廃止されました。"
            exit 1 
            ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--clean") CLEAN=true ;;
        "--clean-all") CLEAN_ALL=true ;;
        "--help"|"-h") 
            show_help
            exit 0 
            ;;
        *) SERVICES="$SERVICES $arg" ;;
    esac
done

# ---------------------------------------------------------
# 4. ターゲット自動決定
# ---------------------------------------------------------
if [ "$IS_VPS" = true ]; then
    if [ -z "$TARGET" ] || [ "$TARGET" != "prod" ]; then
        echo "🌐 VPS環境を検知しました。'prod' を適用します。"
        TARGET="prod"
    fi
else
    if [ "$TARGET" == "prod" ]; then
        echo "⚠️  ローカルで 'prod' は実行不可。'home' に切り替えます。"
        TARGET="home"
    fi
    if [ -z "$TARGET" ]; then
        if [[ "$SCRIPT_DIR" == *"/mnt/e/"* ]]; then TARGET="work"; else TARGET="home"; fi
    fi
fi

# 5. 設定ファイルのパス決定
case $TARGET in
    "work") COMPOSE_FILE="/mnt/e/dev/shin-vps/docker-compose.work.yml" ;;
    "prod") COMPOSE_FILE="/home/maya/shin-vps/docker-compose.prod.yml" ;;
    *)      COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml" ;;
esac

# 独自ファイルがある場合は優先
if [ -f "$SCRIPT_DIR/docker-compose.$TARGET.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.$TARGET.yml"
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# =========================================================
# 🔍 実行前情報表示
# =========================================================
echo "======================================="
echo "📂 DIR      : $(pwd)"
echo "📄 FILE     : $(basename "$COMPOSE_FILE")"
echo "📍 TARGET   : $TARGET"
echo "⚙️  SERVICES : ${SERVICES:-全サービス}"
echo "======================================="

# ---------------------------------------------------------
# ✨ 外部ネットワークの確保
# ---------------------------------------------------------
EXTERNAL_NET="shin-vps_shared-proxy"
if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    echo "💡 ネットワーク '$EXTERNAL_NET' を作成中..."
    docker network create "$EXTERNAL_NET"
fi

# ---------------------------------------------------------
# 6. 実行セクション
# ---------------------------------------------------------
cd "$SCRIPT_DIR"
P_OPT=""
[ -n "$PROJECT_NAME" ] && P_OPT="-p $PROJECT_NAME"

# ステップ1: 停止処理
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [1/4] 完全クリーンアップ開始 (ボリュームも削除)..."
    docker compose -f "$COMPOSE_FILE" $P_OPT down --volumes --remove-orphans
    docker builder prune -af
elif [ "$CLEAN" = true ]; then
    echo "🧹 [1/4] クリーンアップ開始 (ボリュームは維持)..."
    docker compose -f "$COMPOSE_FILE" $P_OPT down --remove-orphans
    docker image prune -f
else
    echo "🚀 [1/4] コンテナを停止中..."
    docker compose -f "$COMPOSE_FILE" $P_OPT stop $SERVICES
fi

# ステップ2: システム最適化
if [ -n "$NO_CACHE" ] || [ "$CLEAN" = true ] || [ "$CLEAN_ALL" = true ]; then
    echo "🗑️  [2/4] 未使用のDockerリソースを削除..."
    docker system prune -f
else
    echo "⏭️  [2/4] システム最適化をスキップします。"
fi

# ステップ3: ビルド
echo "🛠️  [3/4] Dockerビルド実行 (最新ベースイメージを取得)..."
FINAL_NO_CACHE=$NO_CACHE
[ "$CLEAN_ALL" = true ] && FINAL_NO_CACHE="--no-cache"

docker compose -f "$COMPOSE_FILE" $P_OPT build --pull $FINAL_NO_CACHE $SERVICES

# ステップ4: 起動
echo "✨ [4/4] コンテナ起動..."
docker compose -f "$COMPOSE_FILE" $P_OPT up -d --build --remove-orphans $SERVICES

# =========================================================
# ✅ 最終ステータス表示
# =========================================================
echo ""
echo "---------------------------------------"
echo "🎉 再構築が完了しました！"
echo "📊 現在のコンテナ稼働状況:"
echo "---------------------------------------"
# プロジェクトに関連するコンテナのみを表示
docker compose -f "$COMPOSE_FILE" $P_OPT ps ${SERVICES}

echo ""
echo "🚀 全システム稼働状況 (docker ps):"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "Name|$PROJECT_NAME|$(echo $SERVICES | sed 's/ /|/g')"