#!/bin/bash
# /home/maya/dev/shin-vps/scripts/load.sh
# ==============================================================================
# 📥 SHIN-VPS v3 同期スクリプト (作業開始用)
# ==============================================================================

CURRENT_USER=$USER
# プロジェクトルートの動的決定
if [ -d "./.git" ]; then
    PROJECT_ROOT="$(pwd)"
elif [[ -d "/home/$CURRENT_USER/dev/shin-vps" ]]; then
    PROJECT_ROOT="/home/$CURRENT_USER/dev/shin-vps"
elif [[ -d "/home/$CURRENT_USER/shin-dev/shin-vps" ]]; then
    PROJECT_ROOT="/home/$CURRENT_USER/shin-dev/shin-vps"
fi

cd "$PROJECT_ROOT" || exit 1

echo "---------------------------------------"
echo "📥 艦隊データの同期を開始します..."
echo "📂 PATH: $PROJECT_ROOT"
echo "---------------------------------------"

# 1. SSHエージェントの確認
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    [ -f "$HOME/.ssh/id_ed25519" ] && ssh-add "$HOME/.ssh/id_ed25519"
fi

# 2. ローカルの変更（未コミットの生成記事など）を確認
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ 未コミットの変更を検知しました。一時的に退避（Stash）します。"
    git stash
    STASHED=true
fi

# 3. リモートから最新情報を取得
echo "📡 GitHubから最新の更新を取得中..."
git pull origin $(git rev-parse --abbrev-ref HEAD)

# 4. 退避したデータを復元
if [ "$STASHED" = true ]; then
    echo "🔄 一時退避したローカル記事を復元しています..."
    git stash pop
fi

echo "---------------------------------------"
echo "✨ 同期完了！現在のブランチは最新です。"
echo "🚀 執筆・開発を開始してください。"
echo "---------------------------------------"