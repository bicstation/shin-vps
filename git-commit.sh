#!/bin/bash

# ==============================================================================
# 🚀 Git コミット・プッシュ・本番デプロイ統合スクリプト
# ==============================================================================

# --- SSHエージェントのセットアップ ---
if ! ssh-add -l > /dev/null 2>&1; then
    echo "🔑 SSHエージェントをセットアップしています..."
    eval "$(ssh-agent -s)"
    # お使いの秘密鍵のパスに合わせて適宜変更してください
    ssh-add ~/.ssh/id_ed25519
fi

# 1. 現在のブランチ名を取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ エラー: ここはGitリポジトリではありません。"
    exit 1
fi

echo "---------------------------------------"
echo "🌿 現在のブランチ: $BRANCH"
echo "---------------------------------------"

# 2. 変更があるかチェック
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。クリーンな状態です。"
else
    # 3. コミットメッセージの取得
    MESSAGE=$1
    if [ -z "$MESSAGE" ]; then
        echo "📝 コミットメッセージを入力してください (完了したら Enter):"
        read -r MESSAGE
    fi

    if [ -z "$MESSAGE" ]; then
        echo "❌ エラー: メッセージが空のため、中断しました。"
        exit 1
    fi

    # 4. 実行セクション
    echo "📦 [1/3] すべての変更をステージング中..."
    git add -A

    echo "💾 [2/3] コミット中: \"$MESSAGE\""
    git commit -m "$MESSAGE"

    echo "🚀 [3/3] $BRANCH にプッシュ中..."
    git push origin "$BRANCH"
    
    echo "✅ $BRANCH へのプッシュが完了しました！"
fi

# 5. 本番デプロイ（タグ打ち）セクション
# mainブランチにいる時だけ実行されます
if [ "$BRANCH" = "main" ]; then
    echo ""
    echo "---------------------------------------"
    read -p "🚀 今回の変更を【本番環境】にデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # 最新のタグを表示して参考にしてもらう
        LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "なし")
        echo "現在の最新タグ: $LATEST_TAG"
        
        read -p "新しいタグ名を入力してください (例: v1.0.1): " NEW_TAG
        
        if [ -n "$NEW_TAG" ]; then
            echo "🏷️  タグ $NEW_TAG を作成してプッシュします..."
            git tag "$NEW_TAG"
            git push origin "$NEW_TAG"
            echo "---------------------------------------"
            echo "✅ 本番デプロイの合図を送りました！"
            echo "GitHub Actions の進行状況を確認してください。"
        else
            echo "⚠️ タグ名が空だったため、デプロイは行いませんでした。"
        fi
    else
        echo "☕ 本番デプロイは行わず、作業を終了します。"
    fi
fi

echo "---------------------------------------"
echo "✨ すべての作業が完了しました！"