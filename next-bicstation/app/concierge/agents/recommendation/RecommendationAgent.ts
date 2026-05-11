// /app/concierge/agents/recommendation/RecommendationAgent.ts

/* =========================================
🔥 RECOMMENDATION AGENT
========================================= */

import type { RecommendationPayload } from '../../types/recommendation/product'
import type { SemanticAttribute } from '../../types/semantic/attribute'

/* =========================================
🔥 Recommendation Agent Interface
========================================= */

export interface RecommendationAgent {
  /**
   * 与えられた候補からランキングを作成
   * @param candidates RecommendationPayload[]
   * @param context SemanticAttribute[]
   * @returns 推奨候補にスコアや理由を付与
   */
  recommend: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * 単一属性から推奨スコア計算
   * @param attribute SemanticAttribute
   * @returns 推奨スコア
   */
  scoreBySemantic: (
    attribute: SemanticAttribute
  ) => number
}