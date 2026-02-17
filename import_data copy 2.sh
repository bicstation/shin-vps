#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別・製品データ運用ツール [FINAL STEALTH VERSION]
# ==============================================================================
# 🛠 コンセプト: 元のロジックを1ミリも改変せず、視認性のみを向上
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判別 (完全同一) ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true; ENV_TYPE="PRODUCTION (VPS)"; COMPOSE_FILE="docker-compose.prod.yml"; DJANGO_CON="django-v2"; NEXT_CON="next-bicstation-v2"; COLOR="\e[32m"
else
    IS_VPS=false; ENV_TYPE="LOCAL (Development)"; COMPOSE_FILE="docker-compose.yml"; DJANGO_CON="django-v2"; NEXT_CON="next-bicstation-v2"; COLOR="\e[36m"
fi

RESET="\e[0m"; RED="\e[31m"; YELLOW="\e[33m"; BLUE="\e[34m"; MAGENTA="\e[35m"; CYAN="\e[36m"; BOLD="\e[1m"; GREEN="\e[32m"

# --- 2. データ定義 (完全継承) ---
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]" "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]" "アーク(ark) [JSON]")
PC_KEYWORDS=("fmv" "lavie" "dynabook" "surface" "macbook" "lenovo")
EXCLUDE_KEYWORDS="ケース,カバー,フィルム,アダプタ,マウス,キーボード,バッグ,ケーブル"

declare -A MID_MAP
MID_MAP["nec"]="2780"; MID_MAP["sony"]="2980"; MID_MAP["fmv"]="2543"; MID_MAP["dynabook"]="36508"; MID_MAP["hp"]="35909"; MID_MAP["dell"]="2557"; MID_MAP["asus"]="43708"; MID_MAP["norton"]="24732"; MID_MAP["mcafee"]="3388"; MID_MAP["kingsoft"]="24623"; MID_MAP["cyberlink"]="36855"; MID_MAP["trendmicro"]="24501"; MID_MAP["sourcenext"]="2633"; MID_MAP["edion"]="43098"; MID_MAP["kojima"]="13993"; MID_MAP["sofmap"]="37641"; MID_MAP["bic_sofmap"]="43262"; MID_MAP["recollect"]="43860"; MID_MAP["ioplazy"]="24172"; MID_MAP["eizo"]="3256"

