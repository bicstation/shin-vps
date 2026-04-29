# ------------------------------
# 🔒 ロック（同時実行防止）
# ------------------------------
LOCK_FILE="/tmp/pc_pipeline.lock"

if [ -e "$LOCK_FILE" ]; then
    echo "⏳ Another job is running. Skip."
    exit 0
fi

trap "rm -f $LOCK_FILE" EXIT
touch "$LOCK_FILE"

# ------------------------------
# 📊 Ranking Score 更新
# ------------------------------
echo "📊 Updating Ranking Scores..."
$PY_CMD manage.py update_product_scores || { echo "❌ score update failed"; exit 1; }

# ------------------------------
# 🖼️ 画像キャッシュ（差分運用）
# ------------------------------
echo "🖼️ Caching Top Product Images..."

# 初回フル、それ以降は差分
FLAG_FILE="$PROJECT_ROOT/.image_cache_done.flag"

if [ ! -f "$FLAG_FILE" ]; then
    echo "🚀 First run: Full image caching (100)"
    $PY_CMD manage.py fetch_product_images --limit 100 --force || echo "⚠️ image fetch failed"
    touch "$FLAG_FILE"
else
    echo "⚡ Incremental caching (30)"
    $PY_CMD manage.py fetch_product_images --limit 30 || echo "⚠️ image fetch failed"
fi

# ------------------------------
# 📈 簡易ヘルスチェック
# ------------------------------
echo "📈 Top Ranking Preview"
RESP=$(curl -s http://localhost:8083/api/products/ranking/ | head -n 1)

if echo "$RESP" | grep -q "/media/products/"; then
    echo "✅ Image OK"
else
    echo "⚠️ Image may not be cached"
fi