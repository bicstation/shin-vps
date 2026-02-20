#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 統合運用ツール [ULTIMATE REBORN - COMPLETE]
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判別 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true; ENV_TYPE="PRODUCTION (VPS)"; COMPOSE_FILE="docker-compose.prod.yml"; DJANGO_CON="django-v2"; NEXT_CON="next-bicstation-v2"; COLOR="\e[32m"
    BASE_URL="http://$(hostname -I | awk '{print $1}'):8083" # VPS用グローバルIP想定
else
    IS_VPS=false; ENV_TYPE="LOCAL (Development)"; COMPOSE_FILE="docker-compose.yml"; DJANGO_CON="django-v2"; NEXT_CON="next-bicstation-v2"; COLOR="\e[36m"
    BASE_URL="http://127.0.0.1:8083"
fi

RESET="\e[0m"; RED="\e[31m"; YELLOW="\e[33m"; BLUE="\e[34m"; MAGENTA="\e[35m"; CYAN="\e[36m"; BOLD="\e[1m"; GREEN="\e[32m"

# --- 2. データ定義 ---
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]" "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]" "アーク(ark) [JSON]")
PC_KEYWORDS=("fmv" "lavie" "dynabook" "surface" "macbook" "lenovo")
EXCLUDE_KEYWORDS="ケース,カバー,フィルム,アダプタ,マウス,キーボード,バッグ,ケーブル"

declare -A MID_MAP
MID_MAP["nec"]="2780"; MID_MAP["sony"]="2980"; MID_MAP["fmv"]="2543"; MID_MAP["dynabook"]="36508"; MID_MAP["hp"]="35909"; MID_MAP["dell"]="2557"; MID_MAP["asus"]="43708"; MID_MAP["norton"]="24732"; MID_MAP["mcafee"]="3388"; MID_MAP["kingsoft"]="24623"; MID_MAP["cyberlink"]="36855"; MID_MAP["trendmicro"]="24501"; MID_MAP["sourcenext"]="2633"; MID_MAP["edion"]="43098"; MID_MAP["kojima"]="13993"; MID_MAP["sofmap"]="37641"; MID_MAP["bic_sofmap"]="43262"; MID_MAP["recollect"]="43860"; MID_MAP["ioplazy"]="24172"; MID_MAP["eizo"]="3256"

