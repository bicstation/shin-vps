#!/bin/bash
# scripts/launcher.sh
source "$(dirname "$0")/env.sh"

while true; do
    clear
    echo -e "${CYAN}==================================================================${RESET}"
    echo -e "🚀 ${BOLD}SHIN-VPS PLATFORM MANAGER v3${RESET} (Env: ${COLOR}${ENV_TYPE}${RESET})"
    echo -e "📂 Root: ${PROJECT_ROOT}"
    echo -e "${CYAN}==================================================================${RESET}"
    echo -e " 1) 🗄️  DB_ADMIN        (Migrate / Master / Users)"
    echo -e " 2) 💻 CONTENT_STATION  (PC News / Maker Sync)"
    echo -e " 3) 💰 CONTENT_SAVING   (Saving News / Point)"
    echo -e " 4) 🔞 CONTENT_TIPER    (Adult / Fanza / Style)"
    echo -e " 5) ⚡ CONTENT_AVFLASH  (AV Import / Analysis)"
    echo -e "${CYAN}------------------------------------------------------------------${RESET}"
    echo -e " q) 終了"
    read -p "選択してください: " CHOICE
    case $CHOICE in
        1) bash "$(dirname "$0")/db_admin.sh" ;;
        2) bash "$(dirname "$0")/content_station.sh" ;;
        3) bash "$(dirname "$0")/content_saving.sh" ;;
        4) bash "$(dirname "$0")/content_tiper.sh" ;;
        5) bash "$(dirname "$0")/content_avflash.sh" ;;
        q|Q|8) exit 0 ;;
    esac
done