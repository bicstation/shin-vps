// /app/concierge/agents/runtime/RuntimeAgent.ts

/* =========================================
🔥 RUNTIME AGENT
========================================= */

import type { RecommendationPayload } from '@/app/concierge/types/recommendation/product'
import type { SemanticAttribute } from '@/app/concierge/types/semantic/attribute'

/* =========================================
🔥 Runtime Agent Interface
========================================= */

export interface RuntimeAgent {
  /**
   * フロー実行
   * @param input フロー入力
   * @returns フロー出力
   */
  executeFlow: (input: Record<string, any>) => Promise<Record<string, any>>

  /**
   * 推奨候補を処理して最終出力
   * @param candidates RecommendationPayload[]
   * @param context SemanticAttribute[]
   */
  processRecommendations: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * 状態の取得
   * @returns 現在のランタイム状態
   */
  getState: () => Record<string, any>
}