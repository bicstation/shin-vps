#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (パスワード入力削減・コミット選択機能・ガードレール版)
# ==============================================================================

# --- [ガードレール] VPS上での実行を禁止するチェック ---
CURRENT_HOST=$(hostname)
if [[ "$CURRENT_HOST" == *"x162-43-73-204"* ]] || [[ -f "/.dockerenv" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  警告: VPS環境 (またはコンテナ内) での実行を検知しました。"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "このスクリプトは【ローカルPC】専用です。"
    echo "VPSでのソース直接修正は禁止されています。修正は必ずローカルで行い、"
    echo "デプロイ機能（タグプッシュ）を使って反映させてください。"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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

# 2. 最新のタグを取得・計算する関数
refresh_tag() {
    git fetch --tags -f > /dev/null 2>&1
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    
    BASE_VERSION=$(echo "$LATEST_TAG" | cut -d. -f1-2)
    PATCH_VERSION=$(echo "$LATEST_TAG" | cut -d. -f3)
    SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"
}

# 3. SSHエージェントのセットアップ (パスワード入力を1回に抑える)
# すでに鍵がエージェントに登録されているか確認
if ! ssh-add -l > /dev/null 2>&1; then
    # エージェントが起動していなければ起動
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null 2>&1
    fi
    # 鍵を登録（ここで1回だけパスワードを聞かれます）
    echo "🔑 SSH鍵をエージェントに登録します..."
    ssh-add ~/.ssh/id_ed25519
fi

# 初回タグ取得
refresh_tag

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOST"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "---------------------------------------"

# 4. 変更チェック & コミット
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。"
else
    # A. 変更種別の選択
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

    # B. コミット内容の選択/入力
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

    # コミット直前に最新タグを再計算してメッセージを作成
    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    
    # 既にssh-addしているので、ここではパスワードを聞かれません
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）
if [ "$BRANCH" = "main" ]; then
    refresh_tag
    
    echo ""
    echo "🚀 次のバージョンとしてデプロイ準備中: $SUGGESTED_TAG"
    read -p "🚀 【本番環境】へ $SUGGESTED_TAG としてデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # 重複タグのローカル掃除
        if git rev-parse "$SUGGESTED_TAG" >/dev/null 2>&1; then
            git tag -d "$SUGGESTED_TAG" > /dev/null 2>&1
        fi
        
        git tag "$SUGGESTED_TAG"
        
        if git push origin "$SUGGESTED_TAG"; then
            echo "---------------------------------------"
            echo "✅ デプロイ成功！ バージョン: $SUGGESTED_TAG"
            echo "📡 GitHub Actions が起動しました。完了まで数分お待ちください。"
        else
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "❌ 失敗: リモートに $SUGGESTED_TAG が既に存在します。"
            echo "解決策: git fetch --tags -f を実行してから再試行してください。"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        fi
    else
        echo "☕ 処理を中断しました。"
    fi
fi