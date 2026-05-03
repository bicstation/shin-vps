# /api/services/ranking_service.py

def calculate_ranking_score(product):

    # -------------------------
    # 基本
    # -------------------------
    base = 50

    # -------------------------
    # 属性取得
    # -------------------------
    gpu = get_main_attr(product, "gpu")
    cpu = get_main_attr(product, "cpu")
    mem = get_main_attr(product, "memory")

    gpu_score = gpu.order if gpu else 0
    cpu_score = cpu.order if cpu else 0
    mem_score = mem.order if mem else 0

    # -------------------------
    # PCProduct
    # -------------------------
    pc = product.pc_product

    spec_score = getattr(pc, "spec_score", 0)
    cost_score = getattr(pc, "score_cost", 0)
    price = getattr(product, "price", 0)

    # -------------------------
    # 🎯 スコア計算（改良）
    # -------------------------
    score = (
        spec_score * 0.4 +      # 下げた
        gpu_score * 0.25 +
        cpu_score * 0.1 +
        mem_score * 0.05 +
        cost_score * 0.2        # 強化（重要）
    )

    # -------------------------
    # 💰 価格補正（超重要）
    # -------------------------
    if price > 0:
        if price < 180000:
            score += 25   # 強化
        elif price < 250000:
            score += 15
        elif price > 500000:
            score -= 15   # ペナルティ

    # -------------------------
    # 🎮 GPUボーナス
    # -------------------------
    if gpu_score >= 90:
        score += 10

    # -------------------------
    # 🧠 用途ブースト
    # -------------------------
    title = (product.title or "").lower()

    if "gaming" in title or "ゲーミング" in title:
        score += 10

    if "creator" in title:
        score += 5

    # -------------------------
    # ❌ 不要除外
    # -------------------------
    if any(x in title for x in ["monitor", "モニター", "server", "poweredge"]):
        return 0

    return round(score, 2)


# -------------------------
# 補助
# -------------------------
def get_main_attr(product, attr_type):
    attrs = [a for a in product.attributes.all() if a.attr_type == attr_type]
    if not attrs:
        return None
    return sorted(attrs, key=lambda x: x.order or 0, reverse=True)[0]