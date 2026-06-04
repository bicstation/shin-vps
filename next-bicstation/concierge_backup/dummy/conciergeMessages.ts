// Dummy Concierge Messages
// /app/concierge/dummy/conciergeMessages.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../contracts/conversation/ConversationMessage'

/* =========================================
🔥 Dummy Concierge Messages
========================================= */

export const conciergeMessages:
  ConversationMessage[] = [

  // ======================================
  // Assistant
  // ======================================

  {

    id:
      'assistant-001',

    role:
      'assistant',

    content:
      'こんにちは。SHIN CORE LINX AI Conciergeです。用途や予算に合わせて最適なPC構成をご提案します。',

    created_at:
      new Date(
        Date.now()
        - 1000 * 60 * 5
      ).toISOString(),

  },

  // ======================================
  // User
  // ======================================

  {

    id:
      'user-001',

    role:
      'user',

    content:
      'AI画像生成とゲームを両立できるPCを探しています。',

    created_at:
      new Date(
        Date.now()
        - 1000 * 60 * 4
      ).toISOString(),

  },

  // ======================================
  // Assistant
  // ======================================

  {

    id:
      'assistant-002',

    role:
      'assistant',

    content:
      '承知しました。GPU性能を重視したAI・Gaming向け構成を優先して提案します。予算感はどのくらいを想定していますか？',

    created_at:
      new Date(
        Date.now()
        - 1000 * 60 * 3
      ).toISOString(),

  },

  // ======================================
  // User
  // ======================================

  {

    id:
      'user-002',

    role:
      'user',

    content:
      '30万円くらいで考えています。RTX系がいいです。',

    created_at:
      new Date(
        Date.now()
        - 1000 * 60 * 2
      ).toISOString(),

  },

  // ======================================
  // Assistant
  // ======================================

  {

    id:
      'assistant-003',

    role:
      'assistant',

    content:
      '了解しました。RTX GPU搭載で、AI生成・ゲームの両方に適した高性能構成を選定しています。',

    created_at:
      new Date(
        Date.now()
        - 1000 * 60
      ).toISOString(),

  },

]

export default conciergeMessages