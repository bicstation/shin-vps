#!/bin/bash
# scripts/content_tiper.sh
# 読み込み元の環境設定（env.sh）があることを前提としています
source "$(dirname "$0")/env.sh"

while true; do
    clear
    echo -e "${MAGENTA}${BOLD}--- 🔞 CONTENT TIPER (ADULT MANAGEMENT SYSTEM) ---${RESET}"
    echo "1) FANZA/DUGA インポート (詳細メニュー)"
    echo "2) サービス・フロア階層同期 ✨"
    echo "3) 女優スペック同期 (5万件) 👩"
    echo "4) AI 黄金比スタイル解析 💎"
    echo "5) アダルト作品AI解析 (Sommelier) 🍷"
    echo "6) FANZA APIエクスプローラー & 解析 🔍"
    echo "b) 戻る"
    echo -e "${MAGENTA}--------------------------------------------------${RESET}"

    read -p ">> " OPT
    case $OPT in
        1) 
            echo -e "\n${YELLOW}${BOLD}--- 🔞 ADULT IMPORT & RE-SYNC ---${RESET}"
            echo "1) 一括取得 (DUGA & FANZA)"
            echo "2) DUGAのみ取得"
            echo "3) FANZAのみ取得"
            echo "4) Migration Reset (再取得用)"
            echo "5) Normalize (データ正規化のみ)"
            echo "6) RawDelete (移行済み生データの削除)"
            echo "b) 戻る"
            read -p ">> " ADULT_CHOICE
            
            case $ADULT_CHOICE in
                1|2|3)
                    read -p "開始ページ (デフォルト 1): " START_PG; START_PG=${START_PG:-1}
                    read -p "取得ページ数 (デフォルト 1): " PG_COUNT; PG_COUNT=${PG_COUNT:-1}
                    
                    # DUGA 処理
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "2" ]]; then
                        echo -e "${CYAN}🚀 DUGA インポート中 (Page: $START_PG から $PG_COUNT ページ)...${RESET}"
                        run_django python manage.py import_t_duga --start_page "$START_PG" --pages "$PG_COUNT"
                    fi
                    
                    # FANZA 処理
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "3" ]]; then
                        echo -e "${CYAN}🚀 FANZA インポート中 (Page: $START_PG から $PG_COUNT ページ)...${RESET}"
                        run_django python manage.py import_t_fanza --start_page "$START_PG" --pages "$PG_COUNT"
                    fi
                    
                    read -p "自動正規化(Normalize)を実行しますか？ (y/N): " N_CONFIRM
                    if [[ "$N_CONFIRM" == "y" ]]; then
                        echo -e "${GREEN}🔄 データを正規化しています...${RESET}"
                        run_django python manage.py normalize_duga
                        run_django python manage.py normalize_fanza
                    fi
                    ;;
                4) 
                    echo -e "${RED}⚠️ Migration 履歴をリセットします...${RESET}"
                    run_django python manage.py reset_api_migration 
                    ;;
                5) 
                    echo -e "${GREEN}🔄 正規化処理(Normalize)のみ実行中...${RESET}"
                    run_django python manage.py normalize_duga
                    run_django python manage.py normalize_fanza 
                    ;;
                6) 
                    echo -e "${YELLOW}🗑️ 移行済みのRawデータをDBから削除します...${RESET}"
                    run_django python manage.py shell <<EOF
from api.models import RawApiData
qs = RawApiData.objects.filter(migrated=True)
count = qs.count()
qs.delete()
print(f"✅ {count} 件の移行済み生データを削除しました。")
EOF
                    ;;
                b) continue ;;
            esac
            ;;

        2) 
            echo -e "${CYAN}✨ FANZAサービス・フロア階層を同期中...${RESET}"
            run_django python manage.py sync_fanza_floors 
            ;;
        
        3) 
            echo -e "${CYAN}👩 女優スペックデータ (5万件) を同期中...${RESET}"
            run_django python manage.py import_t_fanza_actress 
            ;;

        4) 
            echo -e "${MAGENTA}💎 AI 黄金比スタイル解析を開始...${RESET}"
            run_django python manage.py analyze_actress_style 
            ;;

        5) 
            echo -e "${MAGENTA}🍷 アダルト作品AI解析 (Sommelier) を実行中...${RESET}"
            run_django python manage.py analyze_adult 
            ;;

        6) 
            echo -e "${YELLOW}🔍 FANZA APIエクスプローラーを起動...${RESET}"
            run_django python manage.py fanza_explorer 
            ;;

        b) 
            break 
            ;;

        *) 
            echo -e "${RED}無効な選択です。${RESET}" 
            ;;
    esac

    echo -e "\n${GREEN}完了。Enterで戻ります。${RESET}"
    read
done