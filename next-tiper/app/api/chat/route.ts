import { handleSommelierRequest } from '@/shared/lib/sommelier-handler';
import { NextRequest } from 'next/server';

/**
 * 🍷 アダルトソムリエ API ルート
 * 各サイトの app/api/chat/route.ts に配置します。
 * ロジックを shared/lib に集約することで、複数サイトでの人格・機能の一貫性を保ちます。
 */
export async function POST(req: NextRequest) {
  try {
    // フロントエンドから送られてくる JSON (message, history) を
    // そのまま共通ハンドラーへ渡して処理します。
    return await handleSommelierRequest(req);
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(
      JSON.stringify({ text: "システムの接続に一時的な不備があるようです。申し訳ございません。" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}