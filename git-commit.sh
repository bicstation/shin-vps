#!/bin/bash

# ==============================================================================
# 🚀 Git コミット・プッシュ・本番デプロイ統合スクリプト (バージョン自動提案版)
# ==============================================================================

# --- SSHエージェントのセットアップ ---
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
if [ "$BRANCH" = "main" ]; then
    echo ""
    echo "---------------------------------------"
    read -p "🚀 今回の変更を【本番環境】にデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # --- 💡 最新タグの取得と次バージョンの計算 ---
        git fetch --tags # 最新のタグ情報を取得
        LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
        
        if [ -z "$LATEST_TAG" ]; then
            LATEST_TAG="v0.0.0"
            SUGGESTED_TAG="v0.0.1"
        else
            # v1.0.1 のような形式から数字を分解してパッチを+1する
            # 例: v1.0.1 -> v1.0.2
            BASE_VERSION=$(echo $LATEST_TAG | cut -d. -f1-2)
            PATCH_VERSION=$(echo $LATEST_TAG | cut -d. -f3)
            NEW_PATCH=$((PATCH_VERSION + 1))
            SUGGESTED_TAG="${BASE_VERSION}.${NEW_PATCH}"
        fi
        
        echo "現在の最新タグ: $LATEST_TAG"
        read -p "新しいタグ名を入力してください (デフォルト: $SUGGESTED_TAG): " NEW_TAG
        
        # 入力が空なら提案されたタグを使う
        NEW_TAG=${NEW_TAG:-$SUGGESTED_TAG}
        
        if [ -n "$NEW_TAG" ]; then
            echo "🏷️  タグ $NEW_TAG を作成してプッシュします..."
            git tag "$NEW_TAG"
            git push origin "$NEW_TAG"
            echo "---------------------------------------"
            echo "✅ 本番デプロイの合図 ($NEW_TAG) を送りました！"
            echo "GitHub Actions の進行状況を確認してください。"
        else
            echo "⚠️ タグ作成をキャンセルしました。"
        fi
    else
        echo "☕ 本番デプロイは行わず、作業を終了します。"
    fi
fi

echo "---------------------------------------"
echo "✨ すべての作業が完了しました！"