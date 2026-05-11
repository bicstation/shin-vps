// /app/concierge/domain/semantic/semanticDomain.ts
// /app/concierge/domain/semantic/semanticDomain.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 Semantic Domain
========================================= */

export const SemanticDomain = {

  /* =====================================
  Normalize Text
  ===================================== */

  normalizeText(
    text?: string
  ) {

    return (
      text
        ?.toLowerCase()
        ?.trim()
      || ''
    )
  },

  /* =====================================
  Resolve Latest User Message
  ===================================== */

  getLatestUserMessage(
    messages:
      ConversationMessage[] = []
  ) {

    const userMessages =

      messages.filter(
        item => (
          item?.role
          === 'user'
        )
      )

    return userMessages[
      userMessages.length - 1
    ]
  },

  /* =====================================
  Extract Usage Intent
  ===================================== */

  extractUsageIntent(
    text?: string
  ) {

    const normalized =

      this.normalizeText(
        text
      )

    // ===================================
    // Gaming
    // ===================================

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

    // ===================================
    // Creator
    // ===================================

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

    // ===================================
    // AI
    // ===================================

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

    // ===================================
    // Business
    // ===================================

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
  },

  /* =====================================
  Extract Budget Intent
  ===================================== */

  extractBudgetIntent(
    text?: string
  ) {

    const normalized =

      this.normalizeText(
        text
      )

    // ===================================
    // Regex Budget
    // ===================================

    const match =

      normalized.match(
        /([0-9]{1,3})\s?万/
      )

    if (
      match?.[1]
    ) {

      return (
        Number(match[1])
        * 10000
      )
    }

    return undefined
  },

  /* =====================================
  Extract GPU Intent
  ===================================== */

  extractGPUIntent(
    text?: string
  ) {

    const normalized =

      this.normalizeText(
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
  },

  /* =====================================
  Extract AI Intent
  ===================================== */

  extractAIIntent(
    text?: string
  ) {

    const normalized =

      this.normalizeText(
        text
      )

    return (

      normalized.includes('ai')
      ||
      normalized.includes('llm')
      ||
      normalized.includes('生成')

    )
  },

  /* =====================================
  Resolve Semantic Intent
  ===================================== */

  resolveSemanticIntent(
    messages:
      ConversationMessage[] = []
  ): SemanticIntent {

    const latestMessage =

      this.getLatestUserMessage(
        messages
      )

    const content =

      latestMessage?.content
      || ''

    return {

      usage:

        this.extractUsageIntent(
          content
        ),

      budget:

        this.extractBudgetIntent(
          content
        ),

      gpu:

        this.extractGPUIntent(
          content
        ),

      ai:

        this.extractAIIntent(
          content
        ),
    }
  },

  /* =====================================
  Merge Semantic Intent
  ===================================== */

  mergeSemanticIntent({
    previousIntent,
    nextIntent,
  }: {
    previousIntent?:
      SemanticIntent

    nextIntent?:
      SemanticIntent
  }): SemanticIntent {

    return {

      ...previousIntent,

      ...nextIntent,

    }
  },

  /* =====================================
  Build Semantic Summary
  ===================================== */

  buildSemanticSummary(
    semanticIntent?:
      SemanticIntent
  ) {

    if (
      !semanticIntent
    ) {

      return (
        'semantic runtime standby'
      )
    }

    const parts = []

    if (
      semanticIntent?.usage
    ) {

      parts.push(
        `usage: ${semanticIntent.usage}`
      )
    }

    if (
      semanticIntent?.budget
    ) {

      parts.push(
        `budget: ¥${semanticIntent.budget.toLocaleString()}`
      )
    }

    if (
      semanticIntent?.gpu
    ) {

      parts.push(
        `gpu: ${semanticIntent.gpu}`
      )
    }

    if (
      semanticIntent?.ai
    ) {

      parts.push(
        'AI workload'
      )
    }

    return parts.join(' / ')
  },
}

export default SemanticDomain