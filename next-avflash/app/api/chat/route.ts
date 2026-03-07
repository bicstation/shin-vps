// /app/api/chat/route.ts
import { NextRequest } from 'next/server';

/**
 * ✅ インポートパスの修正
 * 地図（tsconfig）の @shared/api/* -> shared/lib/api/* を活用します。
 * 物理パス: shared/lib/api/handlers/sommelier.ts
 */
import { handleChatRequest } from '@shared/lib/api/handlers/sommelier';

export async function POST(req: NextRequest) {
  // 共通のソムリエ・チャットロジックを呼び出し
  // 内部でリクエストヘッダーやホスト名からサイト判定を行い、
  // 最適なプロンプトと在庫リスト（アダルト製品）を適用します。
  return handleChatRequest(req);
}