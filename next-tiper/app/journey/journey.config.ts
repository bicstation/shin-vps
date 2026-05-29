export type JourneyItem = {
    id: string
    title: string
    subtitle: string
    description: string[]
    href: string
    cta: string
}

export const JOURNEY_ITEMS: JourneyItem[] = [

    {
    id: 'video',

    
    title: '動画を見る',

    subtitle: 'VIDEO ARCHIVE',

    description: [
    '人気動画を探す',
    'ランキングを見る',
    '作品を検索する',
    ],

    href: '/videos',

    cta: '動画一覧へ',
    

    },

    {
    id: 'live-chat',

    
    title: 'ライブチャット',

    subtitle: 'LIVE COMMUNICATION',

    description: [
    'リアルタイムで会話する',
    '初心者向けGuideを見る',
    'おすすめサービスを探す',
    ],

    href: '/guide/live-chat',

    cta: 'Guideを見る',
    

    },

    {
    id: 'chat-lady',

    
    title: 'チャットレディ',

    subtitle: 'CREATOR NETWORK',

    description: [
    '副業として始めたい',
    '人気サイトを比較する',
    '初心者向けGuideを見る',
    ],

    href: '/guide/chat-lady',

    cta: '比較Guideへ',
    

    },

    {
    id: 'matching',


    title: 'マッチング',

    subtitle: 'MATCHING GUIDE',

    description: [
    '恋活を始めたい',
    '出会いを探したい',
    'サービスを比較したい',
    ],

    href: '/guide/matching',

    cta: 'Guideを見る',
    

    },

]
