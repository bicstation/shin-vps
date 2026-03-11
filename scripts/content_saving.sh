#!/bin/bash
# scripts/content_saving.sh
source "$(dirname "$0")/env.sh"

echo -e "\n${GREEN}--- 💰 CONTENT SAVING (LIFE/POINT) ---${RESET}"
echo "1) 節約・マネー最新ニュース投稿 (RSS)"
echo "2) ポイ活・セール情報インポート"
echo "b) 戻る"

read -p ">> " OPT
case $OPT in
    1) run_django python manage.py ai_post_saving_news ;; # 今後作成するコマンド
    2) echo "TODO: Implement saving scraper" ;;
    b) exit 0 ;;
esac
pause