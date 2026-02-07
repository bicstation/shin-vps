// /app/api/chat/route.ts (各サイト共通でこれだけ書く)
import { handleChatRequest } from '@/shared/lib/chat-handler';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // 共通ロジックを呼び出すだけ
  return handleChatRequest(req);
}