# --- 3. 共通実行関数 (完全継承) ---
run_django() { docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" "$@"; }
run_next() { docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" "$@"; }
update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    run_next node /app/generate-sitemap.mjs
}
show_maker_menu() {
    echo -e "\n${YELLOW}--- 対象メーカーを選択 (横3列表示) ---${RESET}"
    for ((i=1; i<=31; i+=3)); do
        for ((j=i; j<i+3 && j<=31; j++)); do printf "%-2d) %-22s " "$j" "${MAKER_NAMES[$j]}"; done; echo "" 
    done
    echo -e "99) 戻る / 指定なし"
}

# --- 4. メインルーチン ---
while true; do
    echo -e "\n${CYAN}---------------------------------------${RESET}"
    echo -e "🚀 ${BOLD}SHIN-VPS Data Import & Automation Tool${RESET}"
    echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
    echo -e "${CYAN}---------------------------------------${RESET}"
    echo -e "1) [DB]      マイグレーション実行"
    echo -e "2) [Import]  ${MAGENTA}Tiperデータ (Fanza/Duga) 🔞${RESET}"
    echo -e "3) [Import]  ${COLOR}メーカー別同期 (API/FTP/Scrape)${RESET}"
    echo -e "4) [Import]  AV-Flash インポート"
    echo -e "5) [Admin]   スーパーユーザー作成"
    echo -e "6) [WP]      ${COLOR}商品AI記事生成 & WP自動投稿${RESET}"
    echo -e "7) [News]    ${COLOR}PCパーツ最新ニュース投稿${RESET}"
    echo -e "---------------------------------------"
    echo -e "12) [Analysis] 製品データをTSV出力"
    echo -e "13) [Master]   属性マスター(TSV)をインポート"
    echo -e "14) [Auto]     ${COLOR}属性自動マッピング実行 ⚡${RESET}"
    echo -e "15) [SEO]      ${COLOR}サイトマップ手動更新 🌐${RESET}"
    echo -e "16) [AI-M]     AIモデル一覧の確認"
    echo -e "17) [AI-Spec]  ${COLOR}AI詳細スペック解析 🔥${RESET}"
    echo -e "18) [Price]    ${COLOR}価格履歴の一斉記録 📈${RESET}"
    echo -e "19) [Admin]    ${RED}特定ショップDBデータ一括削除 🗑️${RESET}"
    echo -e "20) [AI-Adult] ${MAGENTA}アダルト作品AI解析 🔞${RESET}"
    echo -e "21) [Test]     ${YELLOW}FANZA API エクスプローラー 🔍${RESET}"
    echo -e "---------------------------------------"
    echo -e "h) [Help]    8) 終了"
    echo -e "${CYAN}---------------------------------------${RESET}"

    read -p "選択してください: " CHOICE

    case $CHOICE in
        1) run_django python manage.py makemigrations api; run_django python manage.py migrate ;;
        2) # --- 元の case 2 を完全移植 ---
            echo -e "\n${YELLOW}--- 🔞 FANZA / DUGA インポート管理メニュー ---${RESET}"
            echo "1) 全ブランド一括 / 2) DUGAのみ / 3) FANZAのみ / 4) F-Reset / 5) D-Reset / 6) Normalize / 7) RawDelete"
            read -p ">> " ADULT_CHOICE
            case $ADULT_CHOICE in
                1|2|3)
                    read -p "開始ページ (デフォルト: 1): " START_PG; START_PG=${START_PG:-1}
                    read -p "取得ページ数 (1P=100件 / デフォルト: 1): " PG_COUNT; PG_COUNT=${PG_COUNT:-1}
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "2" ]]; then
                        run_django python manage.py import_t_duga --start_page "$START_PG" --pages "$PG_COUNT"
                        run_django python manage.py normalize_duga
                    fi
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "3" ]]; then
                        run_django python manage.py import_t_fanza --start_page "$START_PG" --pages "$PG_COUNT"
                        run_django python manage.py normalize_fanza
                    fi ;;
                4) run_django python manage.py reset_fanza_migration ;;
                5) run_django python manage.py reset_duga_migration ;;
                6) run_django python manage.py normalize_duga; run_django python manage.py normalize_fanza ;;
                7) read -p "処理済みの生データをDBから削除? (y/N): " CLEAN_RAW_CONFIRM
                   if [[ "$CLEAN_RAW_CONFIRM" == "y" ]]; then
                       run_django python manage.py shell <<EOF
