#!/bin/bash

# ==============================================================================
# 🚀 Git コミット & プッシュ 自動化スクリプト (SSHエージェント自動起動付)
# ==============================================================================

# --- SSHエージェントのセットアップ ---
# 鍵が未登録の場合のみパスフレーズを入力を促すロジック
if ! ssh-add -l > /dev/null 2>&1; then
    echo "🔑 SSHエージェントをセットアップしています..."
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_ed25519
fi

# 1. 現在のブランチ名を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ エラー: ここはGitリポジトリではありません。"
    exit 1
fi

echo "---------------------------------------"
echo "🌿 Current Branch: $BRANCH"
echo "---------------------------------------"

# 2. 変更があるかチェック
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。クリーンな状態です。"
    exit 0
fi

# 3. コミットメッセージの取得
MESSAGE=$1
if [ -z "$MESSAGE" ]; then
    echo "📝 コミットメッセージを入力してください (完了したら Enter):"
    read -r MESSAGE
fi

if [ -z "$MESSAGE" ]; then
    echo "❌ エラー: メッセージが空のため、コミットを中断しました。"
    exit 1
fi

# 4. 実行セクション
echo "📦 [1/3] すべての変更をステージング中..."
git add -A

echo "💾 [2/3] コミット中: \"$MESSAGE\""
git commit -m "$MESSAGE"

echo "🚀 [3/3] $BRANCH にプッシュ中..."
git push origin "$BRANCH"

echo "---------------------------------------"
echo "✅ すべての作業が完了しました！"