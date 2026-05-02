# /home/maya/shin-vps/django/api/services/finder_engine.py

from api.models import Product


# =========================
# 意味タグ定義
# =========================
MEANING_TAGS = {
    "light_ok": "普段使いが快適",
    "work_ok": "複数作業もスムーズ",
    "gaming_ok": "ゲームも快適に動作",
    "performance_high": "高性能で長く使える",
    "price_good": "コスパが良い",
    "portable": "持ち運びしやすい",
    "large_memory": "メモリに余裕あり",
    "fast_storage": "高速SSDで快適",
}


# =========================
# 意味タグ生成（attributesベース）
# =========================
def build_meaning_tags(p):
    tags = []

    # -------------------------
    # attributes取得
    # -------------------------
    if hasattr(p, "attributes"):
        try:
            attr_names = [a.name.lower() for a in p.attributes.all()]
        except Exception:
            attr_names = []
    else:
        attr_names = []

    price = p.price or 0

    # -------------------------
    # ゲーミング
    # -------------------------
    if any(x in a for a in attr_names for x in ["rtx", "geforce"]):
        tags.append("gaming_ok")

    # -------------------------
    # メモリ
    # -------------------------
    if any("16gb" in a for a in attr_names):
        tags.append("work_ok")

    if any("32gb" in a for a in attr_names):
        tags.append("large_memory")

    # -------------------------
    # SSD
    # -------------------------
    if any("ssd" in a or "nvme" in a for a in attr_names):
        tags.append("fast_storage")

    # -------------------------
    # 普段使い（最低保証）
    # -------------------------
    tags.append("light_ok")

    # -------------------------
    # コスパ
    # -------------------------
    if price and price < 150000:
        tags.append("price_good")

    return list(set(tags))


# =========================
# AI理由取得（最重要）
# =========================
def extract_ai_reason(product):
    pc = getattr(product, "pc_product", None)

    if not pc:
        return None

    # 優先順位：短くて刺さる順
    if getattr(pc, "ai_summary", None):
        return pc.ai_summary.strip()

    if getattr(pc, "description", None):
        return pc.description.strip()[:140]

    if getattr(pc, "ai_content", None):
        return pc.ai_content.strip()[:140]

    return None


# =========================
# スコアリング（減点式）
# =========================
def score_product(p, tags, use, priority):
    score = 100

    # -------------------------
    # 用途
    # -------------------------
    if use == "gaming":
        if "gaming_ok" not in tags:
            score -= 50

    elif use == "work":
        if "work_ok" not in tags:
            score -= 30

    elif use == "light":
        if "light_ok" not in tags:
            score -= 20

    # -------------------------
    # 優先
    # -------------------------
    if priority == "price":
        if "price_good" not in tags:
            score -= 20

    elif priority == "performance":
        if "performance_high" not in tags:
            score -= 20

    # -------------------------
    # PCProductのスコア活用（強化）
    # -------------------------
    pc = getattr(p, "pc_product", None)
    if pc:
        # 総合スコア加点
        score += (pc.spec_score or 0) * 0.2

        # 高性能ボーナス
        if pc.score_cpu and pc.score_cpu > 70:
            score += 5

        if pc.score_gpu and pc.score_gpu > 70:
            score += 5

        # コスパ補正
        if pc.score_cost and pc.score_cost > 70:
            score += 5

    return score


# =========================
# fallback理由（タグ）
# =========================
def build_reasons(tags):
    return [MEANING_TAGS[t] for t in tags if t in MEANING_TAGS][:3]


# =========================
# メインロジック
# =========================
def recommend_product(use, level, priority):
    products = Product.objects.select_related("pc_product").all()

    best = None
    best_score = -999
    best_tags = []

    for p in products:
        tags = build_meaning_tags(p)
        score = score_product(p, tags, use, priority)

        # -------------------------
        # レベル補正
        # -------------------------
        if level == "high":
            pc = getattr(p, "pc_product", None)

            if pc and pc.spec_score and pc.spec_score < 60:
                score -= 20
            elif "performance_high" not in tags:
                score -= 15

        # -------------------------
        # ベスト更新
        # -------------------------
        if score > best_score:
            best = p
            best_score = score
            best_tags = tags

    if not best:
        return None, []

    # -------------------------
    # 理由生成（AI優先）
    # -------------------------
    ai_reason = extract_ai_reason(best)

    if ai_reason:
        reasons = [ai_reason]
    else:
        reasons = build_reasons(best_tags)

    return best, reasons