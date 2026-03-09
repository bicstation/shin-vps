#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 統合運用ツール [ULTIMATE REBORN - v3 FULL SPEC]
# ==============================================================================

# スクリプトの場所からプロジェクトルート（一つ上）を特定
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_PATH/.." && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判別 (Marya はローカルとして判定) ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true; ENV_TYPE="PRODUCTION (VPS)"; COMPOSE_FILE="docker-compose.prod.yml"; COLOR="\e[32m"
    BASE_URL="http://$(hostname -I | awk '{print $1}'):8083"
else
    IS_VPS=false; ENV_TYPE="LOCAL (Development)"; COMPOSE_FILE="docker-compose.yml"; COLOR="\e[36m"
    BASE_URL="http://api-tiper-host:8083"
fi

# コンテナ名は v3 で統一
DJANGO_CON="django-v3"
NEXT_CON="next-bicstation-v3"

RESET="\e[0m"; RED="\e[31m"; YELLOW="\e[33m"; BLUE="\e[34m"; MAGENTA="\e[35m"; CYAN="\e[36m"; BOLD="\e[1m"; GREEN="\e[32m"

# --- 2. データ定義 ---
MAKERS=("DUMMY" "nec" "sony" "fmv" "dynabook" "hp" "dell" "lenovo" "asus" "msi" "mouse" "acer" "minisforum" "geekom" "vspec" "storm" "frontier" "sycom" "norton" "mcafee" "kingsoft" "cyberlink" "trendmicro" "sourcenext" "edion" "kojima" "sofmap" "bic_sofmap" "recollect" "ioplazy" "eizo" "ark")
MAKER_NAMES=("DUMMY" "NEC [FTP]" "Sony [API]" "富士通FMV [FTP]" "Dynabook [FTP]" "HP [FTP]" "Dell [FTP]" "Lenovo" "ASUS [API]" "MSI" "Mouse" "Acer" "Minisforum" "GEEKOM" "VSPEC" "STORM" "FRONTIER" "Sycom" "ノートン [API]" "マカフィー [API]" "キングソフト [API]" "サイバーリンク [API]" "トレンドマイクロ [FTP]" "ソースネクスト [FTP]" "エディオン [API]" "コジマネット [API]" "ソフマップ [API]" "アキバソフマップ [API]" "リコレ!(中古) [API]" "ioPLAZA [API]" "EIZO [FTP]" "アーク(ark) [JSON]")

declare -A MID_MAP
MID_MAP["nec"]="2780"; MID_MAP["sony"]="2980"; MID_MAP["fmv"]="2543"; MID_MAP["dynabook"]="36508"; MID_MAP["hp"]="35909"; MID_MAP["dell"]="2557"; MID_MAP["asus"]="43708"; MID_MAP["norton"]="24732"; MID_MAP["mcafee"]="3388"; MID_MAP["kingsoft"]="24623"; MID_MAP["cyberlink"]="36855"; MID_MAP["trendmicro"]="24501"; MID_MAP["sourcenext"]="2633"; MID_MAP["edion"]="43098"; MID_MAP["kojima"]="13993"; MID_MAP["sofmap"]="37641"; MID_MAP["bic_sofmap"]="43262"; MID_MAP["recollect"]="43860"; MID_MAP["ioplazy"]="24172"; MID_MAP["eizo"]="3256"

# --- 3. 共通実行関数 (PROJECT_ROOT で実行) ---
run_django() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec "$DJANGO_CON" "$@"; }
run_next() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec "$NEXT_CON" "$@"; }

update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    run_next node /app/generate-sitemap.mjs
}

