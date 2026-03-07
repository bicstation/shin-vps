// /app/api/sommelier/route.ts (または /app/api/chat/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { handleSommelierRequest } from '@/shared/lib/api/handlers/sommelier';

/**
 * =============================================================================
 * 🍷 ADULT_SOMMELIER_GATEWAY: API ROUTE
 * =============================================================================
 * フロントエンドのチャットUIとバックエンドAIロジックを仲介するノードです。
 * 複数サイトで同一の「ソムリエ人格」を共有するため、処理は shared/lib に集約しています。
 */

export const runtime = 'edge'; // 低レイテンシ応答のためにEdge Runtimeを推奨（AI応答に最適）

export async function POST(req: NextRequest) {
  // 1. 🔍 リクエストの基本バリデーション
  if (req.method !== 'POST') {
    return NextResponse.json(
      { text: "INVALID_METHOD: POST ONLY" },
      { status: 405 }
    );
  }

  try {
    // 2. 🚀 共通ハンドラーによるAI解析・応答生成
    // handleSommelierRequest 内で OpenAI/Anthropic 等のLLM呼び出しと
    // アーカイブデータベース（Django）へのコンテキスト照会が行われます。
    const response = await handleSommelierRequest(req);

    // 3. ✅ 正常レスポンスの返却
    return response;

  } catch (error: any) {
    // 4. 🚨 システムエラーハンドリング
    console.error('🛰️ Sommelier_Node_Error:', error);

    // ユーザーに不安を与えない、かつ世界観を壊さないエラーメッセージ
    const errorBody = {
      text: "申し訳ございません。マトリックスとの接続に一時的なノイズが発生しました。時間を置いて再度アクセスしてください。",
      status: "SIGNAL_LOST",
      debug_info: process.env.NODE_ENV === 'development' ? error.message : undefined
    };

    return NextResponse.json(errorBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-System-Status': 'CRITICAL_ERROR'
      }
    });
  }
}

/**
 * 💡 OPTIONS メソッドの追加 (CORS対応が必要な場合)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}