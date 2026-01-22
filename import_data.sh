#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別・製品データ運用ツール
# ==============================================================================
# 🛠 修正内容: メーカー選択メニューを「PC本体」「ソフト」「量販店」順に再編
# 🛠 修正内容: ASUS(43708)のAPIロジックを維持しつつ、既存FTPロジックを完全復旧
# 🛠 修正内容: API(◯)とFTP(×)で実行する管理コマンドを適切に分岐
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

# --- 2. データ定義 (MAKER_MAP / MID_MAP) ---
# カテゴリ別に並べ替え
MAKERS=(
    "" 
    "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse"          # PC本体 (1-10)
    "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom"                # BTO/その他 (11-17)
    "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext"             # ソフトウェア (18-23)
    "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo"            # 量販店・周辺機器 (24-30)
)

MAKER_NAMES=(
    ""
    "NEC得選街 [API◯]" "ソニーストア [API◯]" "富士通 (FMV) [FTP×]" "Dynabook [FTP×]" "HP [FTP×]" "Dell [FTP×]" "Lenovo" "ASUS [API◯] 🚀" "MSI" "マウスコンピューター"
    "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom"
    "ノートン [API◯]" "マカフィー [API◯]" "キングソフト [API◯]" "サイバーリンク [API◯]" "トレンドマイクロ [FTP×]" "ソースネクスト [FTP×]"
    "エディオン [API◯]" "コジマネット [API◯]" "ソフマップ [API◯]" "アキバ☆ソフマップ [API◯]" "リコレ!(中古) [API◯]" "ioPLAZA [API◯]" "EIZO [FTP×]"
)

# LinkShare MIDマッピング
declare -A MID_MAP
# PC本体
MID_MAP["nec"]="2780"
MID_MAP["sony"]="2980"
MID_MAP["fmv"]="2543"
MID_MAP["dynabook"]="36508"
MID_MAP["hp"]="35909"
MID_MAP["dell"]="2557"
MID_MAP["asus"]="43708"
# ソフトウェア
MID_MAP["norton"]="24732"
MID_MAP["mcafee"]="3388"
MID_MAP["kingsoft"]="24623"
MID_MAP["cyberlink"]="36855"
MID_MAP["trendmicro"]="24501"
MID_MAP["sourcenext"]="2633"
# 量販店・周辺機器
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

show_help() {
    echo -e "\n${COLOR}【SHIN-VPS 運用フロー】${RESET}"
    echo "1. [DB] スキーマ変更の反映。"
    echo "2. [Import] カテゴリ3から実行。API(◯)はAPI Parser、FTP(×)はMID FTPロジックで動作します。"
    echo "3. [Analysis] 解析が必要な製品に対し、カテゴリ17でスペック抽出。"
}

show_maker_menu() {
    echo -e "\n--- 対象メーカーを選択してください ---"
    echo -e "${YELLOW}[PC本体・大手]${RESET}"
    for i in {1..10}; do echo -e "${i}) ${MAKER_NAMES[$i]}"; done
    echo -e "\n${YELLOW}[BTO・その他PC]${RESET}"
    for i in {11..17}; do echo -e "${i}) ${MAKER_NAMES[$i]}"; done
    echo -e "\n${YELLOW}[ソフトウェア]${RESET}"
    for i in {18..23}; do echo -e "${i}) ${MAKER_NAMES[$i]}"; done
    echo -e "\n${YELLOW}[量販店・周辺機器]${RESET}"
    for i in {24..30}; do echo -e "${i}) ${MAKER_NAMES[$i]}"; done
    echo -e "\n31) 戻る / 指定なし"
}

# --- 4. メインルーチン ---

