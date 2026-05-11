// /app/concierge/agents/specialists/CreatorAgent.ts

/* =========================================
🔥 CREATOR SPECIALIST AGENT
========================================= */

import type { RecommendationPayload } from '../../types/recommendation/product'
import type { SemanticAttribute } from '../../types/semantic/attribute'

/* =========================================
🔥 Creator Agent Interface
========================================= */

export interface CreatorAgent {
  /**
   * クリエイター用途に最適化した推薦生成
   * @param candidates 推奨候補
   * @param context SemanticAttribute[]
   * @returns クリエイター向けスコア・フィルタリング
   */
  recommendForCreator: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * クリエイター用途属性からスコアを計算
   * @param attribute SemanticAttribute
   */
  scoreCreatorAttribute: (attribute: SemanticAttribute) => number
}