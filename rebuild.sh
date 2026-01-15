#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (安全・完全版 + サービス一括指定対応)
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
RAW_SERVICES=""

# ---------------------------------------------------------
# 🚨 3. 引数の解析 & ヘルプ表示
# ---------------------------------------------------------
show_help() {
    echo "================================================================"
    echo "🛠  SHIN-VPS REBUILD SCRIPT HELP"
    echo "================================================================"
    echo "Usage: ./rebuild.sh [TARGET] [SERVICE_KEYWORD...] [OPTIONS]"
    echo ""
    echo "TARGET (自動判定されます):"
    echo "  home           家環境 (Local)"
    echo "  work           仕事環境 (WSL/mnt/e/)"
    echo "  prod           本番環境 (VPS)"
    echo ""
    echo "SERVICE_KEYWORDS (ショートカット対応):"
    echo "  bicstation   -> next-bicstation-v2"
    echo "  tiper        -> next-tiper-v2"
    echo "  saving       -> next-bic-saving-v2"
    echo "  avflash      -> next-avflash-v2"
    echo "  (その他、docker-compose.yml内のサービス名を直接指定可能)"
    echo ""
    echo "OPTIONS:"
    echo "  --clean        コンテナとイメージを削除 (ボリュームは保持)"
    echo "  --clean-all    ボリュームを含む全てを強制削除 (危険)"
    echo "  --no-cache     キャッシュを使わずにビルド"
    echo "  -h, --help     このヘルプを表示"
    echo ""
    echo "EXAMPLES:"
    echo "  ./rebuild.sh bicstation tiper         # Next2つを高速再構築"
    echo "  ./rebuild.sh prod saving --no-cache   # 本番のsavingをクリーンビルド"
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
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のエイリアス変換ロジック
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "bicstation") SERVICES="$SERVICES next-bicstation-v2" ;;
        "tiper")       SERVICES="$SERVICES next-tiper-v2" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v2" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v2" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done
# 重複を削除
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

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
    # 指定されたサービスのみを停止
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
# --buildを付けているので、個別指定時はそのサービスだけが最短で起動します
docker compose -f "$COMPOSE_FILE" $P_OPT up -d --build --remove-orphans $SERVICES

# =========================================================
# ✅ 最終ステータス表示
# =========================================================
echo ""
echo "---------------------------------------"
echo "🎉 再構築が完了しました！"
echo "📊 現在のコンテナ稼働状況:"
echo "---------------------------------------"
docker compose -f "$COMPOSE_FILE" $P_OPT ps ${SERVICES}

echo ""
echo "🚀 全システム稼働状況 (docker ps):"
# サービス名からプレフィックスを除去してgrepしやすく調整
SERVICE_PATTERN=$(echo $SERVICES | sed 's/ /|/g')
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "Name|$PROJECT_NAME|$SERVICE_PATTERN"