ensure_show_urls_cmd() {
    CMD_PATH="/usr/src/app/api/management/commands/show_urls.py"
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
                clean_path = path.replace('^', '').replace('$', '').replace('//', '/')
                self.stdout.write(f"/{clean_path}")
EOF
        echo -e "${GREEN}✅ 作成完了。${RESET}"
    fi
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
    echo -e "🚀 ${BOLD}SHIN-VPS Automation Center v3${RESET} (Env: ${COLOR}${ENV_TYPE}${RESET})"
    echo -e "📂 Root: ${PROJECT_ROOT}"
    echo -e "${CYAN}==================================================================${RESET}"

    echo -e "${MAGENTA}${BOLD}[1. 🔞 ADULT CONTENT]${RESET}"
    echo -e "   10) FANZA/DUGA インポート (Tiper)   11) FANZA サービス・フロア階層同期 ✨"
    echo -e "   12) アダルト作品AI解析 (Sommelier)  13) FANZA APIエクスプローラー & 解析 🔍"
    echo -e "   14) FANZA 女優スペック同期 (5万件)  15) AI 黄金比スタイル解析 💎"

    echo -e "\n${YELLOW}${BOLD}[2. 🛒 PC & SHOPPING SYNC]${RESET}"
    echo -e "   20) メーカー別同期 (API/FTP/Scrape) 21) 価格履歴の一斉記録 (Record)"
    echo -e "   22) AV-Flash インポート             23) 特定ショップDBデータ一括削除 🗑️"

    echo -e "\n${BLUE}${BOLD}[3. 🤖 AI WRITING & NEWS]${RESET}"
    echo -e "   30) 商品AI記事生成 & WordPress投稿  31) PCパーツ最新ニュース投稿 (RSS/URL)"
    echo -e "   32) AI詳細スペック解析 (PC解析)     33) AIモデル一覧の確認 (Gemini/Gemma)"
    echo -e "   34) 【一括】既存行のSEOタイトル更新 (PC解析 --update-all) 🔥"

    echo -e "\n${CYAN}${BOLD}[4. 🛠️ SYSTEM & MASTER]${RESET}"
    echo -e "   40) マイグレーション (DB更新)       41) 属性マスタ同期 & 自動マッピング"
    echo -e "   42) サイトマップ手動更新 (SEO)      43) スーパーユーザー作成 / TSV出力"
    echo -e "   44) APIエンドポイント一覧表示 🔎"

    echo -e "${CYAN}------------------------------------------------------------------${RESET}"
    echo -e "   h) Help    8/q) 終了"
    echo -e "${CYAN}------------------------------------------------------------------${RESET}"

    read -p "選択してください: " CHOICE
    case $CHOICE in
        10)
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
        11) run_django python manage.py sync_fanza_floors;;
        12) run_django python manage.py analyze_adult ;;
        13) run_django python manage.py fanza_explorer ;;
        14) run_django python manage.py import_t_fanza_actress ;;
        15) run_django python manage.py analyze_actress_style ;;
        20) 
            show_maker_menu; read -p ">> " SUB_CHOICE
            [[ "$SUB_CHOICE" == "99" || -z "$SUB_CHOICE" ]] && continue
            SLUG=${MAKERS[$SUB_CHOICE]}; MID=${MID_MAP[$SLUG]}
            case $SUB_CHOICE in
                7)  run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/scrape_lenovo.py ;;
                10) run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py ;;
                *)  run_django python manage.py linkshare_bc_api_parser --mid "$MID" --save-db --limit 100
                    run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_bc_api_to_db.py --mid "$MID" --maker "$SLUG" ;;
            esac
            run_django python manage.py record_price_history --maker "$SLUG" ;;
        21) run_django python manage.py record_price_history --all ;;
        22) read -p "ファイル名: " FILE_NAME; run_django python manage.py import_av "/usr/src/app/data/$FILE_NAME" ;;
        23) 
            show_maker_menu; read -p "削除対象メーカーの番号: " DEL_SUB
            [[ "$DEL_SUB" == "99" || -z "$DEL_SUB" ]] && continue
            DEL_SLUG=${MAKERS[$DEL_SUB]}
            read -p "本当に ${DEL_SLUG} の製品データを削除しますか？ (y/N): " DEL_CONFIRM
            [[ "$DEL_CONFIRM" == "y" ]] && run_django python manage.py shell -c "from api.models.pc_products import PCProduct; PCProduct.objects.filter(maker__icontains='$DEL_SLUG').delete(); print('🗑️ Deleted.')" ;;
        30) run_django python manage.py ai_blog_from_db ;;
        31) run_django python manage.py ai_post_pc_news ;;
        32) 
            read -p "処理件数 (100): " LIMIT; LIMIT=${LIMIT:-100}
            run_django python manage.py analyze_pc_spec --limit "$LIMIT" ;;
        33) run_django python manage.py ai_model_name ;;
        34) 
            echo -e "\n${RED}${BOLD}🔥 既存行のSEOタイトル一括更新モード${RESET}"
            read -p "更新件数 (10): " LIMIT; LIMIT=${LIMIT:-10}
            read -p "メーカー絞り込み (省略可): " M_FLT
            if [ -n "$M_FLT" ]; then
                run_django python manage.py analyze_pc_spec --limit "$LIMIT" --maker "$M_FLT" --update-all
            else
                run_django python manage.py analyze_pc_spec --limit "$LIMIT" --update-all
            fi ;;
        40) 
            echo -e "\n${YELLOW}🛠️ マイグレーションを実行中...${RESET}"
            run_django python manage.py makemigrations api
            run_django python manage.py migrate ;;
        41) 
            echo -e "\n${YELLOW}📦 属性マスタを同期中...${RESET}"
            docker cp "${PROJECT_ROOT}/django/master_data/attributes.tsv" "${DJANGO_CON}:/usr/src/app/master_data/attributes.tsv"
            
            docker exec -i "${DJANGO_CON}" python manage.py shell <<'EOF'
