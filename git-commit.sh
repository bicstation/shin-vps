#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (ローカル専用・タグ自動修正版)
# ==============================================================================

# --- [追加] VPS上での実行を禁止するチェック ---
CURRENT_HOST=$(hostname)
if [[ "$CURRENT_HOST" == *"x162-43-73-204"* ]] || [[ -f "/.dockerenv" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  警告: VPS環境 (またはコンテナ内) での実行を検知しました。"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "このスクリプトは【ローカルPC】専用です。"
    echo "VPSでの修正は禁止されています。修正は必ずローカルで行い、"
    echo "デプロイ（タグプッシュ）機能を使って反映させてください。"
    echo ""
    exit 1
fi

# 1. プロジェクトルート判定
if [[ -d "/mnt/e/dev/shin-vps" ]]; then
    PROJECT_ROOT="/mnt/e/dev/shin-vps"
elif [[ -d "/mnt/c/dev/SHIN-VPS" ]]; then
    PROJECT_ROOT="/mnt/c/dev/SHIN-VPS"
else
    # 基本的にここは通らないはずですが、保険として設定
    PROJECT_ROOT="/home/maya/shin-vps"
fi

cd "$PROJECT_ROOT" || exit 1

# 2. 最新のタグを取得・計算する関数
refresh_tag() {
    git fetch --tags > /dev/null 2>&1
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    
    BASE_VERSION=$(echo $LATEST_TAG | cut -d. -f1-2)
    PATCH_VERSION=$(echo $LATEST_TAG | cut -d. -f3)
    SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"
}

# 初回タグ取得
refresh_tag

# 3. SSHエージェント
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    ssh-add ~/.ssh/id_ed25519 > /dev/null 2>&1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOST"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "---------------------------------------"

# 4. 変更チェック & コミット
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。"
else
    echo "📝 変更種別を選んでください:"
    echo "1) fix    (バグ修正・調整)"
    echo "2) feat   (新機能追加: 機能拡張)"
    echo "3) docs   (設定変更・ドキュメント)"
    echo "4) chore  (その他・整理)"
    read -p "番号を選択 (1-4): " TYPE_NUM

    case $TYPE_NUM in
        1) TYPE="fix" ;;
        2) TYPE="feat" ;;
        3) TYPE="docs" ;;
        *) TYPE="chore" ;;
    esac

    refresh_tag

    read -p "具体的に何をしたか入力してください: " USER_MSG
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）
if [ "$BRANCH" = "main" ]; then
    refresh_tag
    
    echo ""
    echo "🚀 次のバージョンとしてデプロイ準備中: $SUGGESTED_TAG"
    read -p "🚀 【本番環境】へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # 重複タグのローカルクリーニング
        if git rev-parse "$SUGGESTED_TAG" >/dev/null 2>&1; then
            git tag -d "$SUGGESTED_TAG" > /dev/null 2>&1
        fi
        
        git tag "$SUGGESTED_TAG"
        
        if git push origin "$SUGGESTED_TAG"; then
            echo "---------------------------------------"
            echo "✅ デプロイ成功！ バージョン: $SUGGESTED_TAG"
            echo "📡 GitHub Actions 経由で VPS にファイルが転送されます。"
        else
            echo "❌ プッシュ失敗。GitHub Actions は起動しませんでした。"
        fi
    else
        echo "☕ 終了します。"
    fi
fi