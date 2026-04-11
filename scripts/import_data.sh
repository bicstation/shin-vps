#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 統合運用ツール [ULTIMATE REBORN - v3.2 FULL SPEC]
# ==============================================================================

# スクリプトの場所からプロジェクトルートを特定
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_PATH/.." && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判別 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true; ENV_TYPE="PRODUCTION (VPS)"; COMPOSE_FILE="docker-compose.prod.yml"; COLOR="\e[32m"
    # デフォルトのベース (VPS)
    DEFAULT_BASE="http://$(hostname -I | awk '{print $1}'):8083"
else
    IS_VPS=false; ENV_TYPE="LOCAL (Development)"; COMPOSE_FILE="docker-compose.yml"; COLOR="\e[36m"
    # デフォルトのベース (Local)
    DEFAULT_BASE="http://api-tiper-host:8083"
fi

# コンテナ名設定
DJANGO_CON="django-v3"
NEXT_CON="next-bicstation-v3"

# 装飾
RESET="\e[0m"; RED="\e[31m"; YELLOW="\e[33m"; BLUE="\e[34m"; MAGENTA="\e[35m"; CYAN="\e[36m"; BOLD="\e[1m"; GREEN="\e[32m"

# --- 2. データ定義 ---
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]" "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]" "アーク(ark) [JSON]")

declare -A MID_MAP
MID_MAP["nec"]="2780"; MID_MAP["sony"]="2980"; MID_MAP["fmv"]="2543"; MID_MAP["dynabook"]="36508"; MID_MAP["hp"]="35909"; MID_MAP["dell"]="2557"; MID_MAP["asus"]="43708"; MID_MAP["norton"]="24732"; MID_MAP["mcafee"]="3388"; MID_MAP["kingsoft"]="24623"; MID_MAP["cyberlink"]="36855"; MID_MAP["trendmicro"]="24501"; MID_MAP["sourcenext"]="2633"; MID_MAP["edion"]="43098"; MID_MAP["kojima"]="13993"; MID_MAP["sofmap"]="37641"; MID_MAP["bic_sofmap"]="43262"; MID_MAP["recollect"]="43860"; MID_MAP["ioplazy"]="24172"; MID_MAP["eizo"]="3256"

# --- 3. 共通実行関数 ---
run_django() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T "$DJANGO_CON" python3 manage.py "$@"; }
run_django_raw() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T "$DJANGO_CON" "$@"; }
run_next() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T "$NEXT_CON" "$@"; }

# --- 4. 拡張機能 ---

# [全自動] パイプライン実行
run_pc_auto_update() {
    echo -e "\n${MAGENTA}${BOLD}🚀 [全自動] PCデータ更新パイプライン開始${RESET}"
    echo -e "${CYAN}📡 [1/4] FTP/API インポート中...${RESET}"
    FTP_MIDS=("35909" "2557" "2543" "36508")
    for mid in "${FTP_MIDS[@]}"; do run_django import_linkshare_data --mid "$mid"; done
    run_django linkshare_bc_api_parser --mid "43708" --save-db

    echo -e "${CYAN}🔄 [2/4] PCProduct DB同期中...${RESET}"
    SB="/usr/src/app/scrapers/src/shops"
    run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid "35909" --maker "hp" --prefix "HP"
    run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid "2557" --maker "dell" --prefix "DELL"
    run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid "2543" --maker "fujitsu" --prefix "FUJITSU"
    run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid "36508" --maker "dynabook" --prefix "DYNABOOK"
    run_django_raw python3 "$SB/import_bc_api_to_db.py" --mid "43708" --maker "asus"

    echo -e "${CYAN}🧠 [3/4] AIスペック解析中 (Limit: 50)...${RESET}"
    run_django analyze_pc_spec --limit 50 --null-only

    echo -e "${CYAN}🏷️ [4/4] 属性マスタ同期 & マッピング...${RESET}"
    docker cp "${PROJECT_ROOT}/django/master_data/attributes.tsv" "${DJANGO_CON}:/usr/src/app/master_data/attributes.tsv"
    run_django sync_master_attributes
    run_django auto_map_attributes
    echo -e "${GREEN}${BOLD}✅ 全工程完了しました！${RESET}"
}

show_maker_menu() {
    echo -e "\n${YELLOW}--- 対象メーカーを選択 ---${RESET}"
    for ((i=1; i<=31; i+=3)); do
        for ((j=i; j<i+3 && j<=31; j++)); do printf "%-2d) %-22s " "$j" "${MAKER_NAMES[$j]}"; done; echo "" 
    done
    echo -e "99) 戻る"
}

