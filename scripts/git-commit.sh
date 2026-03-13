#!/bin/bash
# /home/maya/dev/shin-vps/scripts/git-commit.sh
# ==============================================================================
# 🚀 SHIN-VPS v3 Git 統合デプロイスクリプト (WSL2 & Actions 完全対応版)
# ==============================================================================

# --- [設定] 実行ディレクトリの取得 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOST=$(hostname)
CURRENT_USER=$USER

# プロジェクトルートの動的決定 (v3パスを最優先)
# 優先順位：1. 現在のディレクトリに.gitがあるか 2. 指定の固定パス
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

# --- [関数] ヘルプ・注意事項の表示 ---
show_help() {
    echo -e "\n\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "📖 \e[1mSHIN-VPS v3 デプロイ管理ツール\e[0m"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
    echo -e "\n\e[33m【🚨 運用ルール】\e[0m"
    echo "1. 修正は WSL2 (ローカル) で行い、本スクリプトでプッシュします。"
    echo "2. タグ(v*)を打つことで GitHub Actions が本番 VPS へデプロイします。"
    echo "3. 共有ディレクトリ (shared/) の変更も一括で管理します。"
    
    echo -e "\n\e[32m【使用方法】\e[0m"
    echo "  ./deploy.sh           : コミット・タグ打ちを開始"
    echo "  ./deploy.sh -h        : ヘルプを表示"
    echo -e "\e[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m\n"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help; exit 0
fi

# --- [ガードレール] VPS上での実行を禁止 ---
if [[ "$CURRENT_HOST" == *"x162-43"* ]]; then
    echo "❌ 警告: VPS (本番環境) です。デプロイはローカルから行ってください。"
    exit 1
fi

cd "$PROJECT_ROOT" || { echo "❌ ディレクトリ $PROJECT_ROOT が見つかりません。"; exit 1; }

# 1. SSHエージェントの確認
if ! ssh-add -l > /dev/null 2>&1; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    [ -f "$HOME/.ssh/id_ed25519" ] && ssh-add "$HOME/.ssh/id_ed25519"
fi

# 2. 最新タグの取得とパッチバージョンの自動計算
refresh_tag() {
    git fetch --tags -f > /dev/null 2>&1
    LATEST_TAG=$(git tag -l "v*" | sort -V | tail -n1)
    [ -z "$LATEST_TAG" ] && LATEST_TAG="v3.0.0" # v3系からスタート
    
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
echo "🚀 次回予定: $SUGGESTED_TAG"
echo "---------------------------------------"

# 3. 変更のコミット処理
if [ -z "$(git status --porcelain)" ]; then
    echo "✨ 差分はありません。タグ打ち確認へ進みます。"
else
    echo "📝 変更種別を選択:"
    echo "1) feat : 新機能 (AIハンドラー追加など)"
    echo "2) fix  : 修正 (パス調整、バグ修正)"
    echo "3) infra: 基盤 (Docker, rebuild.sh更新)"
    echo "4) chore: 雑用 (コメント、整理)"
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
        *) read -p "メッセージを入力: " USER_MSG ;;
    esac

    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 Git Push 実行中..."
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 4. デプロイ（タグ打ち）セクション
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    refresh_tag
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
            echo "❌ タグの送信に失敗しました。"
        fi
    else
        echo "☕ 終了します（コミットのみ完了）。"
    fi  
fi
# saveコマンドの修正