import os
import re
from django.db import connection, transaction
from api.models.pc_products import PCAttribute

file_path = '/usr/src/app/master_data/attributes.tsv'

# 1. SQLで直接テーブルを空にする（トランザクションを待たずに即時解放）
with connection.cursor() as cursor:
    cursor.execute('TRUNCATE TABLE api_pcattribute RESTART IDENTITY CASCADE;')
print("🧹 DB: Table api_pcattribute truncated.")

# 2. メモリ上で一意性を確保
unique_attrs = {}
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('attr_type'): continue
            parts = re.split(r'\t+|\s{2,}', line)
            if len(parts) < 3: continue
            
            slug = parts[2].strip().lower()
            unique_attrs[slug] = {
                'attr_type': parts[0].strip(),
                'name': parts[1].strip(),
                'order': int(float(parts[-1])) if parts[-1].replace('.','').isdigit() else 0
            }

    # 3. 1件ずつ安全に保存（万が一の衝突も無視する）
    count = 0
    for slug, data in unique_attrs.items():
        # 既に存在していてもエラーを出さない get_or_create 方式
        PCAttribute.objects.get_or_create(
            slug=slug,
            defaults=data
        )
        count += 1
    print(f"✅ {count} 件の属性を同期完了しました。")
else:
    print("❌ Error: attributes.tsv not found.")
EOF

            echo -e "${CYAN}🚀 商品データへの属性紐付けを更新中...${RESET}"
            run_django python manage.py auto_map_attributes 
            ;;
        42) update_sitemap ;;
        43) 
            echo "1) スーパーユーザー作成 / 2) 製品TSV出力"
            read -p ">> " S_C
            [[ "$S_C" == "1" ]] && run_django python manage.py createsuperuser || run_django python manage.py export_products ;;
        44) 
            ensure_show_urls_cmd
            echo -e "${YELLOW}URL一覧 (Base: ${BASE_URL})${RESET}"
            run_django python manage.py show_urls | sed "s|^\/|${BASE_URL}/|g" ;;
        8|q) exit 0 ;;
        h) echo "Help: カテゴリ番号を選択して運用タスクを実行します。" ;;
    esac
    echo -e "\n${GREEN}完了。Enterで戻ります。${RESET}"; read
done