#!/bin/bash

# --- 🛰️ 自動環境判別ロジック ---
# 実行ディレクトリに関わらず、スクリプトの場所からPROJECT_ROOTを特定
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
HOSTNAME=$(hostname)

# ホスト名に関わらず、今回の艦隊構成では django-v3 を優先ターゲットに設定
TARGET_CONTAINER="django-v3"

# もし django-v3 が見つからない場合のみ、動的に検索（予備：環境による差異を吸収）
if ! docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
    TARGET_CONTAINER=$(docker ps --format "{{.Names}}" | grep "django" | head -n 1)
fi

# ログディレクトリの確保
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/deploy_$(date '+%Y%m%d').log"

# --- 🎨 カラー演出 ---
G='\033[0;32m' # Green
B='\033[0;34m' # Blue
Y='\033[1;33m' # Yellow
R='\033[0;31m' # Red
NC='\033[0m'    # No Color

# --- 🛠️ 共通実行関数 ---
deploy_mission() {
    local proj=$1
    local platform=$2
    
    echo -e "\n${B}[INFO]${NC} Target Container: ${Y}$TARGET_CONTAINER${NC}"
    echo -e "${G}🚀 作戦開始: Project=${proj} / Platform=${platform:-ALL}${NC}"
    echo -e "${B}------------------------------------------------------------${NC}"

    # 【修正完了】manage.py のパスをコンテナ内のWORKDIR直下(/usr/src/app/manage.py)に合わせました
    if [ -z "$platform" ]; then
        docker exec -it $TARGET_CONTAINER python manage.py ai_fleet_deployer --project $proj 2>&1 | tee -a "$LOG_FILE"
    else
        docker exec -it $TARGET_CONTAINER python manage.py ai_fleet_deployer --project $proj --platform $platform 2>&1 | tee -a "$LOG_FILE"
    fi
    
    echo -e "${B}------------------------------------------------------------${NC}"
    echo -e "${G}✅ 任務完了。エンターキーでメニューに戻ります...${NC}"
    read
}

# --- 📋 メインループ ---
while true; do
    clear
    echo -e "${B}============================================================${NC}"
    echo -e "${G}   🔱 BICSTATION STRATEGIC COMMAND MENU v6.1${NC}"
    echo -e "   Host: ${Y}$HOSTNAME${NC} | Path: ${Y}$PROJECT_ROOT${NC}"
    echo -e "${B}============================================================${NC}"
    echo -e "  1) ${G}[TIPER]${NC}        - tiper.live (メイン拠点)"
    echo -e "  2) ${G}[BIC-EROG]${NC}    - bic-erog.com (正規空母)"
    echo -e "  3) ${G}[ADULT-SRCH]${NC}  - adult-search.xyz (索敵拠点)"
    echo -e "  4) ${G}[PC-NEWS]${NC}      - bicstation (テック系)"
    echo -e "  5) ${Y}[ALL-FLEET]${NC}   - 全艦隊一斉出撃"
    echo -e "  ----------------------------------------------------------"
    echo -e "  l) ${Y}[LOGS]${NC} ログ確認  d) ${B}[DOCKER]${NC} 状態確認  q) ${R}[EXIT]${NC} 終了"
    echo -e "${B}============================================================${NC}"
    echo -n "  SELECT PROJECT >> "
    read project_choice

    case $project_choice in
        1|2|3|4)
            case $project_choice in
                1) PROJ="tiper" ;;
                2) PROJ="bic-erog" ;;
                3) PROJ="adult-search" ;;
                4) PROJ="bicstation" ;;
            esac
            
            echo -e "\n  ${Y}--- 🎯 ターゲット・プラットフォーム ---${NC}"
            echo -e "  1) ALL (全ブログ)"
            echo -e "  2) Livedoor"
            echo -e "  3) Blogger"
            echo -e "  4) hatena"
            echo -n "  SELECT PLATFORM >> "
            read plat_choice
            
            case $plat_choice in
                1) deploy_mission $PROJ "" ;;
                2) deploy_mission $PROJ "livedoor" ;;
                3) deploy_mission $PROJ "blogger" ;;
                4) deploy_mission $PROJ "hatena" ;;
                *) echo -e "${R}⚠️ 無効な選択です${NC}" ; sleep 1 ;;
            esac
            ;;
        5)
            deploy_mission "all" ""
            ;;
        l)
            echo -e "\n${Y}📋 最新のログを表示します (qで戻る):${NC}"
            tail -n 50 "$LOG_FILE" | less
            ;;
        d)
            echo -e "\n${B}🐳 Docker コンテナ稼働状況:${NC}"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            echo -e "\nEnter... "; read
            ;;
        q)
            echo -e "\n${R}提督、お疲れ様でした。撤収します！${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${R}⚠️ 無効なコマンドです${NC}"
            sleep 1
            ;;
    esac
done