# --- 3. 共通実行関数 ---
run_django() { docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" "$@"; }
run_next() { docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" "$@"; }

# show_urls.py 生成関数
ensure_show_urls_cmd() {
    CMD_PATH="/usr/src/app/api/management/commands/show_urls.py"
    # ファイルが存在するかコンテナ内で確認
    if ! run_django ls "$CMD_PATH" > /dev/null 2>&1; then
        echo -e "${YELLOW}🛠️ show_urls コマンドを作成中...${RESET}"
        run_django mkdir -p /usr/src/app/api/management/commands/
        run_django touch /usr/src/app/api/management/__init__.py
        run_django touch /usr/src/app/api/management/commands/__init__.py
        run_django tee "$CMD_PATH" <<EOF > /dev/null
from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = 'Display all URL patterns'
    def handle(self, *args, **options):
        resolver = get_resolver()
        self.show_urls(resolver.url_patterns)

    def show_urls(self, patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                self.show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                path = prefix + str(pattern.pattern)
                # パスの整形（アンカー削除、ダブルスラッシュ修正）
                clean_path = path.replace('^', '').replace('$', '').replace('//', '/')
                self.stdout.write(f"/{clean_path}")
EOF
        echo -e "${GREEN}✅ 作成完了。${RESET}"
    fi
}

update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    if [ -f "$MJS_SRC" ]; then docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
    else echo -e "${RED}[ERROR] $MJS_SRC が見つかりません。${RESET}"; return 1; fi
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

# --- 4. メインループ ---
while true; do
    clear
    echo -e "${CYAN}==================================================================${RESET}"
    echo -e "🚀 ${BOLD}SHIN-VPS Automation Center${RESET}  (Env: ${COLOR}${ENV_TYPE}${RESET})"
    echo -e "${CYAN}==================================================================${RESET}"

    echo -e "${MAGENTA}${BOLD}[1. 🔞 ADULT CONTENT]${RESET}"
    echo -e "  10) FANZA/DUGA インポート (Tiper)   11) FANZA サービス・フロア階層同期 ✨"
    echo -e "  12) アダルト作品AI解析 (Sommelier)  13) FANZA APIエクスプローラー"

    echo -e "\n${YELLOW}${BOLD}[2. 🛒 PC & SHOPPING SYNC]${RESET}"
    echo -e "  20) メーカー別同期 (API/FTP/Scrape) 21) 価格履歴の一斉記録 (Record)"
    echo -e "  22) AV-Flash インポート             23) 特定ショップDBデータ一括削除 🗑️"

    echo -e "\n${BLUE}${BOLD}[3. 🤖 AI WRITING & NEWS]${RESET}"
    echo -e "  30) 商品AI記事生成 & WordPress投稿  31) PCパーツ最新ニュース投稿 (RSS/URL)"
    echo -e "  32) AI詳細スペック解析 (PC解析)      33) AIモデル一覧の確認 (Gemini/Gemma)"

    echo -e "\n${CYAN}${BOLD}[4. 🛠️ SYSTEM & MASTER]${RESET}"
    echo -e "  40) マイグレーション (DB更新)         41) 属性マスタ同期 & 自動マッピング"
    echo -e "  42) サイトマップ手動更新 (SEO)       43) スーパーユーザー作成 / TSV出力"
    echo -e "  44) APIエンドポイント一覧表示 (URL) 🔍"

    echo -e "${CYAN}------------------------------------------------------------------${RESET}"
    echo -e "  h) Help    8/q) 終了"
    echo -e "${CYAN}------------------------------------------------------------------${RESET}"

    read -p "選択してください: " CHOICE
    case $CHOICE in
        # --- 1. ADULT SECTION ---
        10)
            echo -e "\n${YELLOW}--- 🔞 ADULT IMPORT & RE-SYNC ---${RESET}"
            echo "1) 一括取得 / 2) DUGAのみ / 3) FANZAのみ / 4) Reset(未処理戻し) / 5) Normalize(正規化) / 6) RawDelete"
            read -p ">> " ADULT_CHOICE
            case $ADULT_CHOICE in
                1|2|3)
                    read -p "開始ページ (デフォルト: 1): " START_PG; START_PG=${START_PG:-1}
                    read -p "取得ページ数 (デフォルト: 1): " PG_COUNT; PG_COUNT=${PG_COUNT:-1}
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "2" ]]; then
                        echo -e "\n${COLOR}📡 DUGA 生データのインポートを開始します...${RESET}"
                        run_django python manage.py import_t_duga --start_page "$START_PG" --pages "$PG_COUNT"
                    fi
                    if [[ "$ADULT_CHOICE" == "1" || "$ADULT_CHOICE" == "3" ]]; then
                        echo -e "\n${COLOR}📡 FANZA 生データのインポートを開始します...${RESET}"
                        run_django python manage.py import_t_fanza --start_page "$START_PG" --pages "$PG_COUNT"
                    fi 
                    echo -e "\n${YELLOW}自動正規化(Normalize)を実行しますか？ (y/N): ${RESET}"
                    read N_CONFIRM; [[ "$N_CONFIRM" == "y" ]] && run_django python manage.py normalize_duga && run_django python manage.py normalize_fanza;;
                4)
                    echo -e "\n${CYAN}どのソースをリセット（未処理に戻す）しますか？${RESET}"
                    echo "1) ALL / 2) FANZA / 3) DMM / 4) DUGA"
                    read -p ">> " RST_CHOICE
                    case $RST_CHOICE in
                        1) run_django python manage.py reset_api_migration ;;
                        2) run_django python manage.py reset_api_migration --site fanza ;;
                        3) run_django python manage.py reset_api_migration --site dmm ;;
                        4) run_django python manage.py reset_api_migration --site duga ;;
                    esac ;;
                5)
                    run_django python manage.py normalize_duga &&
                    run_django python manage.py normalize_fanza ;;
                6)
                    read -p "処理済み生データを物理削除しますか？ (y/N): " CLEAN_RAW_CONFIRM
                    if [[ "$CLEAN_RAW_CONFIRM" == "y" ]]; then
                        run_django python manage.py shell <<EOF
