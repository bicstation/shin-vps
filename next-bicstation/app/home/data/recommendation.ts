// /home/maya/shin-vps/next-bicstation/app/components/home/data/recommendation.ts

export const HOME_RECOMMENDATION_PATHS = [
  {
    id: 'usage-gaming',

    icon: '🎮',

    title: 'FPS Gaming',

    description:
      '高fps・高リフレッシュレート向け gaming PC を比較。',

    href: '/ranking/usage-gaming',
  },

  {
    id: 'usage-ai',

    icon: '🤖',

    title: 'AI画像生成',

    description:
      'Stable Diffusion・生成AI用途向け GPU構成。',

    href: '/ranking/usage-ai',
  },

  {
    id: 'usage-creator',

    icon: '🎬',

    title: '動画編集',

    description:
      'Premiere Pro や streaming 向け creator PC。',

    href: '/ranking/usage-creator',
  },

  {
    id: 'usage-budget',

    icon: '💴',

    title: 'コスパ重視',

    description:
      '価格と性能のバランスが良い recommendation。',

    href: '/ranking/usage-budget',
  },

  {
    id: 'usage-mobile',

    icon: '💡',

    title: '初心者向け',

    description:
      '初めてでも比較しやすい semantic guide。',

    href: '/ranking/usage-mobile',
  },

  {
    id: 'usage-business',

    icon: '🧠',

    title: '長く使いやすい',

    description:
      '将来性や拡張性も考慮した balanced PC。',

    href: '/ranking/usage-business',
  },
] as const

/* =========================================================
🔥 INTENT NAVIGATION
========================================================= */

export const INTENT_NAV = [
  {
    slug: 'usage-gaming',

    icon: '🎮',

    label: 'FPS Gaming',

    description:
      '高fps gaming 向けの人気構成。',
  },

  {
    slug: 'usage-ai',

    icon: '🤖',

    label: 'AI画像生成',

    description:
      'Stable Diffusion 向け GPU構成。',
  },

  {
    slug: 'usage-creator',

    icon: '🎬',

    label: '動画編集',

    description:
      '動画編集・配信向け creator PC。',
  },

  {
    slug: 'usage-budget',

    icon: '💴',

    label: 'コスパ重視',

    description:
      '価格と性能のバランスを重視。',
  },

  {
    slug: 'usage-mobile',

    icon: '💡',

    label: '初心者向け',

    description:
      '初めてでも比較しやすい構成。',
  },

  {
    slug: 'usage-business',

    icon: '🧠',

    label: '長く使いやすい',

    description:
      '将来性も考慮した balanced recommendation。',
  },
] as const