#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (PC自動判別 & パス自動解決版)
# ==============================================================================

# 1. PC環境の自動判別とディレクトリ移動
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

if [[ "$CURRENT_HOSTNAME" == "Marya" ]]; then
    # 🏠 自宅PC
    PROJECT_ROOT="/mnt/c/dev/SHIN-VPS"
elif [[ -d "/mnt/e/dev/shin-vps" ]]; then
    # 🏢 職場PC (Eドライブの存在で判定)
    PROJECT_ROOT="/mnt/e/dev/shin-vps"
else
    # 🌐 VPS または その他
    PROJECT_ROOT="/home/maya/shin-vps"
fi

if [ -d "$PROJECT_ROOT" ]; then
    cd "$PROJECT_ROOT"
else
    echo "❌ エラー: プロジェクトディレクトリが見つかりません ($PROJECT_ROOT)"
    exit 1
fi

# 2. SSHエージェントのセットアップ
# 自宅PCでパスワードが不要なのは、既に鍵が登録されているか、パスフレーズなしの鍵だからです
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)"
    # 鍵のパスも環境に合わせて分岐が必要な場合はここに追加
    ssh-add ~/.ssh/id_ed25519
fi

# 3. ブランチとタグ情報の取得
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
git fetch --tags > /dev/null 2>&1
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# バージョン計算 (v0.0.1 -> v0.0.2)
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
    echo "📝 変更種別: 1)fix 2)feat 3)docs 4)chore"
    read -p "選択 (1-4): " TYPE_NUM
    case $TYPE_NUM in
        1) TYPE="fix" ;;
        2) TYPE="feat" ;;
        3) TYPE="docs" ;;
        *) TYPE="chore" ;;
    esac

    read -p "メッセージ入力: " USER_MSG
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 実行: git push origin $BRANCH"
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ
if [ "$BRANCH" = "main" ] && [[ "$CURRENT_HOSTNAME" != *"x162-43"* ]]; then
    echo ""
    read -p "🚀 本番へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        git tag "$SUGGESTED_TAG"
        git push origin "$SUGGESTED_TAG"
        echo "✅ デプロイ完了！"
    fi
fi