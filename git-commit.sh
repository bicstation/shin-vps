#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (メニュー改良版)
# ==============================================================================

# 1. ディレクトリの存在優先でプロジェクトルートを判定
if [[ -d "/mnt/e/dev/shin-vps" ]]; then
    # 職場PC (Eドライブ)
    PROJECT_ROOT="/mnt/e/dev/shin-vps"
elif [[ -d "/mnt/c/dev/SHIN-VPS" ]]; then
    # 自宅PC (Cドライブ)
    PROJECT_ROOT="/mnt/c/dev/SHIN-VPS"
else
    # その他（VPSやデフォルト）
    PROJECT_ROOT="/home/maya/shin-vps"
fi

cd "$PROJECT_ROOT" || exit 1

# 2. SSHエージェントのセットアップ (エラーは表示させない)
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    # 自宅PCなどでファイルがない場合のエラーを 2>/dev/null で捨てます
    ssh-add ~/.ssh/id_ed25519 > /dev/null 2>&1
fi

# 3. ブランチとタグ情報の取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
git fetch --tags > /dev/null 2>&1
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

BASE_VERSION=$(echo $LATEST_TAG | cut -d. -f1-2)
PATCH_VERSION=$(echo $LATEST_TAG | cut -d. -f3)
SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOSTNAME"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "---------------------------------------"

# 4. 変更チェック & コミット
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。"
else
    # メニューを縦長で分かりやすく表示
    echo "📝 変更種別を選んでください:"
    echo "1) fix   (バグ修正・調整)"
    echo "2) feat  (新機能追加)"
    echo "3) docs  (設定変更・ドキュメント)"
    echo "4) chore (その他・整理)"
    read -p "番号を選択 (1-4): " TYPE_NUM

    case $TYPE_NUM in
        1) TYPE="fix" ;;
        2) TYPE="feat" ;;
        3) TYPE="docs" ;;
        *) TYPE="chore" ;;
    esac

    read -p "具体的に何をしたか入力してください: " USER_MSG
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）
if [ "$BRANCH" = "main" ] && [[ "$CURRENT_HOSTNAME" != *"x162-43"* ]]; then
    echo ""
    read -p "🚀 【本番環境】へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        git tag "$SUGGESTED_TAG"
        git push origin "$SUGGESTED_TAG"
        echo "---------------------------------------"
        echo "✅ デプロイ完了！ バージョン: $SUGGESTED_TAG"
    else
        echo "☕ デプロイは行わず終了します。"
    fi
fi