#!/bin/bash

# ==============================================================================
# 🚀 BICSTATION 統合自動更新システム (Universal & Safe Edition)
# 💡 役割: 商品取得 -> 価格履歴保存 -> ランキング更新 -> AIスペック解析 -> サイトマップ更新
# ==============================================================================

# --- 0. 二重起動防止の設定 ---
LOCKFILE="/tmp/bicstation_integrated_update.lock"

# 既に実行中かチェック
if [ -e "$LOCKFILE" ]; then
    PID=$(cat "$LOCKFILE")
    if ps -p $PID > /dev/null; then
        echo "⚠️ 前回の処理(PID: $PID)がまだ実行中のため、今回の実行をキャンセルします。"
        echo "   ※もしプロセスが止まっているのにこのメッセージが出る場合は rm $LOCKFILE してください。"
        exit 1
    fi
fi

# ロックファイルを作成（自身のプロセスIDを書き込む）
echo $$ > "$LOCKFILE"

# スクリプト終了時に必ずロックファイルを削除する（正常終了・エラー終了問わず）
trap "rm -f $LOCKFILE" EXIT

# --- 1. 実行環境の判定と共通関数の定義 ---
run_django() {
    if [ -f /.dockerenv ]; then
        # コンテナ内部で実行されている場合
        python manage.py "$@"
    else
        # ホスト側（VPS）から実行されている場合
        docker compose exec -T django-v2 python manage.py "$@"
    fi
}

run_python_script() {
    if [ -f /.dockerenv ]; then
        # コンテナ内部で実行されている場合
        env PYTHONPATH=/usr/src/app python "$@"
    else
        # ホスト側（VPS）から実行されている場合
        docker compose exec -T django-v2 env PYTHONPATH=/usr/src/app python "$@"
    fi
}

echo "======================================================"
echo "🏁 BICSTATION 統合メンテナンス開始: $(date)"
echo "======================================================"

# ------------------------------------------------------------------------------
# 📦 STEP 1: 商品データのインポート (多角的アプローチ)
# ------------------------------------------------------------------------------
echo -e "\n\e[36m📦 [1/5] 商品データのインポートを開始...\e[0m"

# --- 1-1. FTP同期 (全体情報の取得) ---
FTP_MIDS=("2543" "36508" "35909" "2557" "24501" "2633")
for MID in "${FTP_MIDS[@]}"; do
    echo "📡 FTP同期中: MID $MID"
    run_django import_bc_mid_ftp --mid "$MID"
done

# --- 1-2. API同期 (メーカー直販 & 最新価格) ---
MFR_MIDS=("43708" "35909" "2557" "2543" "36508")
MFR_NAMES=("ASUS" "HP" "DELL" "富士通FMV" "Dynabook")
for i in "${!MFR_MIDS[@]}"; do
    echo "📡 API直販同期: ${MFR_NAMES[$i]} (MID: ${MFR_MIDS[$i]})"
    run_django linkshare_bc_api_parser --mid "${MFR_MIDS[$i]}" --save-db --limit 500
done

# --- 1-3. 量販店キーワード検索 (重要キーワード網羅) ---
SHOP_MIDS=("13993" "43098" "37641")
TARGET_KEYWORDS=("fmv" "lavie" "dynabook" "surface" "macbook" "lenovo" "ゲーミングpc" "rtx4060" "rtx4070")

echo "🏪 量販店横断スキャン (コジマ/エディオン/ソフマップ)..."
for MID in "${SHOP_MIDS[@]}"; do
    for KEY in "${TARGET_KEYWORDS[@]}"; do
        echo "   🔍 抽出中: MID $MID / [$KEY]"
        run_django linkshare_bc_api_parser --mid "$MID" --keyword "$KEY" --save-db --limit 100
    done
done

# --- 1-4. 独自スクレイパー群 (特殊ショップ・最新モデル) ---
echo "📡 独自スクリプト実行: Lenovo / Mouse / Ark"
run_python_script /usr/src/app/scrapers/src/shops/scrape_lenovo.py
run_python_script /usr/src/app/scrapers/src/shops/import_mouse.py
run_python_script /usr/src/app/scrapers/src/shops/import_ark_msi.py

# ------------------------------------------------------------------------------
# 📈 STEP 2: 価格履歴の記録
# ------------------------------------------------------------------------------
echo -e "\n\e[36m📈 [2/5] 価格履歴を一斉記録中...\e[0m"
# 対話プロンプトに 'y' を自動入力して実行（record_price_history が内部で record_daily_price を呼ぶ前提）
echo "y" | run_django record_price_history --all

# ------------------------------------------------------------------------------
# 📊 STEP 3: 注目度ランキングの更新 (🔥 追加箇所)
# ------------------------------------------------------------------------------
echo -e "\n\e[36m📊 [3/5] 注目度ランキング（PV集計）を計算中...\e[0m"
# 蓄積されたPV数に基づき、本日の daily_rank を確定させます
run_django update_daily_stats

# ------------------------------------------------------------------------------
# 🤖 STEP 4: AIスペック解析 (未解析分を自動的に埋める)
# ------------------------------------------------------------------------------
echo -e "\n\e[36m🤖 [4/5] AIスペック解析を実行中 (未解析最大500件)...\e[0m"
run_django analyze_pc_spec --null-only --limit 500

# ------------------------------------------------------------------------------
# 🌐 STEP 5: サイトマップ更新
# ------------------------------------------------------------------------------
echo -e "\n\e[36m🌐 [5/5] サイトマップを更新中...\e[0m"
SITEMAP_SCRIPT="/usr/src/app/next-bicstation/generate-sitemap.mjs"

if [ -f "$SITEMAP_SCRIPT" ]; then
    # nodeコマンドで実行
    node "$SITEMAP_SCRIPT"
else
    echo "⚠️ 警告: $SITEMAP_SCRIPT が見つかりません。パスを確認してください。"
fi

echo -e "\n\e[32m✨======================================================\e[0m"
echo -e "\e[32m✅ 統合メンテナンス完了! ($(date))\e[0m"
echo -e "\e[32m======================================================✨\e[0m"