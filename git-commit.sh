#!/bin/bash

# ==============================================================================
# 🚀 Git コミット & プッシュ 自動化スクリプト
# ==============================================================================

# 1. 現在のブランチ名を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Gitリポジトリ内かチェック
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
# 引数があればそれを使い、なければ入力を促す
MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "📝 コミットメッセージを入力してください (完了したら Enter):"
    read -r MESSAGE
fi

# メッセージが空なら中断
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