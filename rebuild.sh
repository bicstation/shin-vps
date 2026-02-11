#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS プロフェッショナル再構築スクリプト (BuildKit & GPU アクセル最適化版)
# ------------------------------------------------------------------------------
# 修正内容: BuildKitの強制有効化、並列ビルドの最適化、iGPUパススルー対応の強化
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

# ⚡ Docker BuildKit を強制有効化 (ビルド高速化の鍵)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

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
    echo "  bicstation / tiper / saving / avflash / django / wp / ollama"
    echo ""
    echo "OPTIONS:"
    echo "  -w, --watch  🚀 ファイル変更を監視して自動リロード (nodemon)"
    echo "  -c, --clean  🧹 ビルドキャッシュと古いイメージを掃除"
    echo "  -a, --all    🚨 [強力] 未使用ボリューム・全キャッシュを完全削除"
    echo "  -n, --no-log 🚫 起動後のログ追跡をスキップ"
    echo "  --stats      📊 コンテナの稼働状況を表示して終了"
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
# 6. 事前チェック & ネットワーク修復
# ---------------------------------------------------------
if ! docker info >/dev/null 2>&1; then
    echo "❌ Dockerが起動していないか、WSL2が応答していません。"
    exit 1
fi

# iGPU デバイス (/dev/dri) の存在確認 (WSL2/Linux)
if [ -e "/dev/dri" ]; then
    echo "🎮 内蔵グラフィック (iGPU) を検出しました。HWアクセラレーションが利用可能です。"
fi

EXTERNAL_NET="shin-vps_shared-proxy"
NETWORK_INFO=$(docker network inspect "$EXTERNAL_NET" 2>/dev/null)

if [ $? -eq 0 ]; then
    HAS_LABEL=$(echo "$NETWORK_INFO" | grep "com.docker.compose.network")
    if [ -z "$HAS_LABEL" ]; then
        echo "⚠️  ネットワークの不整合（Labelなし）を検知しました。"
        echo "🔄  再生成します..."
        docker compose -f "$COMPOSE_FILE" down >/dev/null 2>&1
        docker network rm "$EXTERNAL_NET" >/dev/null 2>&1
        docker network create "$EXTERNAL_NET"
    fi
else
    echo "🌐 共有ネットワークを作成します: $EXTERNAL_NET"
    docker network create "$EXTERNAL_NET"
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
echo "📁 PATH     : $SCRIPT_DIR"
echo "📍 TARGET   : $TARGET"
echo "📄 COMPOSE  : $(basename "$COMPOSE_FILE")"
echo "⚙️  SERVICES : ${SERVICES:-ALL (FULL REBUILD)}"
echo "⚡ MODE     : BuildKit Enabled"
echo "======================================="

cd "$SCRIPT_DIR"

# --- STEP 1: 停止 & クリーンアップ ---
if [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [MODE: FULL CLEAN] システム全体の未使用リソースを削除します..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker system prune -af --volumes 
elif [ "$CLEAN" = true ]; then
    echo "🧹 [MODE: CLEAN] キャッシュと古いイメージを掃除します..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
    docker image prune -f
    docker builder prune -f 
else
    echo "🚀 停止/更新中..."
    docker compose -f "$COMPOSE_FILE" stop $SERVICES
fi

# --- STEP 2: ビルド & 起動 ---
# BuildKitの並列ビルドを活かし、依存関係を解決しながら高速構築
echo "🛠️  ビルド中 (BuildKit)..."
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES

echo "✨ コンテナを起動します..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- STEP 3: 完了確認 & ログ出力 ---
echo "---------------------------------------"
echo "🎉 再構築が完了しました！"

if [ "$TAIL_LOGS" = true ] && [ -z "$WATCH_MODE" ]; then
    echo "📝 ログ出力を開始します... (Ctrl+C で中断可能)"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES
else
    docker compose -f "$COMPOSE_FILE" ps $SERVICES
fi