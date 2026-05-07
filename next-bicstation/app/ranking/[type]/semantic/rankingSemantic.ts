/* =========================================
🔥 Semantic Landing Copy
========================================= */

const semanticLandingCopy:
  Record<
    string,
    {
      title: string
      description: string
    }
  > = {

  gaming: {
    title:
      'ゲーム向けおすすめPC',

    description:
      '高FPS・高性能GPU構成を中心に、ゲーム用途に最適なPCを比較できます。',
  },

  work: {
    title:
      '仕事向けおすすめPC',

    description:
      'ビジネス・事務・作業効率を重視したおすすめ構成。',
  },

  creator: {
    title:
      '動画編集向けおすすめPC',

    description:
      '動画編集・配信・クリエイティブ作業向けの高性能構成。',
  },
}

/* =========================================
🔥 Semantic Resolver
========================================= */

export function buildSemanticTitle(
  type: string
) {

  // GPU
  if (
    type.startsWith('gpu-')
  ) {

    const gpu =
      type
        .replace('gpu-', '')
        .replaceAll('-', ' ')
        .toUpperCase()

    return {
      title:
        `${gpu}搭載おすすめPC`,

      description:
        `${gpu}を搭載した高性能PCを比較できます。ゲーム・動画編集・AI用途にも対応。`,
    }
  }

  // Usage
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
      ] || {
        title:
          'おすすめPCランキング',

        description:
          '用途別に最適なPCを比較できます。',
      }
    )
  }

  // Maker
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
    }
  }

  // Default
  return {
    title:
      'おすすめPCランキング',

    description:
      'semantic recommendation に基づくおすすめPC一覧。',
  }
}