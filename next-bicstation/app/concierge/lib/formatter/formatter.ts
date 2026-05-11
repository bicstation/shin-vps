// /app/concierge/lib/formatter/formatter.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Format Price
========================================= */

export function
formatPrice(
  value?: number
): string {

  if (
    !value
  ) {

    return '¥0'
  }

  return `¥${value.toLocaleString()}`
}

/* =========================================
🔥 Format Score
========================================= */

export function
formatScore(
  value?: number
): string {

  if (
    value == null
  ) {

    return '0'
  }

  return `${Math.round(value)}`
}

/* =========================================
🔥 Format Percentage
========================================= */

export function
formatPercentage(
  value?: number
): string {

  if (
    value == null
  ) {

    return '0%'
  }

  return `${Math.round(value)}%`
}

/* =========================================
🔥 Format Semantic Usage
========================================= */

export function
formatUsage(
  usage?: string
): string {

  switch (usage) {

    case 'gaming':
      return '🎮 Gaming'

    case 'creator':
      return '🎬 Creator'

    case 'business':
      return '💼 Business'

    case 'ai':
      return '⚡ AI'

    default:
      return '🧠 General'
  }
}

/* =========================================
🔥 Format Recommendation Reasoning
========================================= */

export function
formatReasoning({
  recommendation,
  semanticIntent,
}: {
  recommendation?:
    RecommendationPayload

  semanticIntent?:
    SemanticIntent
}) {

  if (
    recommendation?.reasoning
  ) {

    return recommendation.reasoning
  }

  switch (
    semanticIntent?.usage
  ) {

    case 'gaming':

      return (
        'ゲーム向けGPU性能を重視した構成です。'
      )

    case 'creator':

      return (
        '動画編集・制作向け性能を重視しています。'
      )

    case 'business':

      return (
        '業務用途向け安定性を重視しています。'
      )

    case 'ai':

      return (
        'AI生成・GPU推論向け性能を重視しています。'
      )

    default:

      return (
        'semantic recommendation runtime'
      )
  }
}

/* =========================================
🔥 Format Semantic Summary
========================================= */

export function
formatSemanticSummary(
  semanticIntent?:
    SemanticIntent
): string {

  if (
    !semanticIntent
  ) {

    return (
      'semantic standby'
    )
  }

  const parts: string[] = []

  // ======================================
  // Usage
  // ======================================

  if (
    semanticIntent?.usage
  ) {

    parts.push(
      formatUsage(
        semanticIntent.usage
      )
    )
  }

  // ======================================
  // Budget
  // ======================================

  if (
    semanticIntent?.budget
  ) {

    parts.push(

      `Budget ${formatPrice(
        semanticIntent.budget
      )}`

    )
  }

  // ======================================
  // GPU
  // ======================================

  if (
    semanticIntent?.gpu
  ) {

    parts.push(
      `GPU ${semanticIntent.gpu}`
    )
  }

  // ======================================
  // AI
  // ======================================

  if (
    semanticIntent?.ai
  ) {

    parts.push(
      'AI Ready'
    )
  }

  return parts.join(' / ')
}

/* =========================================
🔥 Format Date
========================================= */

export function
formatDate(
  value?: string
): string {

  if (
    !value
  ) {

    return ''
  }

  try {

    return new Date(value)
      .toLocaleString(
        'ja-JP'
      )

  } catch {

    return ''
  }
}