#!/bin/bash
# scripts/content_tiper.sh
source "$(dirname "$0")/env.sh"

echo -e "\n${MAGENTA}--- 🔞 CONTENT TIPER (ADULT) ---${RESET}"
echo "1) FANZA/DUGA インポート (詳細メニュー)"
echo "2) サービス・フロア階層同期 ✨"
echo "3) 女優スペック同期 (5万件)"
echo "4) AI 黄金比スタイル解析 💎"
echo "5) アダルト作品AI解析 (Sommelier)"
echo "6) FANZA APIエクスプローラー & 解析 🔍"
echo "b) 戻る"

read -p ">> " OPT
case $OPT in
    1) 
        echo -e "\n${YELLOW}--- 🔞 ADULT IMPORT & RE-SYNC ---${RESET}"
        echo "1) 一括取得 / 2) DUGAのみ / 3) FANZAのみ / 4) Reset / 5) Normalize / 6) RawDelete"
        read -p ">> " ADULT_CHOICE
        case $ADULT_CHOICE in
            1|2|3)
                read -p "開始ページ (1): " START_PG; START_PG=${START_PG:-1}
                read -p "取得ページ数 (1): " PG_COUNT; PG_COUNT=${PG_COUNT:-1}
                [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "2" ]] && run_django python manage.py import_t_duga --start_page "$START_PG" --pages "$PG_COUNT"
                [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "3" ]] && run_django python manage.py import_t_fanza --start_page "$START_PG" --pages "$PG_COUNT"
                read -p "自動正規化を実行しますか？ (y/N): " N_CONFIRM; [[ "$N_CONFIRM" == "y" ]] && run_django python manage.py normalize_duga && run_django python manage.py normalize_fanza ;;
            4) run_django python manage.py reset_api_migration ;;
            5) run_django python manage.py normalize_duga && run_django python manage.py normalize_fanza ;;
            6) run_django python manage.py shell <<EOF
from api.models import RawApiData
qs = RawApiData.objects.filter(migrated=True)
print(f"✅ {qs.count()} 件削除"); qs.delete()
EOF
                ;;
        esac ;;
    2) run_django python manage.py sync_fanza_floors ;;
    3) run_django python manage.py import_t_fanza_actress ;;
    4) run_django python manage.py analyze_actress_style ;;
    5) run_django python manage.py analyze_adult ;;
    6) run_django python manage.py fanza_explorer ;;
    b) exit 0 ;;
esac
pause