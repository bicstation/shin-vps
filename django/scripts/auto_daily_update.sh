#!/bin/bash

# ==============================================================================
# 🤖 BICSTATION 自動データ更新スクリプト (Non-Interactive)
# 実行推奨場所: ~/dev/shin-vps
# ==============================================================================

# 1. パス解決：スクリプトの場所からプロジェクトルート(shin-vps)を特定して移動
# django/scripts/ から見て2つ上がルート
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$SCRIPT_DIR"

# 2. 環境判別
CURRENT_HOSTNAME=$(hostname)
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]]; then
    # VPS本番環境
    COMPOSE_FILE="docker-compose.prod.yml"
else
    # ローカル開発環境 (Maryaなど)
    COMPOSE_FILE="docker-compose.yml"
fi

DJANGO_CON="django-v2"
NEXT_CON="next-bicstation-v2"

# 3. 共通実行関数
run_django() {
    docker compose -f "$COMPOSE_FILE" exec -T "$DJANGO_CON" "$@"
}

echo "--- 🚀 自動更新開始: $(date) ---"
echo "📂 実行ディレクトリ: $(pwd)"
echo "📄 使用設定ファイル: $COMPOSE_FILE"

# ------------------------------------------------------------------------------
# 📦 1/4: 商品データのインポート (FTPを先に、APIを後に実行して最新価格を優先)
# ------------------------------------------------------------------------------
echo "📦 1/4: 商品データのインポートを開始..."

# --- 1-1. FTP系 (全体情報の取得) ---
FTP_MIDS=("2543" "36508" "35909" "2557" "24501" "2633")
for MID in "${FTP_MIDS[@]}"; do
    echo "📡 FTP同期中: MID $MID"
    run_django python manage.py import_bc_mid_ftp --mid "$MID"
done

# --- 1-2. API系 (最新価格での上書き) ---
API_MIDS=("43708" "24732" "35909" "2557" "2543")
API_SLUGS=("asus" "norton" "hp" "dell" "fmv")

for i in "${!API_MIDS[@]}"; do
    MID=${API_MIDS[$i]}
    SLUG=${API_SLUGS[$i]}
    echo "📡 API同期中: $SLUG (MID: $MID)"
    run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
done

# --- 1-3. 独自スクリプト系 (VPS環境が整うまで注釈化) ---
echo "📡 独自スクリプト実行: (スキップ中)"
run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
# run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py
# run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_ark_msi.py

# ------------------------------------------------------------------------------
# 📈 2/4: 価格履歴の記録
# ------------------------------------------------------------------------------
echo "📈 2/4: 価格履歴を記録中 (record_price_history --all)..."
run_django python manage.py record_price_history --all

# ------------------------------------------------------------------------------
# 🌐 3/4: サイトマップの更新
# ------------------------------------------------------------------------------
echo "🌐 3/4: サイトマップを更新中..."
# ホスト側のソースファイル
SITEMAP_SCRIPT="./next-bicstation/generate-sitemap.js"

if [ -f "$SITEMAP_SCRIPT" ]; then
    # コンテナへコピー (実行コマンドに合わせて .js で配置)
    docker cp "$SITEMAP_SCRIPT" "$NEXT_CON":/app/generate-sitemap.js
    docker compose -f "$COMPOSE_FILE" exec -T -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    # コンテナ内の .js を実行
    docker compose -f "$COMPOSE_FILE" exec -T "$NEXT_CON" node /app/generate-sitemap.js
else
    echo "❌ エラー: $SITEMAP_SCRIPT が見つかりません。サイトマップ更新をスキップします。"
fi

# ------------------------------------------------------------------------------
# 🔄 4/4: システムメンテナンス (本番環境のみ)
# ------------------------------------------------------------------------------
if [[ "$COMPOSE_FILE" == *"prod"* ]]; then
    echo "🔄 4/4: スケジューラーを再起動中..."
    docker compose -f "$COMPOSE_FILE" up -d scheduler
fi

echo "✅ 全工程完了: $(date)"