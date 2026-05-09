// Semantic Hero Copy
// /shared/lib/semantic/semanticHeroCopy.ts

/* =========================================
🔥 Types
========================================= */

export type SemanticHeroCopy = {

  catch: string

  sub: string
}

/* =========================================
🔥 Semantic Hero Copy Registry
========================================= */

export const semanticHeroCopy:
  Record<
    string,
    SemanticHeroCopy
  > = {

  // ======================================
  // Usage
  // ======================================

  'usage-gaming': {

    catch:
      '高FPS gaming環境ならこれ',

    sub:
      '高性能GPUを中心に快適gaming構成を比較',
  },

  'usage-creator': {

    catch:
      '制作もAI処理も快適',

    sub:
      '動画編集・配信・生成AI workload に対応',
  },

  'usage-business': {

    catch:
      '仕事用なら安定構成重視',

    sub:
      '業務・開発・普段使いまで快適に対応',
  },

  'usage-ai': {

    catch:
      'AI workload向けおすすめ構成',

    sub:
      '生成AI・ローカルLLM・推論処理に対応',
  },

  // ======================================
  // Device
  // ======================================

  'device-laptop': {

    catch:
      '持ち運び重視ならノートPC',

    sub:
      'モバイル性と性能バランスを重視した構成',
  },

  'device-desktop': {

    catch:
      '拡張性重視ならデスクトップ',

    sub:
      '性能・冷却・カスタマイズ性を重視',
  },

  'device-workstation': {

    catch:
      '重量級 workload向け構成',

    sub:
      'creator・AI・解析用途向け高性能モデル',
  },

  'device-server': {

    catch:
      '業務・サーバー用途向け',

    sub:
      '安定稼働・長時間運用を重視した構成',
  },

  // ======================================
  // Default
  // ======================================

  default: {

    catch:
      '性能・価格バランス重視',

    sub:
      '用途別おすすめ構成を比較できます',
  },
}

