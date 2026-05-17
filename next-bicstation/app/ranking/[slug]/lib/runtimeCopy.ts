// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/lib/runtimeCopy.ts
// ============================================================================

/* ============================================================================
🔥 Runtime Copy Type
============================================================================ */

export type RuntimeCopy = {

  discoveryTitle: string

  discoveryDescription: string

  explorationTitle: string

  explorationDescription: string

  flagshipLabel: string

}

/* ============================================================================
🔥 Runtime Copy Map
============================================================================ */

const RUNTIME_COPY_MAP: Record<
  string,
  RuntimeCopy
> = {

  /* ==========================================================================
  🔥 Gaming
  ========================================================================== */

  gaming: {

    discoveryTitle:
      '高FPS・高性能ゲーミングモデル',

    discoveryDescription:
      'RTX・高リフレッシュレート・低遅延構成を中心に、ゲーム体験を最大化するモデルを探索。',

    explorationTitle:
      'さらにゲーミングモデルを探索',

    explorationDescription:
      '価格・GPU性能・冷却構成など、さまざまな視点から比較可能。',

    flagshipLabel:
      'FLAGSHIP GAMING MODEL',

  },

  /* ==========================================================================
  🔥 AI
  ========================================================================== */

  ai: {

    discoveryTitle:
      '生成AI・LLM向けモデル',

    discoveryDescription:
      '生成AI・画像生成・ローカルLLM処理向けに最適化された高性能構成を探索。',

    explorationTitle:
      'さらにAIモデルを探索',

    explorationDescription:
      'VRAM容量・AI処理性能・推論速度などを比較可能。',

    flagshipLabel:
      'FLAGSHIP AI RUNTIME',

  },

  /* ==========================================================================
  🔥 Creator
  ========================================================================== */

  creator: {

    discoveryTitle:
      '動画編集・クリエイター向けモデル',

    discoveryDescription:
      '映像編集・3DCG・配信制作など、制作効率を高める構成を探索。',

    explorationTitle:
      'さらにクリエイターモデルを探索',

    explorationDescription:
      'GPU・メモリ・静音性など制作環境に重要な要素を比較可能。',

    flagshipLabel:
      'FLAGSHIP CREATOR MODEL',

  },

  /* ==========================================================================
  🔥 Business
  ========================================================================== */

  business: {

    discoveryTitle:
      'ビジネス・業務効率向けモデル',

    discoveryDescription:
      '安定性・静音性・省電力性を重視した業務向けPCを探索。',

    explorationTitle:
      'さらにビジネスモデルを探索',

    explorationDescription:
      '持ち運び・長時間稼働・生産性などを比較可能。',

    flagshipLabel:
      'FLAGSHIP BUSINESS MODEL',

  },

  /* ==========================================================================
  🔥 Default
  ========================================================================== */

  default: {

    discoveryTitle:
      '注目のランキングモデル',

    discoveryDescription:
      'semantic ontology runtime に基づく注目モデルを探索。',

    explorationTitle:
      'さらにモデルを探索',

    explorationDescription:
      '性能・用途・価格帯などを比較しながら探索可能。',

    flagshipLabel:
      'FLAGSHIP DISCOVERY NODE',

  },

}

/* ============================================================================
🔥 Detect Runtime Category
============================================================================ */

function detectRuntimeCategory(
  runtime: any
): keyof typeof RUNTIME_COPY_MAP {

  const seoTitle =
    runtime?.seo?.title
      ?.toLowerCase?.()
    || ''

  const seoDescription =
    runtime?.seo?.description
      ?.toLowerCase?.()
    || ''

  const combined =
    `${seoTitle} ${seoDescription}`

  /* ==========================================================================
  🔥 Detection
  ========================================================================== */

  if (
    combined.includes('gaming')
    ||
    combined.includes('ゲーミング')
  ) {

    return 'gaming'
  }

  if (
    combined.includes('ai')
    ||
    combined.includes('生成ai')
  ) {

    return 'ai'
  }

  if (
    combined.includes('creator')
    ||
    combined.includes('クリエイター')
  ) {

    return 'creator'
  }

  if (
    combined.includes('business')
    ||
    combined.includes('ビジネス')
  ) {

    return 'business'
  }

  return 'default'
}

/* ============================================================================
🔥 Get Runtime Copy
============================================================================ */

export function getRuntimeCopy(
  runtime: any
): RuntimeCopy {

  const category =
    detectRuntimeCategory(
      runtime
    )

  return (
    RUNTIME_COPY_MAP[
      category
    ]
    ||
    RUNTIME_COPY_MAP.default
  )
}