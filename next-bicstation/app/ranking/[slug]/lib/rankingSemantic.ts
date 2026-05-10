// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/lib/rankingSemantic.ts

/* =========================================
🔥 Types
========================================= */

type SemanticLanding = {

  title: string

  description: string

  label?: string
}

type SemanticInsight = {

  icon?: string

  title: string

  description: string
}

/* =========================================
🔥 Semantic Landing Copy
========================================= */

const semanticLandingCopy:
  Record<
    string,
    SemanticLanding
  > = {

  gaming: {

    title:
      'ゲーム向けおすすめPC',

    description:
      '高FPS・高性能GPU構成を中心に、gaming用途に最適なPCを比較できます。',

    label:
      'GAMING RANKING',
  },

  ai: {

    title:
      'AI向けおすすめPC',

    description:
      'Stable Diffusion・LLM・ローカルAI workload向け構成を比較できます。',

    label:
      'AI WORKLOAD',
  },

  creator: {

    title:
      '動画編集向けおすすめPC',

    description:
      '4K動画編集・配信・creator workload向け高性能構成を比較できます。',

    label:
      'CREATOR WORKFLOW',
  },

  work: {

    title:
      '仕事向けおすすめPC',

    description:
      'ビジネス・開発・作業効率を重視した構成を比較できます。',

    label:
      'WORK PRODUCTIVITY',
  },
}

/* =========================================
🔥 Semantic Metadata Resolver
========================================= */

export function
buildSemanticMetadata(
  type: string
): SemanticLanding {

  // ======================================
  // GPU
  // ======================================

  if (
    type.startsWith(
      'gpu-'
    )
  ) {

    const gpu =
      type
        .replace(
          'gpu-',
          ''
        )
        .replaceAll(
          '-',
          ' '
        )
        .toUpperCase()

    return {

      title:
        `${gpu}搭載おすすめPC`,

      description:
        `${gpu}を搭載した高性能PCを比較できます。gaming・creator・AI workload に対応。`,

      label:
        'GPU RANKING',
    }
  }

  // ======================================
  // Usage
  // ======================================

  if (
    type.startsWith(
      'usage-'
    )
  ) {

    const usage =
      type.replace(
        'usage-',
        ''
      )

    return (

      semanticLandingCopy[
        usage
      ]

      || {

        title:
          'おすすめPCランキング',

        description:
          '用途別におすすめ構成を比較できます。',

        label:
          'SEMANTIC RANKING',
      }
    )
  }

  // ======================================
  // Maker
  // ======================================

  if (
    type.startsWith(
      'maker-'
    )
  ) {

    const maker =
      type
        .replace(
          'maker-',
          ''
        )
        .toUpperCase()

    return {

      title:
        `${maker}おすすめPC`,

      description:
        `${maker}ブランドの人気PCを比較できます。`,

      label:
        'MAKER RANKING',
    }
  }

  // ======================================
  // Default
  // ======================================

  return {

    title:
      'おすすめPCランキング',

    description:
      'semantic recommendation に基づくおすすめPC一覧。',

    label:
      'SEMANTIC RANKING',
  }
}

/* =========================================
🔥 Semantic Insights
========================================= */

export function
buildSemanticInsights(
  products: any[]
): SemanticInsight[] {

  if (!products?.length) {
    return []
  }

  const joinedText =
    JSON.stringify(
      products
    ).toLowerCase()

  const insights:
    SemanticInsight[] = []

  // ======================================
  // GPU
  // ======================================

  if (
    joinedText.includes(
      '4090'
    )

    || joinedText.includes(
      '4080'
    )
  ) {

    insights.push({

      icon:
        '🎮',

      title:
        '高性能GPUモデル中心',

      description:
        'RTX4080以上の構成が多く、高FPS gaming や重量級 workload に適しています。',
    })
  }

  // ======================================
  // AI
  // ======================================

  if (

    joinedText.includes(
      'ai'
    )

    || joinedText.includes(
      'stable diffusion'
    )

    || joinedText.includes(
      'llm'
    )

  ) {

    insights.push({

      icon:
        '🤖',

      title:
        'AI workload対応',

      description:
        '高VRAM GPUを中心にローカルAI workload に適した構成が集まっています。',
    })
  }

  // ======================================
  // Creator
  // ======================================

  if (

    joinedText.includes(
      'creator'
    )

    || joinedText.includes(
      'davinci'
    )

    || joinedText.includes(
      'premiere'
    )

  ) {

    insights.push({

      icon:
        '🎬',

      title:
        'creator workflow向け',

      description:
        '動画編集・配信・4K workflow に適した高性能構成が中心です。',
    })
  }

  // ======================================
  // High Memory
  // ======================================

  if (

    joinedText.includes(
      '64gb'
    )

    || joinedText.includes(
      '32gb'
    )

  ) {

    insights.push({

      icon:
        '🧠',

      title:
        '大容量メモリ構成',

      description:
        '32GB以上メモリ搭載モデルが多く、複数 workload に対応できます。',
    })
  }

  // ======================================
  // Fallback
  // ======================================

  if (
    !insights.length
  ) {

    insights.push({

      icon:
        '💡',

      title:
        '人気構成を中心に比較',

      description:
        '用途別に人気の高いおすすめ構成を比較できます。',
    })
  }

  return insights
}

