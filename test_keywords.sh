#!/bin/bash

# ==============================================================================
# 🔍 BICSTATION: 3-SHOP COMPARISON (Pure Keyword Mode)
# 修正内容:
# 1. APIのバグを回避するため、リクエスト時の --none を廃止（キーワード優先）
# 2. --cat による絞り込みもリスクがあるため一旦外し、純粋なブランド一致数を計測
# ==============================================================================

MIDS=("13993" "43098" "37641")
SHOP_NAMES=("コジマ" "エディオン" "ソフマップ")
KEYWORDS=("fmv" "lavie" "dynabook" "surface" "macbook" "lenovo" "hp" "asus" "msi" "ゲーミングpc")

declare -A RESULTS

echo "======================================================"
echo "🧪 3大ショップ比較テスト (API挙動最適化版)"
echo "   方針: キーワードのみを送信し、API側の検索エンジンを正常に動作させる"
echo "======================================================"

for i in "${!MIDS[@]}"; do
    MID=${MIDS[$i]}
    SHOP=${SHOP_NAMES[$i]}
    echo "------------------------------------------------------"
    echo "📡 $SHOP (MID: $MID) 調査中..."

    for KEY in "${KEYWORDS[@]}"; do
        MATCHES="0"
        
        # 💡 APIにはキーワードのみを送る (これが最も安定して100件前後の正しい数字を返す)
        RAW_RESULT=$(docker compose exec -T django-v2 python manage.py linkshare_bc_api_parser \
            --mid "$MID" \
            --keyword "$KEY" \
            --max-pages 1 \
            --limit 1 2>/dev/null)

        # 💡 JSONから TotalMatches を抽出
        MATCHES=$(echo "$RAW_RESULT" | grep '"TotalMatches"' | grep -oP '"TotalMatches": \K[0-9]+' | head -n 1)
        
        if [ -z "$MATCHES" ]; then MATCHES="0"; fi
        
        RESULTS["${MID}_${KEY}"]=$MATCHES
        echo "  - $KEY ($SHOP): ${MATCHES} 件"
    done
done

# ======================================================
# 📊 最終比較表の出力
# ======================================================
echo -e "\n===================================================================="
echo "🏆 ショップ別・在庫件数 比較サマリー (API最適化版)"
echo "===================================================================="
printf "| %-14s | %10s | %10s | %10s |\n" "キーワード" "コジマ" "エディオン" "ソフマップ"
echo "|----------------|------------|------------|------------|"

for KEY in "${KEYWORDS[@]}"; do
    VAL1=${RESULTS["13993_${KEY}"]}
    VAL2=${RESULTS["43098_${KEY}"]}
    VAL3=${RESULTS["37641_${KEY}"]}
    printf "| %-14s | %10s | %10s | %10s |\n" "$KEY" "${VAL1:-0}" "${VAL2:-0}" "${VAL3:-0}"
done
echo "===================================================================="