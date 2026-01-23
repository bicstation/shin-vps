#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別・製品データ運用ツール
# ==============================================================================
# 🛠 修正内容: メニュー番号の重複(17番)を解消
# 🛠 修正内容: AI解析機能を 20番 以降に整理
# 🛠 修正内容: show_maker_menu が確実に呼ばれるよう調整
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判別 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
    ENV_TYPE="PRODUCTION (VPS)"
    COMPOSE_FILE="docker-compose.prod.yml"
    DJANGO_CON="django-v2"
    NEXT_CON="next-bicstation-v2"
    COLOR="\e[32m" # 緑（本番）
else
    IS_VPS=false
    ENV_TYPE="LOCAL (Development)"
    COMPOSE_FILE="docker-compose.yml"
    DJANGO_CON="django-v2"
    NEXT_CON="next-bicstation-v2"
    COLOR="\e[36m" # 水色（開発）
fi

RESET="\e[0m"
RED="\e[31m"
YELLOW="\e[33m"

# --- 2. データ定義 ---
MAKERS=(
    "DUMMY"
    "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse"           # 1-10
    "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom"                 # 11-17
    "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext"              # 18-23
    "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo"             # 24-30
    "ark"                                                                           # 31
)

MAKER_NAMES=(
    "DUMMY"
    "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse"
    "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom"
    "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]"
    "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]"
    "アーク(ark) [JSON]"
)

PC_KEYWORDS=("fmv" "lavie" "dynabook" "surface" "macbook" "lenovo")
EXCLUDE_KEYWORDS="ケース,カバー,フィルム,アダプタ,マウス,キーボード,バッグ,ケーブル"

declare -A MID_MAP
MID_MAP["nec"]="2780"
MID_MAP["sony"]="2980"
MID_MAP["fmv"]="2543"
MID_MAP["dynabook"]="36508"
MID_MAP["hp"]="35909"
MID_MAP["dell"]="2557"
MID_MAP["asus"]="43708"
MID_MAP["norton"]="24732"
MID_MAP["mcafee"]="3388"
MID_MAP["kingsoft"]="24623"
MID_MAP["cyberlink"]="36855"
MID_MAP["trendmicro"]="24501"
MID_MAP["sourcenext"]="2633"
MID_MAP["edion"]="43098"
MID_MAP["kojima"]="13993"
MID_MAP["sofmap"]="37641"
MID_MAP["bic_sofmap"]="43262"
MID_MAP["recollect"]="43860"
MID_MAP["ioplazy"]="24172"
MID_MAP["eizo"]="3256"

# --- 3. 共通実行関数 ---

run_django() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "${RED}[ERROR] $COMPOSE_FILE が見つかりません。${RESET}"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" "$@"
}

run_next() {
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" "$@"
}

update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    if [ -f "$MJS_SRC" ]; then
        docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
    else
        echo -e "${RED}[ERROR] $MJS_SRC が見つかりません。${RESET}"
        return 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    run_next node /app/generate-sitemap.mjs
}

show_maker_menu() {
    echo -e "\n${YELLOW}--- 対象メーカーを選択 (横3列表示) ---${RESET}"
    for ((i=1; i<=31; i+=3)); do
        for ((j=i; j<i+3 && j<=31; j++)); do
            printf "%-2d) %-22s " "$j" "${MAKER_NAMES[$j]}"
        done
        echo "" 
    done
    echo -e "99) 戻る / 指定なし"
}

show_help() {
    echo -e "\n${YELLOW}--- 使い方 ---${RESET}"
    echo "このスクリプトは、PC製品データのインポート、AIによるスペック解析、記事投稿を管理します。"
}

# --- 4. メインルーチン ---