from api.models import RawApiData
qs = RawApiData.objects.filter(migrated=True)
count = qs.count(); qs.delete(); print(f"✅ {count} 件の処理済み生データを削除しました。")
EOF
                    fi ;;
            esac ;;
        11) run_django python manage.py sync_fanza_floors;;
        12) 
            echo -e "\n1) DUGA / 2) FANZA / 3) All"; read -p "ブランド: " BRAND_CHOICE
            BRAND_ARG=""; [[ "$BRAND_CHOICE" == "1" ]] && BRAND_ARG="--brand DUGA"; [[ "$BRAND_CHOICE" == "2" ]] && BRAND_ARG="--brand FANZA"
            echo "1) 未解析 / 2) ID指定 / 3) 強制"; read -p "モード: " ADULT_AI_MODE
            LIMIT_ARG="--limit 50"; FORCE_ARG=""; ID_ARG=""
            if [ "$ADULT_AI_MODE" == "1" ]; then read -p "処理件数 (デフォルト50): " ADULT_LIMIT; LIMIT_ARG="--limit ${ADULT_LIMIT:-50}"
            elif [ "$ADULT_AI_MODE" == "2" ]; then read -p "プロダクトID: " TARGET_PID; ID_ARG="$TARGET_PID"; LIMIT_ARG=""
            elif [ "$ADULT_AI_MODE" == "3" ]; then FORCE_ARG="--force"; read -p "処理件数 (デフォルト100): " ADULT_LIMIT; LIMIT_ARG="--limit ${ADULT_LIMIT:-100}"; fi
            run_django python manage.py analyze_adult $ID_ARG $LIMIT_ARG $FORCE_ARG $BRAND_ARG ;;
        13) run_django python manage.py fanza_explorer ;;

        # --- 2. PC & SHOP SECTION ---
        20) 
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
                        for KW in "${PC_KEYWORDS[@]}"; do run_django python manage.py linkshare_bc_api_parser --mid "$MID" --keyword "$KW" --none "$EXCLUDE_KEYWORDS" --save-db --limit 100; done
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    else
                        run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    fi ;;
                3|4|5|6|22|23|30) run_django python manage.py import_bc_mid_ftp --mid "$MID" ;;
            esac
            echo -e "\n${YELLOW}>>> 同期完了。価格履歴を自動更新中...${RESET}"
            run_django python manage.py record_price_history --maker "$SLUG"
            read -p "続けてAI詳細スペック解析を実行しますか？(y/n): " AI_CONFIRM
            [[ "$AI_CONFIRM" == "y" ]] && run_django python manage.py analyze_pc_spec --maker "$SLUG" --limit 999999 ;;
        21) 
            echo -e "\n1) 全製品 / 2) 特定メーカー"; read -p ">> " PRICE_MODE
            if [ "$PRICE_MODE" == "1" ]; then run_django python manage.py record_price_history --all
            else show_maker_menu; read -p "メーカー番号: " PRICE_MK_NUM; [[ -n "$PRICE_MK_NUM" ]] && run_django python manage.py record_price_history --maker "${MAKERS[$PRICE_MK_NUM]}"; fi ;;
        22) 
            read -p "AV Flash ファイル名: " FILE_NAME; run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME" ;;
        23) 
            show_maker_menu; read -p "削除対象メーカー番号: " DEL_MK_NUM; [[ -z "$DEL_MK_NUM" || "$DEL_MK_NUM" == "99" ]] && continue
            D_SLUG=${MAKERS[$DEL_MK_NUM]}; D_MID=${MID_MAP[$D_SLUG]}
            read -p "$D_SLUG (MID:$D_MID) を削除しますか？ (y/N): " DEL_CONFIRM
            if [[ "$DEL_CONFIRM" == "y" ]]; then run_django python manage.py shell <<EOF
