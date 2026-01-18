#!/bin/bash

# ==============================================================================
# 📦 SHIN-VPS & Local 環境自動判別・製品データ運用ツール
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 環境判別 ---
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
    COLOR="\e[36m" # 水色（ローカル）
fi

RESET="\e[0m"

# --- Djangoコンテナ用コマンド実行関数 ---
run_django() {
    if [ ! -f "$SCRIPT_DIR/$COMPOSE_FILE" ]; then
        echo -e "\e[31m[ERROR] $COMPOSE_FILE が見つかりません。\e[0m"
        exit 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$DJANGO_CON" $@
}

# --- Next.jsコンテナ用コマンド実行関数 (SEO用) ---
run_next() {
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec "$NEXT_CON" $@
}

# --- サイトマップ更新処理 ---
update_sitemap() {
    echo -e "\n${COLOR}🌐 サイトマップを更新中...${RESET}"
    MJS_SRC="$SCRIPT_DIR/next-bicstation/generate-sitemap.mjs"
    if [ -f "$MJS_SRC" ]; then
        docker cp "$MJS_SRC" "$NEXT_CON":/app/generate-sitemap.mjs
    else
        echo -e "\e[31m[ERROR] $MJS_SRC が見つかりません。\e[0m"
        return 1
    fi
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" exec -u root "$NEXT_CON" chmod -R 777 /app/public/sitemap_gen
    run_next node /app/generate-sitemap.mjs
}

# --- メインメニュー ---
echo -e "---------------------------------------"
echo -e "🚀 SHIN-VPS Data Import & Automation Tool"
echo -e "環境: ${COLOR}${ENV_TYPE}${RESET}"
echo -e "---------------------------------------"

echo "1) [DB]     マイグレーション実行"
echo "2) [Import] Tiper データ (Fanza/Duga) インポート"
echo -e "3) ${COLOR}[Import] メーカー別インポート・同期 ✨${RESET}"
echo "4) [Import] AV-Flash データのインポート"
echo "5) [Admin]  スーパーユーザーの作成"
echo -e "6) ${COLOR}[WP]     商品AI記事生成 & WordPress自動投稿${RESET}"
echo -e "7) ${COLOR}[News]   PCパーツ最新ニュース投稿 (URL指定対応) 🆕${RESET}"
echo "---------------------------------------"
echo -e "12) [Analysis] 製品データをTSV出力 (分析用)"
echo -e "13) [Master]   属性マスター(TSV)をインポート"
echo -e "14) ${COLOR}[Auto]     属性自動マッピング実行 ⚡${RESET}"
echo -e "15) ${COLOR}[SEO]      サイトマップ手動更新 (Sitemap.xml) 🌐${RESET}"
echo -e "16) ${COLOR}[AI-M]     AIモデル一覧の確認 (Gemini/Gemma) 🤖${RESET}"
echo -e "17) ${COLOR}[AI-Spec]  AI詳細スペック解析 (analyze_pc_spec) 🔥${RESET}"
echo "---------------------------------------"
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
        echo -e "\n--- メーカー選択 ---"
        echo "12) Mouse Computer (High-Precision) 🐭"
        read -p ">> " SUB_CHOICE
        case $SUB_CHOICE in
            12) 
                run_django env PYTHONPATH=/usr/src/app python /usr/src/app/scrapers/src/shops/import_mouse.py
                echo -e "\n${COLOR}🐭 マウスのインポートが完了しました。${RESET}"
                read -p "AIによる詳細解析を実行しますか？(y/n): " AI_CONFIRM
                if [ "$AI_CONFIRM" == "y" ]; then
                    read -p "解析件数を入力 (all または 空欄で全件, 数値指定も可): " AI_LIMIT
                    # 「すべて」のロジック
                    if [[ -z "$AI_LIMIT" || "$AI_LIMIT" == "all" ]]; then
                        AI_LIMIT=999999
                        echo ">> 全件解析モードで実行します。"
                    fi
                    run_django python manage.py analyze_pc_spec --maker mouse --limit "$AI_LIMIT"
                fi
                ;;
        esac
        ;;
    12) run_django python manage.py export_products ;;
    13) 
        read -p "ファイル名: " TSV_FILE
        run_django python manage.py import_specs "/usr/src/app/$TSV_FILE"
        ;;
    14) run_django python manage.py auto_map_attributes ;;
    15) update_sitemap ;;
    16) run_django python manage.py ai_model_name ;;
    17)
        echo -e "\n--- [AI-Spec] AI詳細スペック解析 ---"
        read -p "メーカー (mouse/dell等, 空欄で全件): " MK_ARG
        read -p "解析件数 (all または 空欄で全件, 数値指定も可): " LM_ARG
        
        # 「すべて」のロジック
        if [[ -z "$LM_ARG" || "$LM_ARG" == "all" ]]; then
            LM_ARG=999999
            echo ">> 全件解析モードで実行します。"
        fi

        CMD="python manage.py analyze_pc_spec"
        [[ -n "$MK_ARG" ]] && CMD="$CMD --maker $MK_ARG"
        CMD="$CMD --limit $LM_ARG"
        run_django $CMD
        ;;
    8) exit 0 ;;
esac

# 🔄 連携処理（VPS環境）
if [ "$IS_VPS" = true ] && [[ "$CHOICE" =~ ^(3|13|14|17)$ ]]; then
    echo -e "\n${COLOR}🔄 設定反映のためスケジューラーを再起動しています...${RESET}"
    docker compose -f "$SCRIPT_DIR/$COMPOSE_FILE" up -d scheduler
    read -p "続けてサイトマップを更新しますか？ (y/n): " CONFIRM
    [[ "$CONFIRM" == "y" ]] && update_sitemap
fi

echo -e "\n✅ 処理が完了しました！"