while true; do
    echo -e "\n---------------------------------------"
    echo -e "🚀 SHIN-VPS Data Import & Automation Tool"
    echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
    echo -e "---------------------------------------"
    echo "1) [DB]       マイグレーション実行"
    echo "2) [Import]   Tiper (Fanza/Duga) インポート"
    echo -e "3) ${COLOR}[Import]   メーカー別インポート・同期 ✨${RESET}"
    echo "4) [Import]   AV-Flash インポート"
    echo "5) [Admin]    スーパーユーザー作成"
    echo "---------------------------------------"
    echo "12) [Analysis] 製品データをTSV出力"
    echo "13) [Master]   属性マスター(TSV)インポート"
    echo "14) [Auto]     属性自動マッピング実行 ⚡"
    echo "15) [SEO]      サイトマップ手動更新 🌐"
    echo "---------------------------------------"
    echo -e "20) ${YELLOW}[AI-Spec]  AI詳細スペック解析 (analyze_pc_spec) 🔥${RESET}"
    echo -e "21) ${COLOR}[WP]       商品AI記事生成 & WordPress投稿${RESET}"
    echo -e "22) ${COLOR}[News]     PCパーツ最新ニュース投稿${RESET}"
    echo -e "23) ${COLOR}[AI-M]     AIモデル一覧の確認 (Gemini/Gemma) 🤖${RESET}"
    echo -e "24) ${COLOR}[Price]    価格履歴の一斉記録 📈${RESET}"
    echo -e "25) ${RED}[Admin]    DBデータ一括削除 (クリーンアップ) 🗑️${RESET}"
    echo "---------------------------------------"
    echo "h) [Help]      説明  /  8) 終了"
    echo "---------------------------------------"

    read -p "選択してください: " CHOICE

    case $CHOICE in
        1) run_django python manage.py makemigrations api; run_django python manage.py migrate ;;
        2)
            run_django python manage.py import_t_duga; run_django python manage.py import_t_fanza
            run_django python manage.py normalize_duga; run_django python manage.py normalize_fanza
            ;;
        3)
            show_maker_menu
            read -p ">> " SUB_CHOICE
            [[ "$SUB_CHOICE" == "99" || -z "$SUB_CHOICE" ]] && continue
            
            SLUG=${MAKERS[$SUB_CHOICE]}
            MID=${MID_MAP[$SLUG]}

            case $SUB_CHOICE in
                7) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py ;;
                11) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_acer.py ;;
                12) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_mini.py ;;
                13) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_geekom.py ;;
                14) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_vspec.py ;;
                15) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_storm.py ;;
                16) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_frontier.py ;;
                17) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_sycom.py ;;
                9)  run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_ark_msi.py ;;
                10) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py ;;
                31) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_ark.py ;;

                1|2|8|18|19|20|21|24|25|26|27|28|29)
                    if [ "$SLUG" == "asus" ]; then
                        run_django python manage.py linkshare_bc_api_parser --mid 43708 --save-db --max-pages 5
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid 43708 --maker asus
                    elif [[ "$SUB_CHOICE" =~ ^(24|25|26|27)$ ]]; then
                        for KW in "${PC_KEYWORDS[@]}"; do
                            run_django python manage.py linkshare_bc_api_parser --mid "$MID" --keyword "$KW" --none "$EXCLUDE_KEYWORDS" --save-db --limit 100
                        done
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    else
                        run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    fi
                    ;;
                3|4|5|6|22|23|30)
                    run_django python manage.py import_bc_mid_ftp --mid "$MID" ;;
                *) echo "無効な番号です。"; continue ;;
            esac

            run_django python manage.py record_price_history --maker "$SLUG"
            read -p "続けてAI詳細スペック解析を実行しますか？(y/n): " AI_CONFIRM
            [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker "$SLUG" --limit 999999
            ;;
        4) read -p "ファイル名: " FILE_NAME; run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME" ;;
        5) run_django python manage.py createsuperuser ;;
        12) run_django python manage.py export_products ;;
        13)
            FIXED_TSV="/usr/src/app/master_data/attributes.tsv"
            run_django python manage.py import_specs "$FIXED_TSV"
            run_django python manage.py auto_map_attributes
            ;;
        14) run_django python manage.py auto_map_attributes ;;
        15) update_sitemap ;;

        # --- AI解析関連 (再編) ---
        20)
            echo -e "\n${YELLOW}--- AI詳細スペック解析モード ---${RESET}"
            show_maker_menu
            echo "番号選択: 各メーカー個別 / all: 全メーカー一括"
            read -p "メーカー指定: " SPEC_MK_VAL
            MK_ARG=""
            if [[ "$SPEC_MK_VAL" == "all" ]]; then
                echo -e "${COLOR}🚀 全メーカー対象に開始...${RESET}"
            else
                [[ -z "$SPEC_MK_VAL" || "$SPEC_MK_VAL" == "99" ]] && continue
                MK_ARG="--maker ${MAKERS[$SPEC_MK_VAL]}"
            fi
            read -p "未解析分のみ？ (y/n): " ONLY_NULL
            NULL_ARG=""
            [[ "$ONLY_NULL" == "y" ]] && NULL_ARG="--null-only"
            run_django python manage.py analyze_pc_spec $MK_ARG $NULL_ARG --limit 999999
            ;;
        21)
            echo "1: 1件 / 2: 5件連続"
            read -p "モード: " WP_CHOICE
            show_maker_menu
            read -p "メーカー番号: " WP_MK_NUM
            MK_ARG=""
            [[ -n "$WP_MK_NUM" && "$WP_MK_NUM" -le 31 ]] && MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
            if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db $MK_ARG
            elif [ "$WP_CHOICE" == "2" ]; then for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
            fi
            ;;
        22)
            echo "1) RSS自動 / 2) URL指定"
            read -p ">> " NEWS_CHOICE
            if [ "$NEWS_CHOICE" == "1" ]; then run_django python manage.py ai_post_pc_news
            elif [ "$NEWS_CHOICE" == "2" ]; then read -p "URL: " TARGET_URL; run_django python manage.py ai_post_pc_news --url "$TARGET_URL"; fi
            ;;
        23) run_django python manage.py ai_model_name ;;
        24)
            echo "1) 全製品 / 2) 特定メーカー"
            read -p ">> " PRICE_MODE
            if [ "$PRICE_MODE" == "1" ]; then run_django python manage.py record_price_history --all
            elif [ "$PRICE_MODE" == "2" ]; then
                show_maker_menu
                read -p "番号: " PRICE_MK_NUM
                [[ -z "$PRICE_MK_NUM" || "$PRICE_MK_NUM" == "99" ]] && continue
                run_django python manage.py record_price_history --maker "${MAKERS[$PRICE_MK_NUM]}"
            fi
            ;;
        25)
            echo -e "\n${RED}⚠️ DBクリーンアップ${RESET}"
            show_maker_menu
            read -p "削除対象番号: " DEL_MK_NUM
            [[ -z "$DEL_MK_NUM" || "$DEL_MK_NUM" == "99" ]] && continue
            DEL_MID=${MID_MAP[${MAKERS[$DEL_MK_NUM]}]}
            read -p "${RED}本当に削除しますか？ (y/N): ${RESET}" DEL_CONFIRM
            if [[ "$DEL_CONFIRM" == "y" ]]; then
                run_django python manage.py shell <<EOF
from api.models import BcLinkshareProduct, PCProduct
from django.utils import timezone
mid = "$DEL_MID"
BcLinkshareProduct.objects.filter(mid=mid).delete()
PCProduct.objects.filter(affiliate_url__contains=mid).update(affiliate_url=None, affiliate_updated_at=timezone.now())
EOF
            fi
            ;;
        h) show_help ;;
        8) exit 0 ;;
        *) echo "無効な選択です。" ;;
    esac

    # VPS本番環境のみの自動処理
    if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14|20|24|25)$ ]]; then
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    fi
done