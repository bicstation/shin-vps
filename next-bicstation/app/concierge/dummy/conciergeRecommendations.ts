// /app/concierge/dummy/conciergeRecommendations.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Dummy Concierge Recommendations
========================================= */

export const conciergeRecommendations:
  RecommendationPayload[] = [

  // ======================================
  // Recommendation 01
  // ======================================

  {

    unique_id:
      'rtx-ai-gaming-001',

    name:
      'RTX AI Gaming Creator X',

    shortTitle:
      'RTX AI Gaming X',

    image_url:
      '/no-image.png',

    maker:
      'SHIN CORE',

    price:
      298000,

    score:
      96,

    reasoning:
      'AI画像生成と高fpsゲームプレイを両立できるRTX搭載ハイエンド構成です。',

    grouped_attributes: {

      usage: [

        {
          name:
            'AI',
        },

        {
          name:
            'Gaming',
        },

      ],

      gpu: [

        {
          name:
            'RTX',
        },

      ],

      memory: [

        {
          name:
            '32GB',
        },

      ],

    },

  },

  // ======================================
  // Recommendation 02
  // ======================================

  {

    unique_id:
      'creator-workstation-002',

    name:
      'Creator Workstation Pro',

    shortTitle:
      'Creator Pro',

    image_url:
      '/no-image.png',

    maker:
      'SHIN CORE',

    price:
      268000,

    score:
      91,

    reasoning:
      '動画編集・AIワークロード向けに最適化された高性能ワークステーションです。',

    grouped_attributes: {

      usage: [

        {
          name:
            'Creator',
        },

        {
          name:
            'AI',
        },

      ],

      gpu: [

        {
          name:
            'RTX Studio',
        },

      ],

      memory: [

        {
          name:
            '64GB',
        },

      ],

    },

  },

  // ======================================
  // Recommendation 03
  // ======================================

  {

    unique_id:
      'gaming-balanced-003',

    name:
      'Gaming Balanced RTX Model',

    shortTitle:
      'Gaming RTX',

    image_url:
      '/no-image.png',

    maker:
      'SHIN CORE',

    price:
      229800,

    score:
      87,

    reasoning:
      '価格とGPU性能のバランスを重視したGaming向け構成です。',

    grouped_attributes: {

      usage: [

        {
          name:
            'Gaming',
        },

      ],

      gpu: [

        {
          name:
            'RTX',
        },

      ],

      memory: [

        {
          name:
            '32GB',
        },

      ],

    },

  },

]

export default conciergeRecommendations