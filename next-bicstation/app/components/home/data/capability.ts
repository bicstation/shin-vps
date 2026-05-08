// /home/maya/shin-vps/next-bicstation/app/components/home/data/capability.ts

export const HOME_CAPABILITIES = [
  {
    id: 'gaming',

    icon: '🎮',

    title: 'FPS Gaming',

    description:
      '高fps・高リフレッシュレート向けの gaming performance を重視。',
  },

  {
    id: 'ai',

    icon: '🤖',

    title: 'AI画像生成',

    description:
      'Stable Diffusion・生成AI用途に向いた GPU構成を比較。',
  },

  {
    id: 'creator',

    icon: '🎬',

    title: '動画編集',

    description:
      'Premiere Pro や streaming に適した creator PC。',
  },

  {
    id: 'streaming',

    icon: '📡',

    title: '配信・マルチタスク',

    description:
      'ゲーム配信や複数アプリ同時利用にも強い構成。',
  },

  {
    id: 'balanced',

    icon: '⚖',

    title: '長く使いやすい',

    description:
      '価格・性能・将来性のバランスを重視した recommendation。',
  },

  {
    id: 'beginner',

    icon: '💡',

    title: '初心者向け',

    description:
      'スペック知識がなくても比較しやすい semantic guide。',
  },
] as const