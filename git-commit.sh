#!/bin/bash

# ==============================================================================
# 🚀 Git 統合スクリプト (Actions 監視・タグ同期・ガードレール完全版)
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

# 2. SSHエージェントのセットアップ (パスワード入力を1回に抑える)
if ! ssh-add -l > /dev/null 2>&1; then
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null 2>&1
    fi
    echo "🔑 SSH鍵をエージェントに登録します..."
    ssh-add ~/.ssh/id_ed25519
fi

# 3. 最新のタグを取得・計算する関数
refresh_tag() {
    # 完全に最新の状態にするために、リモートから強制取得
    git fetch --tags -f > /dev/null 2>&1
    
    # 全てのタグからバージョン番号順で最新を取得
    LATEST_TAG=$(git tag -l "v*" | sort -V | tail -n1)
    if [ -z "$LATEST_TAG" ]; then LATEST_TAG="v0.0.0"; fi
    
    # バージョン番号の分解と加算
    BASE_VERSION=$(echo "$LATEST_TAG" | cut -d. -f1-2)
    PATCH_VERSION=$(echo "$LATEST_TAG" | cut -d. -f3)
    SUGGESTED_TAG="${BASE_VERSION}.$((PATCH_VERSION + 1))"
}

# パスワード入力直後に最新情報を取得
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

    # コミット直前に最新タグを再計算
    refresh_tag
    FULL_MESSAGE="[$SUGGESTED_TAG] $TYPE: $USER_MSG"

    echo "💾 コミット中: \"$FULL_MESSAGE\""
    git add -A
    git commit -m "$FULL_MESSAGE"
    git push origin "$BRANCH"
fi

# 5. 本番デプロイ（タグ打ち）と GitHub Actions 監視
if [ "$BRANCH" = "main" ]; then
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
            echo "✅ タグのプッシュに成功しました。"
            
            # --- [新規] GitHub Actions 監視セクション ---
            if command -v gh &> /dev/null; then
                echo "📡 GitHub Actions の起動を待機中..."
                sleep 5 # Actionsがリストに現れるのを待つ
                
                echo "🕒 進行状況を監視しています (完了まで数分かかります)..."
                echo "※ 中断(Ctrl+C)しても、サーバー側でのデプロイは止まりません。"
                
                # 最新のジョブを監視し、終了ステータスを取得
                gh run watch --exit-status
                
                if [ $? -eq 0 ]; then
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🎉 デプロイ完了！ VPSへの反映に成功しました。"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                else
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "❌ デプロイ失敗！ GitHub Actions でエラーが発生しました。"
                    echo "確認コマンド: gh run view"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                fi
            else
                echo "---------------------------------------"
                echo "💡 gh コマンドが設定されていないため監視を終了します。"
                echo "📡 GitHub Actions 経由で VPS にファイルが転送されます。"
            fi
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