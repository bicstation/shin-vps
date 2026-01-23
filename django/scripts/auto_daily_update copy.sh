#!/bin/bash

# ==============================================================================
# 🤖 BICSTATION 自動データ更新スクリプト (Internal Execution 対応版)
# 実行環境: Djangoコンテナ内部での実行を想定
# ==============================================================================

# 1. パス解決
# コンテナ内では通常 /usr/src/app がルート
SCRIPT_DIR="/usr/src/app"
cd "$SCRIPT_DIR"

# 2. 環境判別 (コンテナ内実行のためCOMPOSEファイル参照は不要だが、ロジック維持)
CURRENT_HOSTNAME=$(hostname)
echo "🔍 現在のホスト名: $CURRENT_HOSTNAME"

# 3. 共通実行関数 (修正点: docker compose を介さず直接実行)
run_django() {
    # コンテナ内なので直接コマンドを叩く
    "$@"
}

echo "--- 🚀 自動更新開始: $(date) ---"
echo "📂 実行ディレクトリ: $(pwd)"

# ------------------------------------------------------------------------------
# 📦 1/4: 商品データのインポート
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

# --- 1-3. 独自スクリプト系 ---
echo "📡 独自スクリプト実行: Lenovo / Mouse / Ark"
run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py
run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py
run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_ark_msi.py

# ------------------------------------------------------------------------------
# 📈 2/4: 価格履歴の記録
# ------------------------------------------------------------------------------
echo "📈 2/4: 価格履歴を記録中..."
# 対話プロンプトに 'y' を自動入力
echo "y" | run_django python manage.py record_price_history --all

# ------------------------------------------------------------------------------
# 🌐 3/4: サイトマップの更新 (修正点: コンテナ跨ぎを考慮せずNext.jsディレクトリを直接叩く)
# ------------------------------------------------------------------------------
echo "🌐 3/4: サイトマップを更新中..."

# DjangoコンテナからNext.jsのボリュームがマウントされている場合を想定
# もし別コンテナの必要がある場合は、API経由でキックするのが一般的です
SITEMAP_SCRIPT="/usr/src/app/next-bicstation/generate-sitemap.mjs"

if [ -f "$SITEMAP_SCRIPT" ]; then
    echo "📄 サイトマップスクリプトを実行します"
    node "$SITEMAP_SCRIPT"
else
    echo "⚠️ 警告: $SITEMAP_SCRIPT がこのコンテナ内に見つかりません。パスを確認してください。"
fi

# ------------------------------------------------------------------------------
# 🔄 4/4: AI解析 (アーク専用プロンプト等の反映タイミング)
# ------------------------------------------------------------------------------
echo "🤖 4/4: AIスペック解析を実行中..."
# 未解析の商品を優先して処理 (例: 直近100件)
run_django python manage.py analyze_pc_spec --limit 100

echo "✅ 全工程完了: $(date)"