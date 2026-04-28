# api/services/label_service.py

def generate_label(product):
    """
    ラベルは「1商品1メッセージ」
    優先順位で決める（安全版）
    """

    # 安全に値取得
    rank = getattr(product, "rank", None)
    price = getattr(product, "price", None)
    score_gpu = getattr(product, "score_gpu", None)
    score_cpu = getattr(product, "score_cpu", None)

    # -----------------
    # 1位専用（最優先）
    # -----------------
    if rank == 1:
        return "🔥 迷ったらこれ"

    # -----------------
    # 価格帯
    # -----------------
    if price is not None:
        if price < 150000:
            return "💰 コスパ最強"
        if price > 400000:
            return "👑 妥協なしの最強構成"

    # -----------------
    # 性能（GPU）
    # -----------------
    if score_gpu is not None:
        try:
            if score_gpu >= 90:
                return "🎮 FPSガチ勢向け"
        except TypeError:
            pass  # 型不正でも落とさない

    # -----------------
    # 性能（CPU）
    # -----------------
    if score_cpu is not None:
        try:
            if score_cpu >= 85:
                return "💻 仕事も爆速"
        except TypeError:
            pass

    # -----------------
    # デフォルト
    # -----------------
    return "⚖ バランス最強"