ensure_show_urls_cmd() {
    CMD_PATH="/usr/src/app/api/management/commands/show_urls.py"
    if ! run_django_raw ls "$CMD_PATH" > /dev/null 2>&1; then
        run_django_raw mkdir -p /usr/src/app/api/management/commands/
        run_django_raw tee "$CMD_PATH" <<EOF > /dev/null
from django.core.management.base import BaseCommand
from django.urls import get_resolver
class Command(BaseCommand):
    def handle(self, *args, **options):
        resolver = get_resolver(); self.show_urls(resolver.url_patterns)
    def show_urls(self, patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'): self.show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else: self.stdout.write(f"/{prefix + str(pattern.pattern)}")
EOF
    fi
}

# --- 5. メインループ ---
while true; do
    clear
    echo -e "${CYAN}==================================================================${RESET}"
    echo -e "🚀 ${BOLD}SHIN-VPS Automation Center v3.2${RESET} (Env: ${COLOR}${ENV_TYPE}${RESET})"
    echo -e "📂 Root: ${PROJECT_ROOT}"
    echo -e "${CYAN}==================================================================${RESET}"

    echo -e "${MAGENTA}${BOLD}[1. 🔞 ADULT CONTENT]${RESET}"
    echo -e "   10) FANZA/DUGA インポート     11) フロア階層同期 ✨"
    echo -e "   12) 作品AI解析 (Sommelier)    13) FANZA エクスプローラー"
    echo -e "   14) 女優スペック同期 (5万件)  15) AI 黄金比スタイル解析 💎"

    echo -e "\n${YELLOW}${BOLD}[2. 🛒 PC & SHOPPING SYNC]${RESET}"
    echo -e "   20) メーカー別個別同期        21) 価格履歴の一斉記録"
    echo -e "   23) 特定ショップDBデータ削除 🗑️"

    echo -e "\n${BLUE}${BOLD}[3. 🤖 AI WRITING & NEWS]${RESET}"
    echo -e "   30) 商品AI記事生成 & 投稿     31) パーツニュース投稿"
    echo -e "   32) AIスペック解析 (単発)     33) AIモデル一覧の確認"
    echo -e "   34) SEOタイトル一括更新 🔥    ${GREEN}35) [全自動] PCデータ更新 🚀${RESET}"

    echo -e "\n${CYAN}${BOLD}[4. 🛠️ SYSTEM & MASTER]${RESET}"
    echo -e "   40) マイグレーション (DB)     41) 属性マスタ同期/マッピング"
    echo -e "   42) サイトマップ手動更新      ${YELLOW}44) APIエンドポイント一覧 🔎${RESET}"

    echo -e "${CYAN}------------------------------------------------------------------${RESET}"
    echo -e "   h) Help   8/q) 終了"
    echo -e "${CYAN}------------------------------------------------------------------${RESET}"

    read -p "選択してください: " CHOICE
    case $CHOICE in
        10) 
            echo "1) 一括 / 2) DUGA / 3) FANZA / 5) Normalize"; read -p ">> " AC
            [[ "$AC" == "1" || "$AC" == "2" ]] && run_django import_t_duga --pages 1
            [[ "$AC" == "1" || "$AC" == "3" ]] && run_django import_t_fanza --pages 1
            [[ "$AC" == "5" ]] && run_django normalize_duga && run_django normalize_fanza ;;
        11) run_django sync_fanza_floors ;;
        12) run_django analyze_adult ;;
        13) run_django fanza_explorer ;;
        14) run_django import_t_fanza_actress ;;
        15) run_django analyze_actress_style ;;
        20) 
            show_maker_menu; read -p ">> " SUB; [[ "$SUB" == "99" || -z "$SUB" ]] && continue
            SLUG=${MAKERS[$SUB]}; MID=${MID_MAP[$SLUG]}
            run_django linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
            run_django_raw python3 "/usr/src/app/scrapers/src/shops/import_bc_api_to_db.py" --mid "$MID" --maker "$SLUG"
            run_django record_price_history --maker "$SLUG" ;;
        21) run_django record_price_history --all ;;
        23) 
            show_maker_menu; read -p "番号: " DS; [[ "$DS" == "99" ]] && continue
            run_django_raw python3 manage.py shell -c "from api.models.pc_products import PCProduct; PCProduct.objects.filter(maker__icontains='${MAKERS[$DS]}').delete(); print('🗑️ Deleted.')" ;;
        30) run_django ai_blog_from_db ;;
        31) run_django ai_post_pc_news ;;
        32) read -p "件数: " L; run_django analyze_pc_spec --limit "${L:-50}" ;;
        33) run_django ai_model_name ;;
        34) read -p "件数: " L; run_django analyze_pc_spec --limit "${L:-10}" --update-all ;;
        35) run_pc_auto_update ;;
        40) run_django makemigrations api && run_django migrate ;;
        41) 
            docker cp "${PROJECT_ROOT}/django/master_data/attributes.tsv" "${DJANGO_CON}:/usr/src/app/master_data/attributes.tsv"
            run_django sync_master_attributes && run_django auto_map_attributes ;;
        42) run_next node /app/generate-sitemap.mjs ;;
        44) 
            ensure_show_urls_cmd
            echo -e "\n${YELLOW}どのドメインのURLを表示しますか？${RESET}"
            echo "1) BicStation (api.bicstation.com / api-bicstation-host)"
            echo "2) Tiper (api.tiper.live / api-tiper-host)"
            echo "3) Bic-Saving (api.bic-saving.com / api-saving-host)"
            echo "4) AV-Flash (api.avflash.xyz / api-avflash-host)"
            echo "5) 環境デフォルト ($DEFAULT_BASE)"
            read -p ">> " DOMAIN_CHOICE
            
            case $DOMAIN_CHOICE in
                1) [[ "$IS_VPS" == "true" ]] && TARGET="https://api.bicstation.com" || TARGET="http://api-bicstation-host:8083" ;;
                2) [[ "$IS_VPS" == "true" ]] && TARGET="https://api.tiper.live" || TARGET="http://api-tiper-host:8083" ;;
                3) [[ "$IS_VPS" == "true" ]] && TARGET="https://api.bic-saving.com" || TARGET="http://api-saving-host:8083" ;;
                4) [[ "$IS_VPS" == "true" ]] && TARGET="https://api.avflash.xyz" || TARGET="http://api-avflash-host:8083" ;;
                *) TARGET="$DEFAULT_BASE" ;;
            esac

            echo -e "\n${GREEN}🌐 URL一覧を表示中: $TARGET${RESET}"
            run_django show_urls | sed "s|^\/|${TARGET}/|g" ;;
        8|q) exit 0 ;;
        h) echo "カテゴリ番号を選択して運用タスクを実行します。44番でドメイン別URL確認が可能です。" ;;
    esac
    echo -e "\n${GREEN}完了。Enterで戻ります。${RESET}"; read
done