#!/bin/bash
# scripts/launcher.sh
# プロジェクト全体の司令塔となるメインメニュー
source "$(dirname "$0")/env.sh"

while true; do
    clear
    echo -e "${CYAN}==================================================================${RESET}"
    echo -e "🚀 ${BOLD}${WHITE}SHIN-VPS 統合管理プラットフォーム v3${RESET}"
    echo -e "   【環境】: ${COLOR}${ENV_TYPE}${RESET}  /  【パス】: ${PROJECT_ROOT}"
    echo -e "${CYAN}==================================================================${RESET}"

    # 1. システム管理 (YELLOW)
    echo -e " ${YELLOW}${BOLD}1)${RESET} ${YELLOW}🗄️  データベース & システム管理${RESET}"
    echo -e "    ${WHITE}└─ (マイグレーション / 属性マスタ同期 / ユーザー管理)${RESET}"

    # 2. PC・ガジェット (BLUE)
    echo -e "\n ${BLUE}${BOLD}2)${RESET} ${BLUE}💻 PC・ガジェット 運用ステーション${RESET}"
    echo -e "    ${WHITE}└─ (メーカー価格同期 / PCニュース投稿 / スペック解析)${RESET}"

    # 3. 節約・ポイ活 (GREEN)
    echo -e "\n ${GREEN}${BOLD}3)${RESET} ${GREEN}💰 節約・ポイ活 運用ステーション${RESET}"
    echo -e "    ${WHITE}└─ (節約ニュース / ポイント情報更新)${RESET}"

    # 4. アダルト (MAGENTA)
    echo -e "\n ${MAGENTA}${BOLD}4)${RESET} ${MAGENTA}🔞 アダルトコンテンツ管理 (TIPER)${RESET}"
    echo -e "    ${WHITE}└─ (FANZA・DUGA取得 / 女優解析 / スタイル分析)${RESET}"

    # 5. AV-Flash (RED)
    echo -e "\n ${RED}${BOLD}5)${RESET} ${RED}⚡ AV-Flash インポート管理${RESET}"
    echo -e "    ${WHITE}└─ (一括インポート / 詳細分析)${RESET}"

    echo -e "\n${CYAN}------------------------------------------------------------------${RESET}"
    echo -e "  ${BOLD}${WHITE}q) 終了${RESET} (または 8 / Q)"
    echo -e "${CYAN}------------------------------------------------------------------${RESET}"

    read -p "選択してください [1-5, q]: " CHOICE

    case $CHOICE in
        1) bash "$(dirname "$0")/db_admin.sh" ;;
        2) bash "$(dirname "$0")/content_station.sh" ;;
        3) bash "$(dirname "$0")/content_saving.sh" ;;
        4) bash "$(dirname "$0")/content_tiper.sh" ;;
        5) bash "$(dirname "$0")/content_avflash.sh" ;;
        q|Q|8)
            echo -e "\n${GREEN}管理プラットフォームを終了します。お疲れ様でした！${RESET}"
            exit 0 
            ;;
        *)
            echo -e "\n${RED}エラー: 無効な番号が入力されました。${RESET}"
            sleep 1
            ;;
    esac
done