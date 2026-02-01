#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS プロフェッショナル再構築スクリプト (WSL2 & 32GB RAM 最適化版)
# ==============================================================================

# 1. 実行環境の解析
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
TAIL_LOGS=true
RAW_SERVICES=""

# ---------------------------------------------------------
# 🚨 3. ヘルプ表示
# ---------------------------------------------------------
show_help() {
    echo "================================================================"
    echo "🛠  SHIN-VPS REBUILD SCRIPT Pro (High Performance Mode)"
    echo "================================================================"
    echo "Usage: ./rebuild.sh [TARGET] [SERVICE_KEYWORD...] [OPTIONS]"
    echo ""
    echo "TARGET (自動判定されます):"
    echo "  home         🏠 自宅AI環境 (Native WSL2: /home/...)"
    echo "  work         🏢 職場旧環境 (Windows Mount: /mnt/...)"
    echo "  prod         🌐 本番環境 (VPS)"
    echo ""
    echo "SERVICE_KEYWORDS: (部分一致・複数指定可)"
    echo "  bicstation / tiper / saving / avflash / django / nginx / ollama"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --watch  🚀 ファイル変更を監視して自動リロード (nodemon)"
    echo "  -c, --clean  🧹 ビルドキャッシュと未使用イメージを掃除"
    echo "  -a, --all    🚨 [強力] 未使用ボリューム・全キャッシュを完全削除"
    echo "  -n, --no-log 🚫 起動後のログ追跡をスキップ"
    echo "  --stats      📊 コンテナの稼働状況(docker stats)を表示して終了"
    echo "  --no-cache   🔨 Dockerビルド時にキャッシュを無視"
    echo "================================================================"
}

# ---------------------------------------------------------
# 4. 引数解析
# ---------------------------------------------------------
for arg in "$@"; do
    case $arg in
        "home"|"work"|"prod") TARGET=$arg ;;
        "--no-cache") NO_CACHE="--no-cache" ;;
        "-c"|"--clean") CLEAN=true ;;
        "-a"|"--all"|"--clean-all") CLEAN_ALL=true ;;
        "-w"|"--watch") WATCH_MODE=true ;;
        "-n"|"--no-log") TAIL_LOGS=false ;;
        "--stats") docker stats; exit 0 ;;
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
        "django")      SERVICES="$SERVICES django-v2" ;;
        "wp")          SERVICES="$SERVICES wordpress-v2" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# ---------------------------------------------------------
# 5. ターゲット & 設定ファイルの決定
# ---------------------------------------------------------
if [ "$IS_VPS" = true ]; then
    TARGET="prod"
elif [ -z "$TARGET" ]; then
    if [[ "$SCRIPT_DIR" == *"/home/"* ]]; then TARGET="home";
    elif [[ "$SCRIPT_DIR" == *"/mnt/"* ]]; then TARGET="work";
    else TARGET="home"; fi
fi

COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
[ -f "$SCRIPT_DIR/docker-compose.$TARGET.yml" ] && COMPOSE_FILE="$SCRIPT_DIR/docker-compose.$TARGET.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ エラー: 設定ファイルが見つかりません: $COMPOSE_FILE"
    exit 1
fi

# ---------------------------------------------------------
# 6. 事前チェック (WSL2/Docker 動作確認)
# ---------------------------------------------------------
if ! docker info >/dev/null 2>&1; then
    echo "❌ Dockerが起動していないか、WSL2が応答していません。"
    echo "👉 'wsl --shutdown' を試すか、Docker Desktopを確認してください。"
    exit 1
fi

# 🚀 ウォッチモード (nodemon)
if [ "$WATCH_MODE" = true ]; then
    [ "$TARGET" == "prod" ] && { echo "❌ 本番環境でのWatchは禁止されています"; exit 1; }
    echo "👀 ウォッチモード起動中..."
    NEXT_ARGS=$(echo "$@" | sed 's/-w//g' | sed 's/--watch//g')
    nodemon --watch "$SCRIPT_DIR" -e ts,tsx,js,jsx,css,scss,json,html,py \
            --ignore 'node_modules/**' --ignore '.next/**' --delay 3 \
            --exec "$0 $NEXT_ARGS"
    exit 0
fi

# =========================================================
# 🔍 実行シーケンス
# =========================================================
echo "======================================="
echo "📁 PATH    : $SCRIPT_DIR"
echo "📍 TARGET  : $TARGET"
echo "📄 COMPOSE : $(basename "$COMPOSE_FILE")"
echo "⚙️  SERVICES: ${SERVICES:-ALL (FULL REBUILD)}"
echo "======================================="

cd "$SCRIPT_DIR"

# 共有ネットワークの確保
EXTERNAL_NET="shin-vps_shared-proxy"
docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1 || docker network create "$EXTERNAL_NET"

# --- STEP 1: 停止 & クリーンアップ ---
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [MODE: FULL CLEAN] システム全体の未使用リソースを削除します..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker system prune -af --volumes # これが以前13GB解放した魔法のコマンドです
elif [ "$CLEAN" = true ]; then
    echo "🧹 [MODE: CLEAN] キャッシュと古いイメージを掃除します..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
    docker image prune -f
    docker builder prune -f # BuildKitキャッシュの掃除
else
    echo "🚀 サービスを停止中..."
    docker compose -f "$COMPOSE_FILE" stop $SERVICES
fi

# --- STEP 2: ビルド & 起動 ---
echo "🛠️  ビルド中..."
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES

echo "✨ コンテナを起動します..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- STEP 3: 完了確認 & ログ出力 ---
echo "---------------------------------------"
echo "🎉 再構築が完了しました！"

if [ "$TAIL_LOGS" = true ] && [ -z "$WATCH_MODE" ]; then
    echo "📝 ログ出力を開始します... (Ctrl+C で中断してもコンテナは動き続けます)"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES
else
    docker compose -f "$COMPOSE_FILE" ps $SERVICES
fi