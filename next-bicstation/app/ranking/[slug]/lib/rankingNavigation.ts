// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/lib/rankingNavigation.ts

/* =========================================
🔥 Types
========================================= */

type NavigationItem = {

  title: string

  description?: string

  href: string

  actionLabel?: string
}

/* =========================================
🔥 Navigation Builder
========================================= */

export function
buildRankingNavigation(
  type: string
): NavigationItem[] {

  // ======================================
  // Usage Gaming
  // ======================================

  if (
    type === 'usage-gaming'
  ) {

    return [

      {
        title:
          '🎮 gaming向けランキング',

        description:
          '高FPS gaming向けおすすめ構成を比較。',

        href:
          '/ranking/usage-gaming',

        actionLabel:
          'gaming比較を見る →',
      },

      {
        title:
          '⚡ コスパ重視ランキング',

        description:
          '価格と性能のバランス重視モデルを比較。',

        href:
          '/ranking/usage-cost-performance',

        actionLabel:
          'コスパ比較を見る →',
      },

      {
        title:
          '🤖 AI向けランキング',

        description:
          'Stable Diffusion・AI workload向け構成。',

        href:
          '/ranking/usage-ai',

        actionLabel:
          'AI構成を見る →',
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
        title:
          '🤖 AI向け構成',

        description:
          '高VRAM GPUを中心にAI workload向け構成を比較。',

        href:
          '/ranking/usage-ai',

        actionLabel:
          'AI比較を見る →',
      },

      {
        title:
          '🧠 ローカルLLM向け',

        description:
          'ローカルAI実行向けおすすめ構成。',

        href:
          '/ranking/usage-local-llm',

        actionLabel:
          'LLM構成を見る →',
      },

      {
        title:
          '🎬 creator向けランキング',

        description:
          '動画編集・配信向け構成を比較。',

        href:
          '/ranking/usage-creator',

        actionLabel:
          'creator比較を見る →',
      },
    ]
  }

  // ======================================
  // Default
  // ======================================

  return [

    {
      title:
        '🏠 TOPページ',

      description:
        '人気ランキングや用途別比較一覧へ戻ります。',

      href:
        '/',

      actionLabel:
        'TOPへ戻る →',
    },

    {
      title:
        '📊 ランキング一覧',

      description:
        'gaming・AI・creatorなど用途別比較。',

      href:
        '/ranking',

      actionLabel:
        'ランキングを見る →',
    },

    {
      title:
        '🎯 PC診断',

      description:
        '用途に合うおすすめ構成を探索できます。',

      href:
        '/pc-finder',

      actionLabel:
        '診断を試す →',
    },
  ]
}