while true; do
    echo -e "\n---------------------------------------"
    echo -e "🚀 SHIN-VPS Data Import & Automation Tool"
    echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
    echo -e "---------------------------------------"
    echo "1) [DB]      マイグレーション実行 (スキーマ更新)"
    echo "2) [Import]  Tiper データ (Fanza/Duga) インポート"
    echo -e "3) ${COLOR}[Import]  メーカー別インポート・同期 ✨${RESET}"
    echo "4) [Import]  AV-Flash データのインポート"
    echo "5) [Admin]   スーパーユーザーの作成"
    echo -e "6) ${COLOR}[WP]      商品AI記事生成 & WordPress自動投稿${RESET}"
    echo -e "7) ${COLOR}[News]    PCパーツ最新ニュース投稿 (RSS/URL)${RESET}"
    echo "---------------------------------------"
    echo "12) [Analysis] 製品データをTSV出力 (分析用)"
    echo "13) [Master]   属性マスター(TSV)をインポート"
    echo -e "14) ${COLOR}[Auto]     属性自動マッピング実行 ⚡${RESET}"
    echo -e "15) ${COLOR}[SEO]      サイトマップ手動更新 (Sitemap.xml) 🌐${RESET}"
    echo -e "16) ${COLOR}[AI-M]     AIモデル一覧の確認 (Gemini/Gemma) 🤖${RESET}"
    echo -e "17) ${COLOR}[AI-Spec]  AI詳細スペック解析 (analyze_pc_spec) 🔥${RESET}"
    echo "---------------------------------------"
    echo "h) [Help]    使い方の説明"
    echo "8) 終了"
    echo "---------------------------------------"

    read -p "選択してください: " CHOICE

    case $CHOICE in
        1)
            run_django python manage.py makemigrations api
            run_django python manage.py migrate
            ;;
        2)
            run_django python manage.py import_t_duga
            run_django python manage.py import_t_fanza
            run_django python manage.py normalize_duga
            run_django python manage.py normalize_fanza
            ;;
        3)
            show_maker_menu
            read -p ">> " SUB_CHOICE
            [[ "$SUB_CHOICE" == "31" || -z "$SUB_CHOICE" ]] && continue
            
            SLUG=${MAKERS[$SUB_CHOICE]}
            MID=${MID_MAP[$SLUG]}

            case $SUB_CHOICE in
                # --- 個別スクラッチロジック ---
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

                # --- LinkShare API(◯) 独自ロジック (ASUS等) ---
                1|2|8|18|19|20|21|24|25|26|27|28|29)
                    if [ "$SLUG" == "asus" ]; then
                        echo -e "\n${COLOR}📡 LinkShare API 経由で取得中... (ASUS)${RESET}"
                        run_django python manage.py linkshare_bc_api_parser --mid 43708 --save-db --max-pages 5
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid 43708 --maker asus
                    else
                        echo -e "\n${COLOR}📡 LinkShare API 経由で同期中... (${MAKER_NAMES[$SUB_CHOICE]} MID:$MID)${RESET}"
                        run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
                        run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG"
                    fi
                    ;;

                # --- LinkShare FTP(×) 共通ロジック (FMV, Dell, HP, トレンド等) ---
                3|4|5|6|22|23|30)
                    if [ -n "$MID" ]; then
                        echo -e "\n${COLOR}📡 LinkShare FTP 経由で同期中... (${MAKER_NAMES[$SUB_CHOICE]} MID:$MID)${RESET}"
                        run_django python manage.py import_bc_mid_ftp --mid "$MID"
                    else
                        echo -e "${RED}[ERROR] MIDが定義されていません。${RESET}"
                    fi
                    ;;
                *) echo "無効な番号です。"; continue ;;
            esac

            echo -e "\n${YELLOW}>>> ${MAKER_NAMES[$SUB_CHOICE]} 同期完了。${RESET}"
            read -p "続けてAI詳細スペック解析を実行しますか？(y/n): " AI_CONFIRM
            if [[ "$AI_CONFIRM" == "y" ]]; then
                run_django python manage.py analyze_pc_spec --maker "$SLUG" --limit 999999
            fi
            ;;
        # (4番以降の管理メニューは既存のものをすべて維持)
        4)
            read -p "AV Flash ファイル名: " FILE_NAME
            run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME"
            ;;
        5) run_django python manage.py createsuperuser ;;
        6)
            echo "1: 1件 / 2: 5件連続 / 3: モデル確認"
            read -p "モード: " WP_CHOICE
            show_maker_menu
            read -p "メーカー番号 (空欄で全対象): " WP_MK_NUM
            MK_ARG=""
            [[ -n "$WP_MK_NUM" && "$WP_MK_NUM" -le 30 ]] && MK_ARG="--maker ${MAKERS[$WP_MK_NUM]}"
            if [ "$WP_CHOICE" == "1" ]; then run_django python manage.py ai_blog_from_db $MK_ARG
            elif [ "$WP_CHOICE" == "2" ]; then
                for i in {1..5}; do run_django python manage.py ai_blog_from_db $MK_ARG; sleep 10; done
            elif [ "$WP_CHOICE" == "3" ]; then run_django python manage.py ai_model_name
            fi
            ;;
        7)
            echo "1) RSS自動 / 2) URL指定"
            read -p ">> " NEWS_CHOICE
            if [ "$NEWS_CHOICE" == "1" ]; then run_django python manage.py ai_post_pc_news
            elif [ "$NEWS_CHOICE" == "2" ]; then
                read -p "URL: " TARGET_URL
                run_django python manage.py ai_post_pc_news --url "$TARGET_URL"
            fi
            ;;
        12)
            run_django python manage.py export_products
            echo -e "\n${COLOR}pc_products_analysis.tsv を出力しました。${RESET}"
            ;;
        13)
            read -p "TSVパス: " TSV_FILE
            run_django python manage.py import_specs "/usr/src/app/$TSV_FILE"
            ;;
        14)
            echo -e "\n${YELLOW}属性自動マッピングを実行中...⚡${RESET}"
            run_django python manage.py auto_map_attributes
            ;;
        15) update_sitemap ;;
        16) run_django python manage.py ai_model_name ;;
        17)
            show_maker_menu
            read -p "メーカー番号: " SPEC_MK_NUM
            [[ -z "$SPEC_MK_NUM" ]] && continue
            MK_NAME=${MAKERS[$SPEC_MK_NUM]}
            read -p "件数 (all/数値): " LM_ARG
            [[ -z "$LM_ARG" || "$LM_ARG" == "all" ]] && LM_ARG=999999
            run_django python manage.py analyze_pc_spec --maker "$MK_NAME" --limit "$LM_ARG"
            ;;
        h) show_help ;;
        8) exit 0 ;;
        *) echo "無効な選択です。" ;;
    esac

    # 本番環境のみの事後処理
    if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14|17)$ ]]; then
        echo -e "\n${COLOR}🔄 スケジューラーを再起動中...${RESET}"
        docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
        read -p "サイトマップも更新しますか？ (y/n): " CONFIRM
        [[ "$CONFIRM" == "y" ]] && update_sitemap
    fi
done