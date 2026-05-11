#!/bin/bash
# プロジェクト全体で絶対パス @/app/... を相対パスに置換するスクリプト
# 注意: 実行前に git commit などでバックアップ推奨

TARGET_DIR="./app/concierge"
REPORT_FILE="./import_fix_report.txt"

echo "=== Absolute Import Fix Report ===" > "$REPORT_FILE"
echo "対象ディレクトリ: $TARGET_DIR" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# ファイル単位で置換
find $TARGET_DIR -type f -name "*.tsx" | while read FILE; do
    MODIFIED=0

    # grep で @/app/concierge を検索
    grep -q "@/app/concierge" "$FILE"
    if [ $? -eq 0 ]; then
        # レポートに記録
        echo "修正対象: $FILE" >> "$REPORT_FILE"

        # sed で置換: @/app/concierge -> 相対パス '../...' に変換
        # 注意: プロジェクト階層に応じて必要に応じて ../ を増減
        sed -i "s|@/app/concierge|..|g" "$FILE"

        echo "  - 置換済み" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        MODIFIED=1
    fi
done

echo "✅ 絶対パス import を相対パスに置換しました。"
echo "詳細は $REPORT_FILE を確認してください。"