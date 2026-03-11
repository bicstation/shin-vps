#!/bin/bash
# scripts/content_station.sh
# 読み込み元の環境設定（env.sh）があることを前提としています
source "$(dirname "$0")/env.sh"

# --- 1. データ定義 (メインロジックから継承) ---
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]" "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]" "アーク(ark) [JSON]")

# LinkShare MID マッピング
declare -A MID_MAP
MID_MAP["nec"]="2780"; MID_MAP["sony"]="2980"; MID_MAP["fmv"]="2543"; MID_MAP["dynabook"]="36508"; MID_MAP["hp"]="35909"; MID_MAP["dell"]="2557"; MID_MAP["asus"]="43708"; MID_MAP["norton"]="24732"; MID_MAP["mcafee"]="3388"; MID_MAP["kingsoft"]="24623"; MID_MAP["cyberlink"]="36855"; MID_MAP["trendmicro"]="24501"; MID_MAP["sourcenext"]="2633"; MID_MAP["edion"]="43098"; MID_MAP["kojima"]="13993"; MID_MAP["sofmap"]="37641"; MID_MAP["bic_sofmap"]="43262"; MID_MAP["recollect"]="43860"; MID_MAP["ioplazy"]="24172"; MID_MAP["eizo"]="3256"

while true; do
    clear
    echo -e "${BLUE}${BOLD}--- 💻 CONTENT STATION (PC/GADGET AUTOMATION) ---${RESET}"
    echo "1) メーカー別同期 (API/FTP/Scrape)"
    echo "2) PCパーツ最新ニュース投稿 (RSS)"
    echo "3) AI詳細スペック解析 (PC解析)"
    echo "4) 既存SEOタイトル一括更新 (--update-all)"
    echo "b) 戻る"
    echo -e "${BLUE}--------------------------------------------------${RESET}"
    read -p ">> " OPT

    case $OPT in
        1) 
            echo -e "\n${YELLOW}対象メーカーを選択してください:${RESET}"
            for ((i=1; i<=31; i+=3)); do
                for ((j=i; j<i+3 && j<=31; j++)); do 
                    printf "%-2d) %-22s " "$j" "${MAKER_NAMES[$j]}"
                done
                echo ""
            done
            read -p "メーカー番号: " SUB
            
            [[ "$SUB" == "b" || -z "$SUB" ]] && continue
            
            SLUG=${MAKERS[$SUB]}
            MID=${MID_MAP[$SLUG]}
            
            echo -e "\n${CYAN}🔎 メーカー指定: ${BOLD}${SLUG}${RESET} (MID: ${MID:-None})"

            # --- 同期ロジックの分岐実行 ---
            case $SUB in
                7)  # Lenovo 専用スクレイパー
                    echo -e "${MAGENTA}🚀 Lenovo Scraper を実行中...${RESET}"
                    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py 
                    ;;
                10) # Mouse 専用インポーター
                    echo -e "${MAGENTA}🚀 Mouse Computer Import を実行中...${RESET}"
                    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py 
                    ;;
                *)  # 通常の LinkShare API / FTP 経由
                    if [ -n "$MID" ]; then
                        echo -e "${MAGENTA}🚀 LinkShare API Parser を実行中 (MID: $MID)...${RESET}"
                        run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
                        
                        echo -e "${MAGENTA}🚀 DB Import を実行中...${RESET}"
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    else
                        echo -e "${RED}❌ このメーカーは MID が定義されていないか、同期対象外です。${RESET}"
                    fi
                    ;;
            esac

            # 共通処理：価格履歴の記録
            echo -e "${GREEN}📈 価格履歴を記録しています...${RESET}"
            run_django python manage.py record_price_history --maker "$SLUG" 
            ;;

        2) 
            echo -e "${MAGENTA}🚀 PCパーツ最新ニュース (RSS) 投稿中...${RESET}"
            run_django python manage.py ai_post_pc_news 
            ;;

        3) 
            read -p "処理件数 (デフォルト 100): " L
            echo -e "${MAGENTA}🚀 AI詳細スペック解析を実行中 (${L:-100}件)...${RESET}"
            run_django python manage.py analyze_pc_spec --limit ${L:-100} 
            ;;

        4) 
            read -p "更新件数 (デフォルト 10): " L
            echo -e "${RED}${BOLD}🔥 既存行のSEOタイトル一括更新モード${RESET}"
            run_django python manage.py analyze_pc_spec --limit ${L:-10} --update-all 
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