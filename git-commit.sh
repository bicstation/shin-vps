#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (メッセージ自動整形 & バージョン連動版)
# ==============================================================================

# 1. SSHエージェントのセットアップ
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_ed25519
fi

# 2. ブランチとタグ情報の取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
git fetch --tags > /dev/null 2>&1
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# 次のバージョンを計算 (例: v1.0.1 -> v1.0.2)
BASE_VERSION=$(echo $LATEST_TAG | cut -d. -f1-2)
PATCH_VERSION=$(echo $LATEST_TAG | cut -d. -f3)
SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"

echo "---------------------------------------"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "---------------------------------------"

# 3. 変更チェック & コミットメッセージ作成
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。"
else
    echo "📝 変更種別を選んでください:"
    echo "1) fix  (バグ修正・調整)"
    echo "2) feat (新機能追加)"
    echo "3) docs (設定変更・ドキュメント)"
    echo "4) chore(その他・整理)"
    read -p "番号を選択 (1-4): " TYPE_NUM

    case $TYPE_NUM in
        1) TYPE="fix" ;;
        2) TYPE="feat" ;;
        3) TYPE="docs" ;;
        *) TYPE="chore" ;;
    esac

    read -p "具体的に何をしたか入力してください: " USER_MSG
    # 💡 [v1.0.2] fix: 〇〇 の形式でメッセージを自動合成
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 4. 本番デプロイ（タグ打ち）
if [ "$BRANCH" = "main" ]; then
    echo ""
    read -p "🚀 【本番環境】へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # タグを作成してプッシュ（これがGitHub Actionsのトリガーになる）
        git tag "$SUGGESTED_TAG"
        git push origin "$SUGGESTED_TAG"
        echo "---------------------------------------"
        echo "✅ デプロイ完了！ バージョン: $SUGGESTED_TAG"
    else
        echo "☕ デプロイは行わず終了します。"
    fi
fi