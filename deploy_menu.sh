#!/bin/bash

# --- 🛰️ 環境判別 & パス設定 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
HOSTNAME=$(hostname)
TARGET_CONTAINER="django-v3"

# ログ設定
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/fleet_ops_$(date '+%Y%m%d').log"

# --- 🎨 カラー演出 ---
G='\033[0;32m' # Green (General/Success)
B='\033[0;34m' # Blue (Info)
Y='\033[1;33m' # Yellow (Warning/Highlight)
P='\033[0;35m' # Purple (Adult/Special)
R='\033[0;31m' # Red (Danger)
NC='\033[0m'    # No Color

# --- 🛠️ 共通実行関数 ---
deploy_mission() {
    local proj=$1
    local platform=$2
    local mode=$3

    echo -e "\n${B}[STRATEGY]${NC} 🛰️  Target: ${Y}$TARGET_CONTAINER${NC}"
    echo -e "${G}🚀 執行中: Project=${proj} / Platform=${platform:-ALL} / Mode=${mode}${NC}"
    echo -e "${B}------------------------------------------------------------${NC}"

    # Djangoコマンドの組み立て (v41.0準拠)
    local cmd="python manage.py ai_fleet_deployer --project $proj --mode $mode"
    if [ -n "$platform" ]; then
        cmd="$cmd --platform $platform"
    fi

    # 実行
    docker exec -it $TARGET_CONTAINER $cmd 2>&1 | tee -a "$LOG_FILE"
    
    echo -e "${B}------------------------------------------------------------${NC}"
    echo -e "${G}✅ 任務完了。エンターキーで司令部に戻ります...${NC}"
    read
}

# --- 📋 メインループ ---
while true; do
    clear
    echo -e "${B}============================================================${NC}"
    echo -e "${G}   🔱 BICSTATION STRATEGIC COMMAND CENTER v7.0${NC}"
    echo -e "   Host: ${Y}$HOSTNAME${NC} | Mode: ${P}Unified Metadata Control${NC}"
    echo -e "${B}============================================================${NC}"
    echo -e "  ${P}[ADULT FLEET]${NC}"
    echo -e "   1) TIPER        : tiper.live (メイン)"
    echo -e "   2) AV-FLASH     : avflash.xyz (速報)"
    echo -e "  ${G}[GENERAL FLEET]${NC}"
    echo -e "   3) BICSTATION   : bicstation.com (WP連動)"
    echo -e "   4) SAVING       : bic-saving.com (WP連動)"
    echo -e "  ----------------------------------------------------------"
    echo -e "   5) ${Y}[ALL-FLEET]${NC} 一斉出撃  c) ${R}[CLEANUP]${NC} メタデータ掃除"
    echo -e "   l) [LOGS] ログ   d) [DOCKER] 状態   q) [EXIT] 終了"
    echo -e "${B}============================================================${NC}"
    echo -n "  SELECT PROJECT >> "
    read project_choice

    # プロジェクト決定
    case $project_choice in
        1) PROJ="tiper" ;;
        2) PROJ="avflash" ;;
        3) PROJ="bicstation" ;;
        4) PROJ="saving" ;;
        5) PROJ="all" ;;
        c) 
            echo -n "どのプロジェクトを掃除しますか？(tiper/avflash/bicstation/saving) >> "
            read target_clean
            deploy_mission $target_clean "" "cleanup"
            continue ;;
        l) tail -n 50 "$LOG_FILE" | less ; continue ;;
        d) docker ps --format "table {{.Names}}\t{{.Status}}" ; echo "Press Enter..."; read ; continue ;;
        q) echo -e "\n${R}提督、武運を。撤収！${NC}" ; exit 0 ;;
        *) echo -e "${R}⚠️ 無効な選択です${NC}" ; sleep 1 ; continue ;;
    esac

    # プラットフォーム決定
    echo -e "\n  ${Y}--- 🎯 送信先（Platform）を選択 ---${NC}"
    echo -e "   1) ALL (全拠点を一斉攻撃)"
    echo -e "   2) Livedoor (無料)"
    echo -e "   3) Blogger  (無料)"
    echo -e "   4) Hatena   (無料)"
    echo -e "   5) ${G}WordPress (自社専用拠点)${NC}"
    echo -n "  SELECT PLATFORM >> "
    read plat_choice

    case $plat_choice in
        1) PLAT="" ;;
        2) PLAT="livedoor" ;;
        3) PLAT="blogger" ;;
        4) PLAT="hatena" ;;
        5) PLAT="wordpress" ;;
        *) echo -e "${R}⚠️ 無効なプラットフォームです${NC}" ; sleep 1 ; continue ;;
    esac

    # 最終確認と実行
    deploy_mission $PROJ $PLAT "deploy"
done