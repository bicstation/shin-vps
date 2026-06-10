# =========================================
# SHIN CORE LINX
# =========================================

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt


export SHIN_HOME="$HOME/shin-vps"
export SCRIPT_HOME="$SHIN_HOME/scripts"

# 💡 修正ポイント: ~ ではなく $HOME を使い、WSL内のパスを指定
export VPS_PATH="$SHIN_HOME"

# データインポート
vps-import() {
    cd "$VPS_PATH" && ./scripts/import_data.sh "$@"
}

# フルリビルド (爆速ネイティブ領域実行)
vps-rebuild() {
    cd "$VPS_PATH" && ./rebuild.sh "$@"
}

save() {
    local msg="${1:-update}"

    cd "$SHIN_HOME" || return

    ./scripts/git-commit.sh "$msg"
}



# 🛠️ Maya専用：ヘルプ機能付き高機能ツリーコマンド
t2() {
  # ヘルプ表示の判定
  if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo -e "\e[1;34m=== Maya's Custom Tree (t2) Help ===\e[0m"
    echo -e "使い方: \e[32mt2 [パス]\e[0m"
    echo -e "  (パスを省略すると現在のディレクトリを表示します)"
    echo ""
    echo -e "\e[1m表示内容:\e[0m"
    echo "  -u : 所有者を表示"
    echo "  -g : グループを表示"
    echo "  -p : パーミッション(drwxr-xr-xなど)を表示"
    echo "  -L 2 : 2階層目まで表示"
    echo "  -I : node_modules, .git, .next を自動除外"
    echo ""
    echo -e "\e[1m例:\e[0m"
    echo "  t2          : 今の場所をL2で確認"
    echo "  t2 shared   : sharedフォルダの構造を詳細確認"
    return 0
  fi

  # 実行部分（引数 $1 があればそのパスを、なければ . を対象にする）
  local target=${1:-.}

  # カラー表示(-C)を追加して、より見やすく最適化
  tree -u -g -p -C -L 2 -I 'node_modules|.git|.next' "$target"
}




alias cdb='cd ~/shin-vps'

alias dps='docker ps'
alias dlog='docker compose logs -f'
alias drestart='docker compose restart'

alias dcup='docker compose up -d'
alias dcbuild='docker compose up -d --build'
alias dcdown='docker compose down'

alias djshell='docker exec -it shin-local-django-v3-1 python manage.py shell'
alias djmanage='docker exec -it shin-local-django-v3-1 python manage.py'
alias djbash='docker exec -it shin-local-django-v3-1 bash'
alias djpython='docker exec -it shin-local-django-v3-1 python'

alias djpsql='docker exec -it shin-local-postgres-db-v3-1 psql -U tiper_user -d shin_core_local'

alias djspec='djmanage compile_spec_runtime'
alias djhuman='djmanage compile_human_runtime'

alias djsemantic='djmanage compile_semantic_runtime'
alias djauthority='djmanage compile_semantic_authority'

alias pcpipe='cd ~/shin-vps && ./scripts/pipeline_pc_clean.sh'


alias djlogs='docker logs -f --tail=100 shin-local-django-v3-1'
alias djrestart='docker restart shin-local-django-v3-1'

alias dtop='docker stats'


alias djmodel='djmanage ai_model_name'

alias djspec1='djmanage compile_spec_runtime --limit 1'
alias djhuman1='djmanage compile_human_runtime --limit 1'

alias djspec10='djmanage compile_spec_runtime --limit 10'
alias djhuman10='djmanage compile_human_runtime --limit 10'


alias runtime='djmanage compile_spec_runtime'
alias human='djmanage compile_human_runtime'
alias semantic='djmanage compile_semantic_runtime'

alias gs='git status'
alias gl='git log --oneline -10'
alias gd='git diff'


echo ""
echo "=================================================="
echo "✅ SHIN CORE LINX READY"
echo "=================================================="
echo "🌌 HOME : $SHIN_HOME"
echo "=================================================="
echo ""
health() {

echo ""
echo "========================"
echo "SHIN CORE LINX HEALTH"
echo "========================"

docker ps --format \
'table {{.Names}}\t{{.Status}}'

echo ""
free -h

echo ""
df -h /

echo ""
}

PS1='\[\e[1;32m\]🌌 SHIN\[\e[0m\] \[\e[1;36m\]\u@\h\[\e[0m\]:\[\e[1;33m\]\w\[\e[0m\]\$ '
