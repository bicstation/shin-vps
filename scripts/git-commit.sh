#!/bin/bash
# /home/maya/dev/shin-vps/scripts/git-commit.sh
# ===================================================================
# 🚀 SHIN-VPS v3 Git 統合デプロイスクリプト（完全版）
# ===================================================================

# --- [設定] 実行環境 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOST=$(hostname)
CURRENT_USER=$USER

# プロジェクトルートの動的決定
if [ -d "./.git" ]; then
    PROJECT_ROOT="$(pwd)"
elif [[ -d "/home/$CURRENT_USER/dev/shin-vps" ]]; then
    PROJECT_ROOT="/home/$CURRENT_USER/dev/shin-vps"
elif [[ -d "/home/$CURRENT_USER/shin-dev/shin-vps" ]]; then
    PROJECT_ROOT="/home/$CURRENT_USER/shin-dev/shin-vps"
else
    echo "❌ プロジェクトルートが見つかりません。git initされているか確認してください。"
    exit 1
fi

# --- [関数] ヘルプ表示 ---
show_help() {
    echo -e "\n\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "📖 \e[1mSHIN-VPS v3 デプロイ管理ツール\e[0m"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "\n\e[33m【運用ルール】\e[0m"
    echo "1. 修正はローカル（WSL2等）で行い、このスクリプトで push します。"
    echo "2. タグ(v*)を打つことで GitHub Actions が VPS へデプロイします。"
    echo "3. shared/ 等の変更も一括で管理可能です。"
    echo -e "\n\e[32m【使用方法】\e[0m"
    echo "  ./git-commit.sh            : コミット・タグ打ち開始"
    echo "  ./git-commit.sh -h         : ヘルプ表示"
    echo "  ./git-commit.sh rollback   : 過去タグでロールバック"
    echo "  ./git-commit.sh -t v1.0.123 : 指定タグでデプロイ"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m\n"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help; exit 0
fi

# --- VPS上での誤実行防止 ---
if [[ "$CURRENT_HOST" == *"x162-43"* ]]; then
    echo "❌ 警告: VPS (本番環境) です。ローカルから実行してください。"
    exit 1
fi

cd "$PROJECT_ROOT" || { echo "❌ ディレクトリ $PROJECT_ROOT が見つかりません。"; exit 1; }

# --- SSHエージェント起動 ---
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    [ -f "$HOME/.ssh/id_ed25519" ] && ssh-add "$HOME/.ssh/id_ed25519"
fi

# --- タグ管理 ---
refresh_tag() {
    git fetch --tags -f > /dev/null 2>&1
    LATEST_TAG=$(git tag -l "v*" | sort -V | tail -n1)
    [ -z "$LATEST_TAG" ] && LATEST_TAG="v3.0.0"
    MAJOR_MINOR=$(echo "$LATEST_TAG" | cut -d. -f1-2)
    PATCH=$(echo "$LATEST_TAG" | cut -d. -f3)
    SUGGESTED_TAG="${MAJOR_MINOR}.$((PATCH + 1))"
}

refresh_tag
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

echo "---------------------------------------"
echo "💻 実行環境: $CURRENT_HOST"
echo "📂 プロジェクト: $PROJECT_ROOT"
echo "🌿 ブランチ: $BRANCH | 現在: $LATEST_TAG"
echo "🚀 推奨次回タグ: $SUGGESTED_TAG"
echo "---------------------------------------"

# --- ロールバック処理 ---
if [[ "$1" == "rollback" ]]; then
    echo "🔄 過去タグでロールバックする場合はタグ名を指定:"
    git tag -l "v*" | sort -V
    read -p "タグ名: " R_TAG
    if [[ -z "$R_TAG" ]]; then
        echo "❌ タグが指定されませんでした。終了します。"
        exit 1
    fi
    echo "⚡ ロールバック: $R_TAG"
    git checkout "$R_TAG"
    echo "✅ チェックアウト完了: $R_TAG"
    exit 0
fi

# --- タグ指定オプション ---
if [[ "$1" == "-t" ]] && [[ -n "$2" ]]; then
    SUGGESTED_TAG="$2"
fi

# --- 変更コミット ---
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 差分なし。タグ確認へ進みます。"
else
    echo "📝 変更種別を選択:"
    echo "1) feat : 新機能"
    echo "2) fix  : 修正"
    echo "3) infra: 基盤"
    echo "4) chore: 雑用"
    read -p "番号 (1-4): " TYPE_NUM

    case $TYPE_NUM in
        1) TYPE="feat" ;;
        2) TYPE="fix" ;;
        3) TYPE="infra" ;;
        *) TYPE="chore" ;;
    esac

    echo -e "\n💬 メッセージを選択:"
    echo "1) SHIN-VPS v3 環境構築とスクリプトの強化"
    echo "2) Shared Library のパス調整と疎通確認"
    echo "3) 自由入力"
    read -p "選択 (1-3): " MSG_CHOICE

    case $MSG_CHOICE in
        1) USER_MSG="SHIN-VPS v3 環境構築とスクリプトの強化" ;;
        2) USER_MSG="Shared Library のパス調整と疎通確認" ;;
        *) read -p "メッセージ入力: " USER_MSG ;;
    esac

    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 Git Push 実行中..."
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# --- デプロイ ---
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
    echo -e "\n🚀 デプロイ実行確認: $SUGGESTED_TAG"
    read -p "GitHub Actions を起動して VPS へデプロイしますか？ (y/N): " DEPLOY_CONFIRM
    
    if [[ "$DEPLOY_CONFIRM" =~ ^[yY]$ ]]; then
        git tag "$SUGGESTED_TAG"
        if git push origin "$SUGGESTED_TAG"; then
            echo "✅ タグ $SUGGESTED_TAG を送信しました。"
            
            if command -v gh &> /dev/null; then
                echo "📡 Actions の進捗を監視します..."
                sleep 3
                gh run watch --exit-status
                [ $? -eq 0 ] && echo "🎉 デプロイ成功！VPS側が更新されました。"
            else
                echo "💡 GitHub Actions でデプロイが開始されました。"
            fi
        else
            echo "❌ タグ送信に失敗しました。"
        fi
    else
        echo "☕ 終了します（コミットのみ完了）。"
    fi  
fi

echo -e "\n✅ スクリプト終了"