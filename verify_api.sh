#!/bin/bash

# ==============================================================================
# 🔍 RAKUTEN LINKSHARE API: BEHAVIOR VERIFICATION SCRIPT
# 目的: 除外ワードの挙動と、キーワード絞り込みの効果を「見える化」する
# ==============================================================================

MID="13993" # コジマネット
BRAND="fmv"

echo "======================================================"
echo "🚀 楽天リンクシェアAPI 挙動検証テスト (MID: $MID)"
echo "======================================================"

# --- TEST 1: 単純キーワード ---
echo -e "\n[TEST 1] 単純キーワード検索 (fmvのみ)"
RESULT1=$(docker compose exec -T django-v2 python manage.py linkshare_bc_api_parser \
    --mid "$MID" --keyword "$BRAND" --limit 1 --max-pages 1 2>/dev/null)
MATCH1=$(echo "$RESULT1" | grep -oP '"TotalMatches": \K[0-9]+' | head -n 1)
echo "➡️ 結果: ${MATCH1:-0} 件 (おそらく54万件近い巨大な数字になります)"

# --- TEST 2: 複数除外ワード (カンマ区切り) ---
echo -e "\n[TEST 2] 複数除外ワードのテスト (ケース,カバー,フィルム)"
RESULT2=$(docker compose exec -T django-v2 python manage.py linkshare_bc_api_parser \
    --mid "$MID" --keyword "$BRAND" --none "ケース,カバー,フィルム" --limit 1 --max-pages 1 2>/dev/null)
MATCH2=$(echo "$RESULT2" | grep -oP '"TotalMatches": \K[0-9]+' | head -n 1)
echo "➡️ 結果: ${MATCH2:-0} 件 (TEST 1 と変わらなければ、カンマ区切りが効いていません)"

# --- TEST 3: 単一除外ワード (最も強力な1語) ---
echo -e "\n[TEST 3] 単一除外ワードのテスト (ケース)"
RESULT3=$(docker compose exec -T django-v2 python manage.py linkshare_bc_api_parser \
    --mid "$MID" --keyword "$BRAND" --none "ケース" --limit 1 --max-pages 1 2>/dev/null)
MATCH3=$(echo "$RESULT3" | grep -oP '"TotalMatches": \K[0-9]+' | head -n 1)
echo "➡️ 結果: ${MATCH3:-0} 件 (ここで数字が減れば、1語なら効くことが証明されます)"

# --- TEST 4: キーワード絞り込み (ブランド + パソコン) ---
echo -e "\n[TEST 4] キーワード絞り込みのテスト (fmv パソコン)"
RESULT4=$(docker compose exec -T django-v2 python manage.py linkshare_bc_api_parser \
    --mid "$MID" --keyword "$BRAND パソコン" --none "ケース" --limit 1 --max-pages 1 2>/dev/null)
MATCH4=$(echo "$RESULT4" | grep -oP '"TotalMatches": \K[0-9]+' | head -n 1)
echo "➡️ 結果: ${MATCH4:-0} 件 (PC本体に近い、現実的な数字になるはずです)"

echo -e "\n------------------------------------------------------"
echo "💡 考察メモ:"
echo "1. TEST 2 と 3 を比較して、数字が同じなら『複数指定不可』が確定。"
echo "2. TEST 4 で数字が激減すれば、『キーワード追加による絞り込み』が必須。"
echo "------------------------------------------------------"