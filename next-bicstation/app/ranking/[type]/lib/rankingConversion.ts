// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/lib/rankingConversion.ts

/* =========================================
🔥 Types
========================================= */

type TrustItem = {

  title: string

  description: string

  icon?: string
}

type RecommendationItem = {

  title: string

  description?: string

  href: string

  icon?: string
}

type BottomCTA = {

  title: string

  description: string

  trustItems: string[]

  primaryLabel: string

  primaryHref: string

  secondaryLabel: string

  secondaryHref: string
}

/* =========================================
🔥 Trust Builder
========================================= */

export function
buildTrustItems(
  type: string
): TrustItem[] {

  // ======================================
  // Usage Gaming
  // ======================================

  if (
    type === 'usage-gaming'
  ) {

    return [

      {
        icon: '🎮',

        title:
          '高FPS gaming対応',

        description:
          '144fps〜240fps gaming を想定した高性能GPU構成を中心に比較しています。',
      },

      {
        icon: '⚡',

        title:
          '初心者でも比較しやすい',

        description:
          '価格・性能・用途の違いをわかりやすく比較できます。',
      },

      {
        icon: '🛡️',

        title:
          '用途別に最適化',

        description:
          'FPS・配信・AAAゲーム向け構成を用途別に比較可能です。',
      },
    ]
  }

  // ======================================
  // Usage AI
  // ======================================

  if (
    type === 'usage-ai'
  ) {

    return [

      {
        icon: '🤖',

        title:
          'AI画像生成向け',

        description:
          'Stable Diffusion やローカルAI向けGPU構成を比較できます。',
      },

      {
        icon: '🧠',

        title:
          'VRAM重視比較',

        description:
          '高VRAM GPUを中心にAI workload向け構成を比較可能です。',
      },

      {
        icon: '⚡',

        title:
          '将来性も考慮',

        description:
          '今後のAI workload拡大も見据えた構成を選定しています。',
      },
    ]
  }

  // ======================================
  // Default
  // ======================================

  return [

    {
      icon: '🚀',

      title:
        '用途別比較対応',

      description:
        'gaming・動画編集・AIなど幅広い用途から比較できます。',
    },

    {
      icon: '💡',

      title:
        '初心者向け比較',

      description:
        '性能差や価格差をわかりやすく比較できます。',
    },

    {
      icon: '🛠️',

      title:
        '構成の違いを把握',

      description:
        'GPU・CPU・メモリ構成などを比較しやすく整理しています。',
    },
  ]
}

/* =========================================
🔥 Recommendation Builder
========================================= */

export function
buildRecommendations(
  type: string
): RecommendationItem[] {

  // ======================================
  // Usage Gaming
  // ======================================

  if (
    type === 'usage-gaming'
  ) {

    return [

      {
        icon: '🔥',

        title:
          'RTX 5090搭載モデル',

        description:
          '最高クラスの4K gaming性能を比較。',

        href:
          '/ranking/gpu-rtx-5090',
      },

      {
        icon: '⚡',

        title:
          'コスパ gaming PC',

        description:
          '価格とFPSのバランス重視モデル。',

        href:
          '/ranking/usage-cost-performance',
      },

      {
        icon: '🎯',

        title:
          '144fps向け構成',

        description:
          'eSports gaming向け高FPS構成。',

        href:
          '/ranking/usage-esports',
      },
    ]
  }

  // ======================================
  // Usage AI
  // ======================================

  if (
    type === 'usage-ai'
  ) {

    return [

      {
        icon: '🤖',

        title:
          'RTX 4090 AI構成',

        description:
          '高VRAM AI workload向け構成。',

        href:
          '/ranking/gpu-rtx-4090',
      },

      {
        icon: '🧠',

        title:
          'ローカルLLM向けPC',

        description:
          'ローカルAI実行向けおすすめ構成。',

        href:
          '/ranking/usage-local-llm',
      },

      {
        icon: '⚡',

        title:
          'AIコスパ構成',

        description:
          '価格とVRAMのバランス重視。',

        href:
          '/ranking/usage-ai-budget',
      },
    ]
  }

  // ======================================
  // Default
  // ======================================

  return [

    {
      icon: '🎮',

      title:
        'gaming向けランキング',

      description:
        '高FPS gaming向け構成を比較。',

      href:
        '/ranking/usage-gaming',
    },

    {
      icon: '🎬',

      title:
        '動画編集向けランキング',

      description:
        'creator workload向け構成を比較。',

      href:
        '/ranking/usage-creator',
    },

    {
      icon: '🤖',

      title:
        'AI向けランキング',

      description:
        'Stable Diffusion・AI workload向け構成。',

      href:
        '/ranking/usage-ai',
    },
  ]
}

/* =========================================
🔥 Bottom CTA Builder
========================================= */

export function
buildBottomCTA(
  type: string
): BottomCTA {

  // ======================================
  // Usage Gaming
  // ======================================

  if (
    type === 'usage-gaming'
  ) {

    return {

      title:
        '高FPS gaming向けPCを比較',

      description:
        '144fps・240fps gaming向け構成を比較できます。',

      trustItems: [

        '初心者向け比較',
        '高FPS gaming対応',
        '用途別おすすめ',
      ],

      primaryLabel:
        'gamingランキングを見る',

      primaryHref:
        '/ranking/usage-gaming',

      secondaryLabel:
        'PC診断を試す',

      secondaryHref:
        '/pc-finder',
    }
  }

  // ======================================
  // Usage AI
  // ======================================

  if (
    type === 'usage-ai'
  ) {

    return {

      title:
        'AI向けおすすめ構成を比較',

      description:
        'Stable Diffusion・LLM向けGPU構成を比較できます。',

      trustItems: [

        '高VRAM比較',
        'ローカルAI対応',
        '将来性重視',
      ],

      primaryLabel:
        'AIランキングを見る',

      primaryHref:
        '/ranking/usage-ai',

      secondaryLabel:
        'AI向けPC診断',

      secondaryHref:
        '/pc-finder',
    }
  }

  // ======================================
  // Default
  // ======================================

  return {

    title:
      'あなたに合うPCを比較',

    description:
      '用途・価格・性能から最適な構成を比較できます。',

    trustItems: [

      '初心者向け比較',
      '用途別おすすめ',
      'コスパ比較対応',
    ],

    primaryLabel:
      'ランキング一覧を見る',

    primaryHref:
      '/ranking',

    secondaryLabel:
      'PC診断を試す',

    secondaryHref:
      '/pc-finder',
  }
}

