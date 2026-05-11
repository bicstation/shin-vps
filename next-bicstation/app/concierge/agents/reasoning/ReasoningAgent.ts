// /app/concierge/agents/reasoning/ReasoningAgent.ts

/* =========================================
🔥 REASONING AGENT
========================================= */

import type { SemanticAttribute } from '@/app/concierge/types/semantic/attribute'
import type { RecommendationPayload } from '@/app/concierge/types/recommendation/product'

/* =========================================
🔥 Reasoning Agent Interface
========================================= */

export interface ReasoningAgent {
  /**
   * 推論実行
   * @param context ユーザーの意図や条件
   * @param candidates 推薦候補
   * @returns 推薦候補にスコアや理由を付与
   */
  reason: (
    context: Record<string, any>,
    candidates: RecommendationPayload[]
  ) => Promise<RecommendationPayload[]>

  /**
   * Semantic 属性からの推論
   * @param semanticAttributes SemanticAttribute[]
   * @returns 推奨候補または評価
   */
  reasonSemantic: (
    semanticAttributes: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>
}