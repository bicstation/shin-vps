#!/bin/bash
# ==============================================================================
# 🚀 SHIN CORE LINX｜PC AUTO UPDATE UNIVERSAL v3（運用安定版）
# ==============================================================================
#
# ■ 目的
#   PCデータを取得 → 正規化 → AI解析 → Product化 → スコア更新 → API確認まで一括実行
#
# ■ 特徴
#   - Docker / 非Docker 両対応
#   - コンテナ状態チェック
#   - 失敗時即停止（set -e）
#   - API検証付き（空データ検知）
#   - ログ明示
#
# ■ 注意
#   - .env.pc 必須
#   - Djangoコンテナが起動している必要あり
#
# ==============================================================================

set -e

# -------------------------
# ■ 初期設定
# -------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/.env.pc" ]; then
  echo "❌ .env.pc not found"
  exit 1
fi

# 環境変数読み込み
source "$SCRIPT_DIR/.env.pc"

# -------------------------
# ■ ログ / エラー
# -------------------------
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
  echo "❌ ERROR: $1"
  exit 1
}

# -------------------------
# ■ コンテナ状態チェック
# -------------------------
check_django_running() {
  docker compose \
    --env-file "$PROJECT_ROOT/.env.local" \
    -f "$PROJECT_ROOT/$COMPOSE_FILE" ps | grep "$DJANGO_CON" | grep Up > /dev/null \
    || error_exit "Django container is not running"
}

# -------------------------
# ■ Django実行ラッパー
# -------------------------

# 通常実行（コンテナ必須）
run_django() {
  if [ "$USE_DOCKER" = "true" ]; then
    check_django_running
    docker compose \
      --env-file "$PROJECT_ROOT/.env.local" \
      -f "$PROJECT_ROOT/$COMPOSE_FILE" \
      exec -T "$DJANGO_CON" python3 manage.py "$@"
  else
    $PYTHON_BIN "$PROJECT_ROOT/$MANAGE_PATH" "$@"
  fi
}

# コンテナ不要実行（安全）
run_django_safe() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker compose \
      --env-file "$PROJECT_ROOT/.env.local" \
      -f "$PROJECT_ROOT/$COMPOSE_FILE" \
      run --rm "$DJANGO_CON" python3 manage.py "$@"
  else
    $PYTHON_BIN "$PROJECT_ROOT/$MANAGE_PATH" "$@"
  fi
}

# 生コマンド実行
run_django_raw() {
  if [ "$USE_DOCKER" = "true" ]; then
    check_django_running
    docker compose \
      --env-file "$PROJECT_ROOT/.env.local" \
      -f "$PROJECT_ROOT/$COMPOSE_FILE" \
      exec -T "$DJANGO_CON" "$@"
  else
    "$@"
  fi
}

# -------------------------
# ■ START
# -------------------------
log "🚀 START PC AUTO UPDATE"

# ==============================================================================
# ① データ取得（外部API / LinkShare）
# ==============================================================================
log "📡 Import"

run_django import_linkshare_data --mid 35909
run_django import_linkshare_data --mid 2557
run_django import_linkshare_data --mid 2543
run_django import_linkshare_data --mid 36508
run_django linkshare_bc_api_parser --mid 43708 --save-db

# ==============================================================================
# ② DB同期（FTP / API → DB）
# ==============================================================================
log "🔄 DB Sync"

SB="/usr/src/app/scrapers/src/shops"

run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 35909 --maker hp --prefix HP
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2557 --maker dell --prefix DELL
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2543 --maker fujitsu --prefix FUJITSU
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 36508 --maker dynabook --prefix DYNABOOK
run_django_raw python3 "$SB/import_bc_api_to_db.py" --mid 43708 --maker asus

# ==============================================================================
# ③ AI解析（スペック補完）
# ==============================================================================
log "🧠 Analyze"

run_django analyze_pc_spec --limit 50 --null-only

# ==============================================================================
# ④ 属性同期（タグ・分類）
# ==============================================================================
log "🏷️ Attributes"

if [ "$USE_DOCKER" = "true" ]; then
  docker cp "$PROJECT_ROOT/django/master_data/attributes.tsv" \
    "$DJANGO_CON:/usr/src/app/master_data/attributes.tsv" \
    || error_exit "Failed to copy attributes.tsv"
fi

run_django sync_master_attributes
run_django auto_map_attributes

# ==============================================================================
# ⑤ Product同期（最終商品テーブル）
# ==============================================================================
log "🔄 Product Sync"

run_django migrate_pc_products

# ==============================================================================
# ⑥ スコア更新（ランキング用）
# ==============================================================================
log "📊 Ranking"

run_django update_product_scores

# ==============================================================================
# ⑦ 画像キャッシュ（初回重め / 2回目軽め）
# ==============================================================================
log "🖼️ Image Cache"

FLAG_FILE="$PROJECT_ROOT/.image_cache_done.flag"

if [ ! -f "$FLAG_FILE" ]; then
  log "⚡ First run: full image fetch"
  run_django fetch_product_images --limit 100 --force
  touch "$FLAG_FILE"
else
  log "⚡ Incremental image fetch"
  run_django fetch_product_images --limit 30
fi

# ==============================================================================
# ⑧ API確認（最重要）
# ==============================================================================
log "📈 API Check"

RESPONSE=$(curl -s "$API_BASE/api/products/ranking/")

echo "$RESPONSE" | head -n 1

# 空レスポンス検知
if [ -z "$RESPONSE" ]; then
  error_exit "API response empty"
fi

# データ未投入検知
if [[ "$RESPONSE" == "[]" ]]; then
  error_exit "API returned empty list (data not loaded)"
fi

log "✅ DONE"