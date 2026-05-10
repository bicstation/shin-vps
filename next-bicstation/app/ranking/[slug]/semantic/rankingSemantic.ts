// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/semantic/rankingSemantic.ts

/* =========================================
🔥 Types
========================================= */

type SemanticMetadata = {

  title: string

  description: string

  icon?: string

  semantic_role?: string

  semantic_weight?: number
}

/* =========================================
🔥 Semantic Landing Copy
========================================= */

const semanticLandingCopy:
  Record<
    string,
    SemanticMetadata
  > = {

  gaming: {

    title:
      'ゲーム向けおすすめPC',

    description:
      '高FPS・高性能GPU構成を中心に、ゲーム用途に最適なPCを比較できます。',

    icon:
      '🎮',

    semantic_role:
      'highlight',
  },

  work: {

    title:
      '仕事向けおすすめPC',

    description:
      'ビジネス・事務・作業効率を重視したおすすめ構成。',

    icon:
      '💼',

    semantic_role:
      'primary',
  },

  creator: {

    title:
      '動画編集向けおすすめPC',

    description:
      '動画編集・配信・クリエイティブ作業向けの高性能構成。',

    icon:
      '🎬',

    semantic_role:
      'primary',
  },
}

/* =========================================
🔥 Semantic Resolver
========================================= */

export function
resolveSemanticMetadata(
  type: string
): SemanticMetadata {

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
        `${gpu}を搭載した高性能PCを比較できます。ゲーム・動画編集・AI用途にも対応。`,

      icon:
        '🧠',

      semantic_role:
        'highlight',
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
          '用途別おすすめPC',

        description:
          '用途ごとに最適なPC構成を比較できます。',

        icon:
          '⚡',

        semantic_role:
          'primary',
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

      icon:
        '🏢',

      semantic_role:
        'secondary',
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

    icon:
      '🚀',

    semantic_role:
      'supportive',
  }
}