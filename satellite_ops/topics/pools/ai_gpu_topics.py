import random

TOPICS = [

    {
        "title": "最近AI用途でGPUノートPC需要が増加",
        "summary": "ローカルAI用途でGPUノート需要が高まっている。",
    },

    {
        "title": "画像生成AIブームでVRAM需要が急上昇",
        "summary": "Stable Diffusion用途でVRAM重視が進んでいる。",
    },

    {
        "title": "外出先AI開発ニーズでモバイルGPU環境に注目",
        "summary": "持ち運び可能なAI開発環境への関心が高まっている。",
    },

    {
        "title": "ローカルLLM人気で高性能GPU搭載PC比較が活発化",
        "summary": "ローカルLLM用途でGPU比較需要が増えている。",
    },
    {
        "title": "最近は静音性重視のPC構成にも注目が集まる",
        "summary": "冷却性能と静音性の両立を重視する人が増えている。",
    },

    {
        "title": "デスク環境改善でウルトラワイドモニター需要が拡大",
        "summary": "作業効率向上を目的に大型モニター導入が進んでいる。",
    },

    {
        "title": "動画編集用途でOLEDノートPC人気が高まる",
        "summary": "色再現性を重視するクリエイター需要が増加している。",
    },

    ]

def get_random_topic():
    
        return random.choice(TOPICS)
    
