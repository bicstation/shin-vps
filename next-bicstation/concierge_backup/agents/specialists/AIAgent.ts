// /app/concierge/agents/specialists/AIAgent.ts

/* =========================================
🔥 AI SPECIALIST AGENT
========================================= */

import type { RecommendationPayload } from '../../types/recommendation/product'
import type { SemanticAttribute } from '../../types/semantic/attribute'

/* =========================================
🔥 AI Agent Interface
========================================= */

export interface AIAgent {
  /**
   * 自然言語またはチャット指示から推薦候補を生成
   * @param query ユーザークエリ
   * @param context SemanticAttribute[]
   * @returns 推奨候補
   */
  generateRecommendations: (
    query: string,
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * Semantic 属性から追加推論を行う
   * @param attributes SemanticAttribute[]
   */
  augmentSemantic: (
    attributes: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * ログ情報を出力
   */
  log: (...args: any[]) => void
}