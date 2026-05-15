// /app/concierge/agents/specialists/BusinessAgent.ts

/* =========================================
🔥 BUSINESS SPECIALIST AGENT
========================================= */

import type { RecommendationPayload } from '../../types/recommendation/product'
import type { SemanticAttribute } from '../../types/semantic/attribute'

/* =========================================
🔥 Business Agent Interface
========================================= */

export interface BusinessAgent {
  /**
   * 法人・業務用途向けに最適化された推薦生成
   * @param candidates 推奨候補
   * @param context SemanticAttribute[]
   * @returns ビジネス向けにフィルタ・スコア付与
   */
  recommendForBusiness: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * ビジネス用途属性からスコアを計算
   * @param attribute SemanticAttribute
   */
  scoreBusinessAttribute: (attribute: SemanticAttribute) => number
}