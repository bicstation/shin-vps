// /app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
/**
 * ✅ 共通ロジックのインポート
 * 物理パス: shared/lib/api/django/chat.ts (もしくは chat-handler.ts)
 */
import { handleChatRequest } from '@shared/lib/api/handlers/chat-handler';

/**
 * 💡 Next.js 15 用の動的設定
 * AIチャットは常に最新の文脈を反映するため、キャッシュを無効化します。
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. 共通ロジックにリクエストをパス
    // handleChatRequest 内でホスト判定やDjangoへのプロキシが行われます
    return await handleChatRequest(req);
    
  } catch (error: any) {
    console.error("[API_CHAT_ERROR]:", error);
    
    // 2. 万が一の際のエラーハンドリング
    return NextResponse.json(
      { error: "AIチャットサーバーへの接続に失敗しました。" },
      { status: 500 }
    );
  }
}