from api.models import BcLinkshareProduct, PCProduct
from django.utils import timezone
BcLinkshareProduct.objects.filter(mid="$D_MID").delete()
PCProduct.objects.filter(affiliate_url__contains="$D_MID").update(affiliate_url=None, affiliate_updated_at=timezone.now())
print(f"✅ {D_SLUG} のリンク解除と生データ削除を完了しました。")
EOF
            fi ;;

        # --- 3. AI & NEWS SECTION ---
        30) 
            echo "1) 1件 / 2) 5件 / 3) モデル確認"; read -p ">> " WP_CHOICE
            show_maker_menu; read -p "メーカー番号 (空欄で全対象): " WP_MK_NUM
            MK_ARG=""; [[ -n "$WP_MK_NUM" ]] && MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
            if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db $MK_ARG
            elif [ "$WP_CHOICE" == "2" ]; then for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
            else run_django python manage.py ai_model_name; fi ;;
        31) 
            echo "1) RSS自動 / 2) URL指定"; read -p ">> " NEWS_CHOICE
            if [ "$NEWS_CHOICE" == "1" ]; then run_django python manage.py ai_post_pc_news
            elif [ "$NEWS_CHOICE" == "2" ]; then read -p "URL: " TARGET_URL; run_django python manage.py ai_post_pc_news --url "$TARGET_URL"; fi ;;
        32) 
            show_maker_menu; read -p "解析メーカー番号 (番号/all): " SPEC_MK_VAL
            MK_ARG=""; [[ "$SPEC_MK_VAL" != "all" ]] && MK_ARG="--maker ${MAKERS[$SPEC_MK_VAL]}"
            read -p "未解析分のみ実行しますか？ (y/n): " ONLY_NULL
            NULL_ARG=""; [[ "$ONLY_NULL" == "y" ]] && NULL_ARG="--null-only"
            run_django python manage.py analyze_pc_spec $MK_ARG $NULL_ARG --limit 999999 ;;
        33) 
            run_django python manage.py ai_model_name ;;

        # --- 4. SYSTEM SECTION ---
        40) 
            run_django python manage.py makemigrations api; run_django python manage.py migrate ;;
        41) 
            echo "1) マスタImport & AutoMap / 2) AutoMapのみ"; read -p ">> " MASTER_CHOICE
            if [ "$MASTER_CHOICE" == "1" ]; then
                run_django python manage.py import_specs "/usr/src/app/master_data/attributes.tsv"
                run_django python manage.py auto_map_attributes
            else run_django python manage.py auto_map_attributes; fi ;;
        42) 
            update_sitemap ;;
        43) 
            echo "1) スーパーユーザー作成 / 2) 製品TSV出力"; read -p ">> " SYS_CHOICE
            if [ "$SYS_CHOICE" == "1" ]; then run_django python manage.py createsuperuser
            else run_django python manage.py export_products; fi ;;
        44)
            echo -e "\n${CYAN}🔎 有効なAPIエンドポイントを一覧表示します...${RESET}"
            ensure_show_urls_cmd
            echo -e "${YELLOW}ベースURL: ${BASE_URL}${RESET}\n"
            # 出力の置換。行頭のスラッシュをベースURLに書き換える
            run_django python manage.py show_urls | sed "s|^\/|${BASE_URL}/|g"
            ;;

        8|q) exit 0 ;;
        h) echo "SHIN-VPS Help: 各カテゴリの番号を選択して運用を開始してください。" ;;
    esac

    # ポスト処理
    if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(10|11|12|20|21|23|32|41)$ ]]; then
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    fi
    echo -e "\n${GREEN}処理完了。Enterで戻ります。${RESET}"; read
done