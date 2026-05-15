// /app/concierge/agents/specialists/GamingAgent.ts

/* =========================================
🔥 GAMING SPECIALIST AGENT
========================================= */

import type { RecommendationPayload } from '../../types/recommendation/product'
import type { SemanticAttribute } from '../../types/semantic/attribute'

/* =========================================
🔥 Gaming Agent Interface
========================================= */

export interface GamingAgent {
  /**
   * ゲーミング用途に最適化された推薦生成
   * @param candidates 推奨候補
   * @param context SemanticAttribute[]
   * @returns ゲーミング向けスコア・フィルタリング
   */
  recommendForGaming: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * ゲーミング用途属性からスコアを計算
   * @param attribute SemanticAttribute
   */
  scoreGamingAttribute: (attribute: SemanticAttribute) => number
}