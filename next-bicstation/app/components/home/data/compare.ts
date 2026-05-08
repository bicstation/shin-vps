// /home/maya/shin-vps/next-bicstation/app/components/home/data/compare.ts

export const HOME_QUICK_COMPARE = [
  {
    id: 'gaming',

    icon: '🎮',

    title: 'FPS Gaming',

    description:
      '高FPS・高リフレッシュレート向け gaming PC。',

    specs: [
      'RTX 5070〜',
      '144fps向け',
      '高冷却',
    ],

    href: '/ranking/gaming',
  },

  {
    id: 'ai',

    icon: '🤖',

    title: 'AI画像生成',

    description:
      'Stable Diffusion や生成AI用途向けの GPU構成。',

    specs: [
      'VRAM重視',
      'RTX GPU',
      '生成速度向上',
    ],

    href: '/ranking/ai',
  },

  {
    id: 'creator',

    icon: '🎬',

    title: '動画編集',

    description:
      'Premiere Pro・配信向けの creator PC。',

    specs: [
      '高性能CPU',
      '高速SSD',
      'マルチタスク',
    ],

    href: '/ranking/creator',
  },
] as const

/* =========================================================
🔥 TOP PICK POINTS
========================================================= */

export const HOME_TOP_PICK_POINTS = [
  '初心者にも人気',
  'FPS gaming対応',
  '動画編集も快適',
  'AI画像生成向け',
] as const