# api/utils/genre_classifier.py

def classify_genre(name: str) -> str:
    if not name:
        return "OTHER"

    text = name.lower()

    # モニター優先
    if any(x in text for x in [
        "monitor", "display", "モニター", "ディスプレイ"
    ]):
        return "MONITOR"

    # PC
    if any(x in text for x in [
        "laptop", "notebook", "ノート", "desktop", "デスクトップ"
    ]):
        return "PC"

    return "OTHER"