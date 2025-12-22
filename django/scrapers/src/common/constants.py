# システム共通の統合ジャンル（unified_genre）の定義
GENRE_DESKTOP = 'desktop'
GENRE_LAPTOP = 'laptop'
GENRE_MONITOR = 'monitor'
GENRE_PERIPHERAL = 'peripheral'
GENRE_OTHER = 'other'

# 各サイトの「生カテゴリ」を「統合ジャンル」に変換するマスターマップ
# メーカーが増えたらここに追加していく
GENRE_MAP = {
    'frontier': {
        'desktop': GENRE_DESKTOP,
        'laptop': GENRE_LAPTOP,
        'monitor': GENRE_MONITOR,
        'peripheral': GENRE_PERIPHERAL,
        'workstation': GENRE_DESKTOP,
    },
    'mouse': {
        'デスクトップ': GENRE_DESKTOP,
        'ノートPC': GENRE_LAPTOP,
        # ... 他のメーカーもここに追加
    }
}