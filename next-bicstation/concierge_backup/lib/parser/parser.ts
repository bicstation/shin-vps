// /app/concierge/lib/parser/parser.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Normalize Text
========================================= */

export function
normalizeText(
  text?: string
): string {

  return (
    text
      ?.toLowerCase()
      ?.trim()
    || ''
  )
}

/* =========================================
🔥 Parse Usage Intent
========================================= */

export function
parseUsageIntent(
  text?: string
): SemanticIntent['usage'] {

  const normalized =

    normalizeText(
      text
    )

  // ======================================
  // Gaming
  // ======================================

  if (

    normalized.includes('gaming')
    ||
    normalized.includes('game')
    ||
    normalized.includes('ゲーム')
    ||
    normalized.includes('apex')
    ||
    normalized.includes('valorant')

  ) {

    return 'gaming'
  }

  // ======================================
  // Creator
  // ======================================

  if (

    normalized.includes('creator')
    ||
    normalized.includes('動画')
    ||
    normalized.includes('編集')
    ||
    normalized.includes('premiere')

  ) {

    return 'creator'
  }

  // ======================================
  // AI
  // ======================================

  if (

    normalized.includes('ai')
    ||
    normalized.includes('llm')
    ||
    normalized.includes('生成')
    ||
    normalized.includes('stable diffusion')

  ) {

    return 'ai'
  }

  // ======================================
  // Business
  // ======================================

  if (

    normalized.includes('business')
    ||
    normalized.includes('仕事')
    ||
    normalized.includes('office')
    ||
    normalized.includes('excel')

  ) {

    return 'business'
  }

  return 'general'
}

/* =========================================
🔥 Parse Budget
========================================= */

export function
parseBudget(
  text?: string
): number | undefined {

  const normalized =

    normalizeText(
      text
    )

  // ======================================
  // 30万
  // ======================================

  const manMatch =

    normalized.match(
      /([0-9]{1,3})\s?万/
    )

  if (
    manMatch?.[1]
  ) {

    return (
      Number(manMatch[1])
      * 10000
    )
  }

  // ======================================
  // Raw Number
  // ======================================

  const numberMatch =

    normalized.match(
      /([0-9]{5,7})/
    )

  if (
    numberMatch?.[1]
  ) {

    return Number(
      numberMatch[1]
    )
  }

  return undefined
}

/* =========================================
🔥 Parse GPU
========================================= */

export function
parseGPU(
  text?: string
): string | undefined {

  const normalized =

    normalizeText(
      text
    )

  if (
    normalized.includes('rtx')
  ) {

    return 'rtx'
  }

  if (
    normalized.includes('geforce')
  ) {

    return 'geforce'
  }

  if (
    normalized.includes('radeon')
  ) {

    return 'radeon'
  }

  return undefined
}

/* =========================================
🔥 Parse AI Intent
========================================= */

export function
parseAIIntent(
  text?: string
): boolean {

  const normalized =

    normalizeText(
      text
    )

  return (

    normalized.includes('ai')
    ||
    normalized.includes('生成')
    ||
    normalized.includes('llm')

  )
}

/* =========================================
🔥 Parse Semantic Intent
========================================= */

export function
parseSemanticIntent(
  text?: string
): SemanticIntent {

  return {

    usage:
      parseUsageIntent(
        text
      ),

    budget:
      parseBudget(
        text
      ),

    gpu:
      parseGPU(
        text
      ),

    ai:
      parseAIIntent(
        text
      ),
  }
}

/* =========================================
🔥 Parse Query Tokens
========================================= */

export function
parseQueryTokens(
  text?: string
): string[] {

  const normalized =

    normalizeText(
      text
    )

  if (
    !normalized
  ) {

    return []
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
}

/* =========================================
🔥 Parse Intent Summary
========================================= */

export function
parseIntentSummary(
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

  if (
    semanticIntent?.usage
  ) {

    parts.push(
      `usage=${semanticIntent.usage}`
    )
  }

  if (
    semanticIntent?.budget
  ) {

    parts.push(
      `budget=${semanticIntent.budget}`
    )
  }

  if (
    semanticIntent?.gpu
  ) {

    parts.push(
      `gpu=${semanticIntent.gpu}`
    )
  }

  if (
    semanticIntent?.ai
  ) {

    parts.push(
      'ai=true'
    )
  }

  return parts.join(' ')
}