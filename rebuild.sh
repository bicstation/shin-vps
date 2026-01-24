#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 高機能再構築・管理スクリプト (令和・WSL2ネイティブ対応版)
# ==============================================================================

# 1. 実行ディレクトリ・ホスト情報の取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPS・ローカル環境の判定
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
RESTART_ONLY=false
SHOW_LOGS=false
RAW_SERVICES=""

# ---------------------------------------------------------
# 🚨 3. ヘルプ表示 (充実版)
# ---------------------------------------------------------
show_help() {
    echo "================================================================"
    echo "🛠  SHIN-VPS CONTROL SCRIPT (Native WSL2 / VPS Hybrid)"
    echo "================================================================"
    echo "Usage: ./rebuild.sh [TARGET] [COMMAND/SERVICE...] [OPTIONS]"
    echo ""
    echo "COMMANDS:"
    echo "  restart           🚀 ビルドせずにコンテナのみ再起動 (高速)"
    echo "  (指定なし)        🛠  ビルド ＋ コンテナ再構築 (デフォルト)"
    echo ""
    echo "TARGET (自動判定されますが明示も可能):"
    echo "  home              🏠 自宅AI環境 (WSL2ネイティブ: /home/...)"
    echo "  work              🏢 職場旧環境 (Windowsマウント: /mnt/...)"
    echo "  prod              🌐 本番環境 (VPS)"
    echo ""
    echo "SERVICE_KEYWORDS (複数指定可):"
    echo "  django            🐍 Djangoサーバー (django-v2)"
    echo "  tiper             📖 Tipre Next.js"
    echo "  bicstation        🚉 BicStation Next.js"
    echo "  saving            💰 BicSaving Next.js"
    echo "  avflash           ⚡️ AVFlash Next.js"
    echo "  nginx, db, redis  📦 インフラ系コンテナ"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --watch       🚀 ローカル専用: ファイル変更を監視して自動実行"
    echo "  -l, --logs        📜 実行完了後にリアルタイムログを表示"
    echo "  --clean           🧹 イメージの掃除をしてから再構築"
    echo "  --clean-all       🚨 全ボリューム・キャッシュを削除して完全初期化"
    echo "  --no-cache        ❄️  キャッシュを無視してビルド"
    echo ""
    echo "EXAMPLES:"
    echo "  ./rebuild.sh django restart      -> Djangoコンテナを爆速再起動"
    echo "  ./rebuild.sh django -l           -> Djangoをビルドして起動、ログ表示"
    echo "  ./rebuild.sh tiper restart       -> Tiperコンテナを再起動"
    echo "================================================================"
}

# 引数解析
for arg in "$@"; do
    case $arg in
        "home"|"work"|"prod") TARGET=$arg ;;
        "restart")           RESTART_ONLY=true ;;
        "--no-cache")        NO_CACHE="--no-cache" ;;
        "--clean")           CLEAN=true ;;
        "--clean-all")       CLEAN_ALL=true ;;
        "-w"|"--watch")      WATCH_MODE=true ;;
        "-l"|"--logs")       SHOW_LOGS=true ;;
        "--help"|"-h")       show_help; exit 0 ;;
        *)                   RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のエイリアス変換 (ここで名前を吸収します)
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "django")      SERVICES="$SERVICES django-v2" ;;
        "bicstation") SERVICES="$SERVICES next-bicstation-v2" ;;
        "tiper")       SERVICES="$SERVICES next-tiper-v2" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v2" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v2" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# ---------------------------------------------------------
# 4. ターゲット自動決定
# ---------------------------------------------------------
if [ "$IS_VPS" = true ]; then
    TARGET="prod"
elif [ -z "$TARGET" ]; then
    if [[ "$SCRIPT_DIR" == *"/home/"* ]]; then
        TARGET="home"
    elif [[ "$SCRIPT_DIR" == *"/mnt/"* ]]; then
        TARGET="work"
    else
        TARGET="home"
    fi
fi

# ---------------------------------------------------------
# 5. 設定ファイルのパス決定
# ---------------------------------------------------------
case $TARGET in
    "prod") COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml" ;;
    "work") COMPOSE_FILE="$SCRIPT_DIR/docker-compose.work.yml" ;;
    *)      COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml" ;;
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
MODE_TEXT="BUILD & UP"
if [ "$RESTART_ONLY" = true ]; then MODE_TEXT="RESTART ONLY"; fi

echo "======================================="
echo "📂 PATH    : $SCRIPT_DIR"
echo "📍 TARGET  : $TARGET"
echo "📄 COMPOSE : $(basename "$COMPOSE_FILE")"
echo "⚡️ MODE    : $MODE_TEXT"
echo "⚙️  SERVICES: ${SERVICES:-ALL}"
echo "======================================="

cd "$SCRIPT_DIR"

# ネットワーク作成
EXTERNAL_NET="shin-vps_shared-proxy"
if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    docker network create "$EXTERNAL_NET"
fi

# --- 実行フェーズ ---

if [ "$RESTART_ONLY" = true ]; then
    # 🚀 RESTART モード: ビルドせずに再起動
    echo "🔄 コンテナを再起動中..."
    docker compose -f "$COMPOSE_FILE" restart $SERVICES
else
    # 🛠 REBUILD モード: 通常のビルド・停止・起動
    if [ "$CLEAN_ALL" = true ]; then
        echo "🚨 完全クリーンアップ中..."
        docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
        docker builder prune -af
    elif [ "$CLEAN" = true ]; then
        echo "🧹 クリーンアップ中..."
        docker compose -f "$COMPOSE_FILE" down --remove-orphans
        docker image prune -f
    fi

    echo "🛠️  ビルド及びコンテナ更新中..."
    docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans $SERVICES
fi

echo "---------------------------------------"
echo "🎉 処理完了！"
docker compose -f "$COMPOSE_FILE" ps $SERVICES

# 📜 ログ表示オプション
if [ "$SHOW_LOGS" = true ]; then
    echo "📜 ログを表示します (Ctrl+C で中断してもコンテナは動き続けます)..."
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100 $SERVICES
fi