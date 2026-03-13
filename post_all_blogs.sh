#!/bin/bash
# /home/maya/shin-dev/shin-vps/post_all_blogs.sh

# --- 設定項目 ---
# 環境に合わせて PROJECT_ROOT を調整してください
PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
LOG_DIR="$PROJECT_ROOT/django/api/management/commands/cron_logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"

# ログディレクトリがない場合は作成
mkdir -p $LOG_DIR

echo "------------------------------------------------------------" >> $LOG_FILE
echo "--- 🚀 BICSTATION 艦隊一斉出撃開始: $(date) ---" >> $LOG_FILE
echo "------------------------------------------------------------" >> $LOG_FILE

# --- 実行フェーズ 1: PCニュース系 (v16.0) ---
# v16.0のai_post_pc_newsは内部で全ブログ(WP/LD/Seesaa)を自動巡回します。
# 1回実行するだけで、各ブログに最適な1記事ずつが配給されます。

echo "[PC News] 全ブログへの一括配給を開始..." >> $LOG_FILE

cd $PROJECT_ROOT && /usr/bin/docker compose exec -T django-v3 python manage.py ai_post_pc_news >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "[PC News] 正常に処理が完了しました。" >> $LOG_FILE
else
    echo "[PC News] 実行中にエラーが発生しましたが、スキップ処理が作動しました。" >> $LOG_FILE
fi

# サーバー負荷軽減のためのインターバル
sleep 15

# --- 実行フェーズ 2: 🔞 アダルトニュース系 (v17.4) ---
echo "[Adult News] 投稿 & GitHub同期を開始..." >> $LOG_FILE

cd $PROJECT_ROOT && /usr/bin/docker compose exec -T django-v3 python manage.py ai_post_adult_news --target all >> $LOG_FILE 2>&1

echo "--- 🏁 全ブログ更新完了: $(date) ---" >> $LOG_FILE
echo "------------------------------------------------------------" >> $LOG_FILE