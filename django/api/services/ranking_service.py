# /home/maya/shin-vps/django/api/services/ranking_service.py

def calculate_ranking_score(product):

    score = 50

    tags = get_tags_from_attributes(product)
    price = product.price or 0

    # -----------------
    # GPU（最重要）
    # -----------------
    if has_tag(tags, "rtx 5090"):
        score += 50
    elif has_tag(tags, "rtx 5080"):
        score += 45
    elif has_tag(tags, "rtx 5070"):
        score += 40
    elif has_tag(tags, "rtx 4090"):
        score += 38
    elif has_tag(tags, "rtx 4080"):
        score += 35
    elif has_tag(tags, "rtx 4070"):
        score += 30
    elif has_tag(tags, "rtx 4060"):
        score += 20
    elif has_tag(tags, "rtx"):
        score += 15

    # GPU補正（かなり効く）
    if has_tag(tags, "rtx"):
        score += 10

    # -----------------
    # CPU
    # -----------------
    if has_tag(tags, "core i9") or has_tag(tags, "ryzen 9"):
        score += 25
    elif has_tag(tags, "core i7"):
        score += 20
    elif has_tag(tags, "core i5"):
        score += 10

    # -----------------
    # メモリ
    # -----------------
    if has_tag(tags, "32gb"):
        score += 15
    elif has_tag(tags, "16gb"):
        score += 10

    # -----------------
    # 用途（ここ修正）
    # -----------------
    if has_tag(tags, "ゲーミング"):
        score += 20   # 少し強めにする
    if has_tag(tags, "クリエイター"):
        score += 15
    if has_tag(tags, "ビジネス"):
        score += 8
    if has_tag(tags, "モバイル"):
        score += 10
    if not has_tag(tags, "rtx"):
        score -= 10

    title = (product.title or "").lower()   
    if (
        "モニター" in title
        or "monitor" in title
        or "server" in title
        or "poweredge" in title
    ):
        return 0
    
    # -----------------
    # 価格
    # -----------------
    if price > 0:
        if price < 150000:
            score += 25
        elif price < 250000:
            score += 10
        elif price > 500000:
            score -= 10
    
    if score >= 140:
        score += 20

    return score

def has_tag(tags, keyword):
    return any(keyword in t for t in tags)

def get_tags_from_attributes(product):
    attrs = list(product.attributes.all())

    tags = []

    for a in attrs:
        tags.append(a.name.lower())

    return tags