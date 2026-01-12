#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (タグ同期・パスワード削減・ガードレール完全版)
# ==============================================================================

# --- [ガードレール] VPS上での実行を禁止するチェック ---
CURRENT_HOST=$(hostname)
if [[ "$CURRENT_HOST" == *"x162-43-73-204"* ]] || [[ -f "/.dockerenv" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  警告: VPS環境 (またはコンテナ内) での実行を検知しました。"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "このスクリプトは【ローカルPC】専用です。"
    exit 1
fi

# 1. プロジェクトルート判定
if [[ -d "/mnt/e/dev/shin-vps" ]]; then
    PROJECT_ROOT="/mnt/e/dev/shin-vps"
elif [[ -d "/mnt/c/dev/SHIN-VPS" ]]; then
    PROJECT_ROOT="/mnt/c/dev/SHIN-VPS"
else
    PROJECT_ROOT="/home/maya/shin-vps"
fi

cd "$PROJECT_ROOT" || exit 1

# 3. SSHエージェントのセットアップ (★まず最初に入力を済ませる)
if ! ssh-add -l > /dev/null 2>&1; then
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null 2>&1
    fi
    echo "🔑 SSH鍵をエージェントに登録します..."
    ssh-add ~/.ssh/id_ed25519
fi

# 2. 最新のタグを取得・計算する関数
refresh_tag() {
    # 完全に最新の状態にするために、リモートから強制取得
    git fetch --tags -f > /dev/null 2>&1
    
    # ローカルとリモートのタグを比較し、最も大きい（新しい）ものを取得
    # describeだと現在地点からの距離になるため、単純なソート版を使用
    LATEST_TAG=$(git tag -l "v*" | sort -V | tail -n1)
    
    if [ -z "$LATEST_TAG" ]; then LATEST_TAG="v0.0.0"; fi
    
    # バージョン番号の分解と加算
    BASE_VERSION=$(echo "$LATEST_TAG" | cut -d. -f1-2)
    PATCH_VERSION=$(echo "$LATEST_TAG" | cut -d. -f3)
    SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"
}

# ★重要★ パスワード入力後に fetch を実行することで確実に最新を取得する
refresh_tag

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOST"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "🚀 次回予定 : $SUGGESTED_TAG"
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

    echo ""
    echo "💬 コミットメッセージの内容:"
    echo "1) 「修正しました」を使用"
    echo "2) 「スクリプトを更新しました」を使用"
    echo "3) 自分で文章を入力する"
    read -p "番号を選択 (1-3): " MSG_CHOICE

    case $MSG_CHOICE in
        1) USER_MSG="修正しました" ;;
        2) USER_MSG="スクリプトを更新しました" ;;
        *) read -p "具体的に何をしたか入力してください: " USER_MSG ;;
    esac

    # コミット直前に再度計算
    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）
if [ "$BRANCH" = "main" ]; then
    # デプロイ直前に最終計算
    refresh_tag
    
    echo ""
    echo "🚀 デプロイ準備中: $SUGGESTED_TAG"
    read -p "🚀 【本番環境】へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # ローカルに不整合な古い同名タグがあれば削除
        if git rev-parse "$SUGGESTED_TAG" >/dev/null 2>&1; then
            git tag -d "$SUGGESTED_TAG" > /dev/null 2>&1
        fi
        
        git tag "$SUGGESTED_TAG"
        
        if git push origin "$SUGGESTED_TAG"; then
            echo "---------------------------------------"
            echo "✅ デプロイ成功！ バージョン: $SUGGESTED_TAG"
            echo "📡 GitHub Actions が起動しました。"
        else
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "❌ 失敗: リモートに $SUGGESTED_TAG が既に存在します。"
            echo "解決策: 一度手動で git fetch --tags -f を行ってください。"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        fi
    else
        echo "☕ 終了します。"
    fi
fi