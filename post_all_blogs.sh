#!/bin/bash

# --- 設定項目 ---
PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
LOG_DIR="$PROJECT_ROOT/django/api/management/commands/cron_logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"

# ログディレクトリがない場合は作成
mkdir -p $LOG_DIR

echo "--- 🚀 BICSTATION 全ブログ更新開始: $(date) ---" >> $LOG_FILE

# 実行関数（エラーハンドリング付き）
run_post() {
    local target=$1
    echo "Sending to $target..." >> $LOG_FILE
    cd $PROJECT_ROOT && /usr/bin/docker compose exec -T django-v3 python manage.py ai_post_pc_news --limit 1 --target $target >> $LOG_FILE 2>&1
    # サーバー負荷軽減とAPI制限回避のために少し待機（10秒）
    sleep 10
}

# --- 実行フェーズ ---

# 1. 外部メディア
run_post "hatena"
run_post "livedoor"
run_post "blogger"

# 2. Seesaa ネットワーク (各サイトを直接指定して確実に1記事ずつ入れる)
run_post "seesaa"        # メイン
run_post "seesaa_ai"     # AI
run_post "seesaa_game"   # ゲーム
run_post "seesaa_mobile" # モバイル
run_post "seesaa_work"   # ワーク

echo "--- 🏁 全ブログ更新完了: $(date) ---" >> $LOG_FILE