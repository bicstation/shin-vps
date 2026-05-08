// /home/maya/shin-vps/next-bicstation/app/components/home/data/recommendation.ts

export const HOME_RECOMMENDATION_PATHS = [
  {
    id: 'gaming',

    icon: '🎮',

    title: 'FPS Gaming',

    description:
      '高fps・高リフレッシュレート向け gaming PC を比較。',

    href: '/ranking/gaming',
  },

  {
    id: 'ai',

    icon: '🤖',

    title: 'AI画像生成',

    description:
      'Stable Diffusion・生成AI用途向け GPU構成。',

    href: '/ranking/ai',
  },

  {
    id: 'creator',

    icon: '🎬',

    title: '動画編集',

    description:
      'Premiere Pro や streaming 向け creator PC。',

    href: '/ranking/creator',
  },

  {
    id: 'cost',

    icon: '💴',

    title: 'コスパ重視',

    description:
      '価格と性能のバランスが良い recommendation。',

    href: '/ranking/cost-performance',
  },

  {
    id: 'beginner',

    icon: '💡',

    title: '初心者向け',

    description:
      '初めてでも比較しやすい semantic guide。',

    href: '/ranking/beginner',
  },

  {
    id: 'longuse',

    icon: '🧠',

    title: '長く使いやすい',

    description:
      '将来性や拡張性も考慮した balanced PC。',

    href: '/ranking/balanced',
  },
] as const

/* =========================================================
🔥 INTENT NAVIGATION
========================================================= */

export const INTENT_NAV = [
  {
    slug: 'gaming',

    icon: '🎮',

    label: 'FPS Gaming',

    description:
      '高fps gaming 向けの人気構成。',
  },

  {
    slug: 'ai',

    icon: '🤖',

    label: 'AI画像生成',

    description:
      'Stable Diffusion 向け GPU構成。',
  },

  {
    slug: 'creator',

    icon: '🎬',

    label: '動画編集',

    description:
      '動画編集・配信向け creator PC。',
  },

  {
    slug: 'cost-performance',

    icon: '💴',

    label: 'コスパ重視',

    description:
      '価格と性能のバランスを重視。',
  },

  {
    slug: 'beginner',

    icon: '💡',

    label: '初心者向け',

    description:
      '初めてでも比較しやすい構成。',
  },

  {
    slug: 'balanced',

    icon: '🧠',

    label: '長く使いやすい',

    description:
      '将来性も考慮した balanced recommendation。',
  },
] as const