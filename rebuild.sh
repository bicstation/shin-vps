#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築スクリプト (令和・WSL2ネイティブ対応版)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
# $(dirname "$0") を使うことで、どこから実行してもスクリプトのある場所を基準にします
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPS・ローカル環境の判定
# ホスト名やユーザー名から「本番(VPS)」か「開発(Local)」かを自動判別
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
WATCH_MODE=false
RAW_SERVICES=""

# ---------------------------------------------------------
# 🚨 3. ヘルプ表示
# ---------------------------------------------------------
show_help() {
    echo "================================================================"
    echo "🛠  SHIN-VPS REBUILD SCRIPT (Native WSL2 Optimized)"
    echo "================================================================"
    echo "Usage: ./rebuild.sh [TARGET] [SERVICE_KEYWORD...] [OPTIONS]"
    echo ""
    echo "TARGET (指定がない場合は自動判定されます):"
    echo "  home         🏠 自宅AI環境 (WSL2ネイティブ: /home/...)"
    echo "  work         🏢 職場旧環境 (Windowsマウント: /mnt/...)"
    echo "  prod         🌐 本番環境 (VPS)"
    echo ""
    echo "SERVICE_KEYWORDS:"
    echo "  bicstation / tiper / saving / avflash / django / nginx"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --watch     🚀 ローカル専用: ファイル変更を監視して自動再構築"
    echo "  --clean         コンテナとイメージを掃除して再構築"
    echo "  --no-cache      キャッシュを無視してビルド"
    echo "================================================================"
}

# 引数解析
for arg in "$@"; do
    case $arg in
        "home"|"work"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "--clean") CLEAN=true ;;
        "--clean-all") CLEAN_ALL=true ;;
        "-w"|"--watch") WATCH_MODE=true ;;
        "--help"|"-h") show_help; exit 0 ;;
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のエイリアス変換
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
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# ---------------------------------------------------------
# 4. ターゲット自動決定 (ここが今回の肝！)
# ---------------------------------------------------------
if [ "$IS_VPS" = true ]; then
    TARGET="prod"
elif [ -z "$TARGET" ]; then
    # 実行ディレクトリのパスに "/home/" が含まれるならネイティブ環境とみなす
    if [[ "$SCRIPT_DIR" == *"/home/"* ]]; then
        TARGET="home"
    # "/mnt/" が含まれるなら旧来のWindowsマウント環境とみなす
    elif [[ "$SCRIPT_DIR" == *"/mnt/"* ]]; then
        TARGET="work"
    else
        TARGET="home"
    fi
fi

# ---------------------------------------------------------
# 5. 設定ファイルのパス決定 (相対パスを基本にする)
# ---------------------------------------------------------
case $TARGET in
    "prod")
        COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
        ;;
    "work")
        # 職場環境がマウント領域にある場合を想定
        COMPOSE_FILE="$SCRIPT_DIR/docker-compose.work.yml"
        ;;
    *)
        # 自宅(home)環境。デフォルトの compose ファイルを使用
        COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
        ;;
esac

# ターゲット専用ファイルが存在すれば上書き適用
if [ -f "$SCRIPT_DIR/docker-compose.$TARGET.yml" ]; then
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.$TARGET.yml"
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# ---------------------------------------------------------
# 🚀 ウォッチモード (nodemon) 
# ---------------------------------------------------------
if [ "$WATCH_MODE" = true ]; then
    if [ "$TARGET" == "prod" ]; then echo "❌ 本番でのWatch禁止"; exit 1; fi
    if ! command -v nodemon &> /dev/null; then echo "❌ nodemon未検出"; exit 1; fi

    echo "👀 ウォッチモード起動中..."
    NEXT_ARGS=$(echo "$@" | sed 's/-w//g' | sed 's/--watch//g')
    nodemon --watch "$SCRIPT_DIR" -e ts,tsx,js,jsx,css,scss,json,html \
            --ignore 'node_modules/**' --ignore '.next/**' --delay 2 \
            --exec "$0 $NEXT_ARGS"
    exit 0
fi

# =========================================================
# 🔍 実行
# =========================================================
echo "======================================="
echo "📂 PATH    : $SCRIPT_DIR"
echo "📍 TARGET  : $TARGET"
echo "📄 COMPOSE : $(basename "$COMPOSE_FILE")"
echo "⚙️  SERVICES: ${SERVICES:-ALL}"
echo "======================================="

cd "$SCRIPT_DIR"

# ネットワーク作成
EXTERNAL_NET="shin-vps_shared-proxy"
if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    docker network create "$EXTERNAL_NET"
fi

# ステップ1: 停止
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 完全クリーンアップ中..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker builder prune -af
elif [ "$CLEAN" = true ]; then
    echo "🧹 クリーンアップ中..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
    docker image prune -f
else
    echo "🚀 サービス停止中..."
    docker compose -f "$COMPOSE_FILE" stop $SERVICES
fi

# ステップ2 & 3: ビルド
echo "🛠️  ビルド実行中..."
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES

# ステップ4: 起動
echo "✨ コンテナ起動..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans $SERVICES

echo "---------------------------------------"
echo "🎉 再構築完了！"
docker compose -f "$COMPOSE_FILE" ps $SERVICES