from api.models import RawApiData
qs = RawApiData.objects.filter(migrated=True)
count = qs.count(); qs.delete(); print(f"✅ {count} 件削除しました。")
EOF
                   fi ;;
            esac ;;
        3) # --- 元の case 3 を完全移植 ---
            show_maker_menu; read -p ">> " SUB_CHOICE
            [[ "$SUB_CHOICE" == "99" || -z "$SUB_CHOICE" ]] && continue
            SLUG=${MAKERS[$SUB_CHOICE]}; MID=${MID_MAP[$SLUG]}
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
                    fi ;;
                3|4|5|6|22|23|30) run_django python manage.py import_bc_mid_ftp --mid "$MID" ;;
            esac
            run_django python manage.py record_price_history --maker "$SLUG"
            read -p "AI詳細スペック解析を実行しますか？(y/n): " AI_CONFIRM
            [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker "$SLUG" --limit 999999 ;;
        4) read -p "AV Flash ファイル名: " FILE_NAME; run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME" ;;
        5) run_django python manage.py createsuperuser ;;
        6) # --- 元の case 6 を完全移植 ---
            echo "1: 1件 / 2: 5件 / 3: モデル確認"; read -p "モード: " WP_CHOICE
            show_maker_menu; read -p "メーカー番号: " WP_MK_NUM
            MK_ARG=""; [[ -n "$WP_MK_NUM" && "$WP_MK_NUM" -le 31 ]] && MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
            if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db $MK_ARG
            elif [ "$WP_CHOICE" == "2" ]; then for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
            else run_django python manage.py ai_model_name; fi ;;
        7) # --- 元の case 7 を完全移植 ---
            echo "1) RSS / 2) URL"; read -p ">> " NEWS_CHOICE
            if [ "$NEWS_CHOICE" == "1" ]; then run_django python manage.py ai_post_pc_news
            else read -p "URL: " TARGET_URL; run_django python manage.py ai_post_pc_news --url "$TARGET_URL"; fi ;;
        12) run_django python manage.py export_products ;;
        13) # --- 元の case 13 を完全移植 ---
            FIXED_TS="/usr/src/app/master_data/attributes.tsv"
            run_django python manage.py import_specs "$FIXED_TS"
            run_django python manage.py auto_map_attributes ;;
        14) run_django python manage.py auto_map_attributes ;;
        15) update_sitemap ;;
        16) run_django python manage.py ai_model_name ;;
        17) # --- 元の case 17 を完全移植 ---
            show_maker_menu; read -p "メーカー指定 (番号/all): " SPEC_MK_VAL
            MK_ARG=""; [[ "$SPEC_MK_VAL" != "all" ]] && MK_ARG="--maker ${MAKERS[$SPEC_MK_VAL]}"
            read -p "未解析分のみ？ (y/n): " ONLY_NULL; NULL_ARG=""; [[ "$ONLY_NULL" == "y" ]] && NULL_ARG="--null-only"
            run_django python manage.py analyze_pc_spec $MK_ARG $NULL_ARG --limit 999999 ;;
        18) # --- 元の case 18 を完全移植 ---
            echo "1) 全記録 / 2) メーカー指定"; read -p ">> " PRICE_MODE
            if [ "$PRICE_MODE" == "1" ]; then run_django python manage.py record_price_history --all
            else show_maker_menu; read -p "番号: " P_MK_N; [[ -n "$P_MK_N" ]] && run_django python manage.py record_price_history --maker "${MAKERS[$P_MK_N]}"; fi ;;
        19) # --- 元の case 19 を完全移植 ---
            show_maker_menu; read -p "削除対象番号: " DEL_MK_NUM; [[ -z "$DEL_MK_NUM" ]] && continue
            D_MID=${MID_MAP[${MAKERS[$DEL_MK_NUM]}]}; read -p "本当に削除しますか？ (y/N): " D_CONF
            if [[ "$D_CONF" == "y" ]]; then run_django python manage.py shell <<EOF
from api.models import BcLinkshareProduct, PCProduct
from django.utils import timezone
BcLinkshareProduct.objects.filter(mid="$D_MID").delete()
PCProduct.objects.filter(affiliate_url__contains="$D_MID").update(affiliate_url=None, affiliate_updated_at=timezone.now())
EOF
            fi ;;
        20) # --- 元の case 20 を完全移植 ---
            read -p "1)DUGA 2)FANZA 3)All: " B_C; B_ARG=""; [[ "$B_C" == "1" ]] && B_ARG="--brand DUGA"; [[ "$B_C" == "2" ]] && B_ARG="--brand FANZA"
            echo "1)Limit 2)ID 3)Force"; read -p ">> " A_M
            L_ARG="--limit 50"; F_ARG=""; ID_ARG=""
            if [ "$A_M" == "1" ]; then read -p "件数: " L_V; L_ARG="--limit ${L_V:-50}"
            elif [ "$A_M" == "2" ]; then read -p "ID: " T_ID; ID_ARG="$T_ID"; L_ARG=""
            elif [ "$A_M" == "3" ]; then F_ARG="--force"; read -p "件数: " L_V; L_ARG="--limit ${L_V:-100}"; fi
            run_django python manage.py analyze_adult $ID_ARG $L_ARG $F_ARG $B_ARG ;;
        21) run_django python manage.py fanza_explorer ;;
        8) exit 0 ;;
        h) echo "SHIN-VPS Help: 1-21の番号を入力してタスクを実行します。" ;;
    esac

    # VPS環境かつ特定タスク実行後のスケジューラー再起動
    if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(2|3|13|14|17|18|19|20|21)$ ]]; then
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    fi
done