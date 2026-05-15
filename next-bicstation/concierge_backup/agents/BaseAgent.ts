// /app/concierge/agents/BaseAgent.ts

/* =========================================
🔥 BASE AGENT
========================================= */

import type { RecommendationPayload } from '@/app/concierge/types/recommendation/product'
import type { SemanticAttribute } from '@/app/concierge/types/semantic/attribute'

/* =========================================
🔥 Base Agent Interface
========================================= */

export interface BaseAgent {
  /**
   * 推論または推薦の共通処理を実装
   * @param candidates RecommendationPayload[]
   * @param context SemanticAttribute[]
   */
  processCandidates: (
    candidates: RecommendationPayload[],
    context: SemanticAttribute[]
  ) => Promise<RecommendationPayload[]>

  /**
   * ログ出力
   */
  log: (message: string, ...args: any[]) => void
}