// /app/concierge/pipelines/semantic/semanticPipeline.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  SemanticPayload,
} from '../../contracts/semantic/SemanticPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../../domain/semantic/semanticDomain'

/* =========================================
🔥 PIPELINE RESULT
========================================= */

export type SemanticPipelineResult = {

  semanticIntent?: SemanticIntent

  semanticPayload?: SemanticPayload

  metrics: {

    attributesCount?: number
    groupedAttributesCount?: number
    usage?: string
  }
}

/* =========================================
🔥 Execute Semantic Pipeline
========================================= */

export function
executeSemanticPipeline({
  semanticPayload,
}: {
  semanticPayload?: SemanticPayload
}): SemanticPipelineResult {

  const semanticIntent =

    SemanticDomain
      .resolveSemanticIntentFromPayload(
        semanticPayload
      )

  const metrics = {

    attributesCount:
      semanticPayload?.attributes?.length || 0,

    groupedAttributesCount:
      semanticPayload?.grouped_attributes
        ? Object.keys(
            semanticPayload.grouped_attributes
          ).length
        : 0,

    usage:
      semanticIntent?.usage || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Pipeline'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    attributesCount:
      metrics.attributesCount,

    groupedAttributesCount:
      metrics.groupedAttributesCount,

  })

  return {
    semanticIntent,
    semanticPayload,
    metrics,
  }
}