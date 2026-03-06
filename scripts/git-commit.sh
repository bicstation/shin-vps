#!/bin/bash

# ==============================================================================
# 🚀 Git 統合デプロイスクリプト (Actions 監視・タグ同期・WSL2ネイティブ対応版)
# ==============================================================================

# --- [設定] 実行ディレクトリの取得 ---
# スクリプトが置いてある場所をプロジェクトのルートとして自動認識します
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOST=$(hostname)
CURRENT_USER=$USER

# プロジェクトルートの決定 (優先順位: 今いる場所 > ネイティブ > 旧マウント)
if [ -f "$SCRIPT_DIR/.git/config" ]; then
    PROJECT_ROOT="$SCRIPT_DIR"
elif [[ -d "/home/$CURRENT_USER/dev/shin-vps" ]]; then
    PROJECT_ROOT="/home/$CURRENT_USER/dev/shin-vps"
elif [[ -d "/mnt/e/dev/shin-vps" ]]; then
    PROJECT_ROOT="/mnt/e/dev/shin-vps"
else
    PROJECT_ROOT="/mnt/c/dev/SHIN-VPS"
fi

# --- [関数] ヘルプ・注意事項の表示 ---
show_help() {
    echo -e "\n\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "📖 \e[1mSHIN-VPS デプロイ管理ツール (Git Integration)\e[0m"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "\n\e[33m【🚨 最重要事項】\e[0m"
    echo "1. 本番サーバー(VPS)上での直接編集は「厳禁」です。"
    echo "2. 修正は必ずローカルPCで行い、本スクリプトでプッシュしてください。"
    echo "3. タグ(v1.x.x)を打つことで GitHub Actions が起動し、自動デプロイされます。"
    
    echo -e "\n\e[32m【使用方法】\e[0m"
    echo "  ./deploy.sh           : コミット・デプロイ作業を開始"
    echo "  ./deploy.sh -h        : ヘルプを表示"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m\n"
}

# 引数チェック
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# --- [ガードレール] VPS上での実行を禁止 ---
if [[ "$CURRENT_HOST" == *"x162-43"* ]] || [[ -f "/.dockerenv" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  警告: VPS環境またはコンテナ内での実行を検知しました。"
    echo "このスクリプトは【ローカルPC】専用です。終了します。"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi

cd "$PROJECT_ROOT" || { echo "❌ プロジェクトディレクトリが見つかりません。"; exit 1; }

# 2. SSHエージェントのセットアップ
if ! ssh-add -l > /dev/null 2>&1; then
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null 2>&1
    fi
    # 鍵のパスが存在するか確認
    SSH_KEY="$HOME/.ssh/id_ed25519"
    if [ -f "$SSH_KEY" ]; then
        echo "🔑 SSH鍵をエージェントに登録します..."
        ssh-add "$SSH_KEY"
    fi
fi

# 3. 最新のタグを取得・計算する関数
refresh_tag() {
    git fetch --tags -f > /dev/null 2>&1
    LATEST_TAG=$(git tag -l "v*" | sort -V | tail -n1)
    if [ -z "$LATEST_TAG" ]; then LATEST_TAG="v1.0.0"; fi
    
    MAJOR_MINOR=$(echo "$LATEST_TAG" | cut -d. -f1-2)
    PATCH=$(echo "$LATEST_TAG" | cut -d. -f3)
    SUGGESTED_TAG="${MAJOR_MINOR}.$((PATCH + 1))"
}

refresh_tag
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOST"
echo "📂 開発領域: $PROJECT_ROOT"
echo "🌿 ブランチ: $BRANCH | 現在のVer: $LATEST_TAG"
echo "🚀 次回予定 : $SUGGESTED_TAG"
echo "---------------------------------------"

# 4. 変更チェック & コミット
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 変更はありません。デプロイ(タグ打ち)確認へ進みます。"
else
    echo "📝 変更種別を選んでください:"
    echo "1) fix    (バグ修正・調整)"
    echo "2) feat   (新機能追加)"
    echo "3) docs   (設定変更・文書)"
    echo "4) chore  (整理・その他)"
    read -p "番号を選択 (1-4): " TYPE_NUM

    case $TYPE_NUM in
        1) TYPE="fix" ;;
        2) TYPE="feat" ;;
        3) TYPE="docs" ;;
        *) TYPE="chore" ;;
    esac

    echo -e "\n💬 コミットメッセージ:"
    echo "1) 修正しました"
    echo "2) スクリプトを更新しました"
    echo "3) 自分で入力する"
    read -p "選択 (1-3): " MSG_CHOICE

    case $MSG_CHOICE in
        1) USER_MSG="修正しました" ;;
        2) USER_MSG="スクリプトを更新しました" ;;
        *) read -p "内容を入力: " USER_MSG ;;
    esac

    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット & プッシュ中..."
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）と GitHub Actions 監視
if [ "$BRANCH" = "main" ]; then
    refresh_tag
    echo -e "\n🚀 デプロイ準備: $SUGGESTED_TAG"
    read -p "🚀 【本番サーバー】へデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        # 既存タグの削除（ローカルのみ）
        git tag -d "$SUGGESTED_TAG" > /dev/null 2>&1
        
        git tag "$SUGGESTED_TAG"
        
        if git push origin "$SUGGESTED_TAG"; then
            echo "✅ タグのプッシュに成功しました。"
            
            # GitHub CLI (gh) がある場合は監視モードへ
            if command -v gh &> /dev/null; then
                echo "📡 Actions の起動を待機中..."
                sleep 5 
                echo "🕒 進行状況を監視します..."
                gh run watch --exit-status
                
                if [ $? -eq 0 ]; then
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🎉 デプロイ完了！ VPSに正常に反映されました。"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                else
                    echo "❌ Actions でエラーが発生しました。'gh run view' で確認してください。"
                fi
            else
                echo "📡 GitHub Actions 経由でデプロイが開始されました（ghコマンド未検出のため監視略）。"
            fi
        else
            echo "❌ タグのプッシュに失敗しました。リモートのタグを確認してください。"
        fi
    else
        echo "☕ 終了します。"
    fi
fi