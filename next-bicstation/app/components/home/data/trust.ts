// /home/maya/shin-vps/next-bicstation/app/components/home/data/trust.ts

export const HOME_TRUST_POINTS = [
  {
    id: 'beginner',

    icon: '🛡',

    title: '初心者でも比較しやすい',

    description:
      '用途ベース recommendation により、スペック知識がなくても探しやすい。',
  },

  {
    id: 'ai-support',

    icon: '🤖',

    title: 'AI用途もわかりやすい',

    description:
      '画像生成・動画編集・LLM用途などを semantic に比較できます。',
  },

  {
    id: 'balanced',

    icon: '⚖',

    title: '失敗しにくい選び方',

    description:
      '価格だけでなく、長く使いやすい構成も重視しています。',
  },

  {
    id: 'gaming',

    icon: '🎮',

    title: '用途別 recommendation',

    description:
      'FPS gaming・配信・creator用途など目的別に比較できます。',
  },
] as const

/* =========================================================
🔥 TRUST BADGES
========================================================= */

export const HOME_TRUST_BADGES = [
  '初心者向け比較',
  'AI semantic support',
  'FPS gaming対応',
  '長く使いやすい',
] as const