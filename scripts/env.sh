#!/bin/bash
# scripts/env.sh

# プロジェクトルートと環境の特定
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_PATH/.." && pwd)"
CURRENT_HOSTNAME=$(hostname)

if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true; ENV_TYPE="PRODUCTION (VPS)"; COMPOSE_FILE="docker-compose.prod.yml"; COLOR="\e[32m"
    BASE_URL="http://$(hostname -I | awk '{print $1}'):8083"
else
    IS_VPS=false; ENV_TYPE="LOCAL (Development)"; COMPOSE_FILE="docker-compose.yml"; COLOR="\e[36m"
    BASE_URL="http://api-tiper-host:8083"
fi

# コンテナ・定数定義
DJANGO_CON="django-v3"
NEXT_CON="next-bicstation-v3"
RESET="\e[0m"; RED="\e[31m"; YELLOW="\e[33m"; BLUE="\e[34m"; MAGENTA="\e[35m"; CYAN="\e[36m"; BOLD="\e[1m"; GREEN="\e[32m"

# 共通実行関数
run_django() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec "$DJANGO_CON" "$@"; }
run_next() { docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec "$NEXT_CON" "$@"; }
pause() { echo -e "\n${GREEN}完了。Enterで戻ります。${RESET}"; read; }