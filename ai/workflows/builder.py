from templates import STYLE, QUALITY, NEGATIVE

def build_prompt(title: str):
    subject = title
    scene = "cyberpunk city, neon lights, futuristic"

    positive = f"{STYLE}, {subject}, {scene}, {QUALITY}"
    negative = NEGATIVE

    return positive, negative