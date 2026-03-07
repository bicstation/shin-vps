/**
 * =====================================================================
 * 🔞 Next.js API Route Handler: ADULT-FINDER GATEWAY
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import { getUnifiedProducts } from '@/shared/lib/api/django/adult';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 🏹 パラメータの抽出と正規化
    const query      = searchParams.get('q') || '';
    const budget     = searchParams.get('price_max') || '10000';
    const source     = searchParams.get('api_source') || '';      // FANZA / DUGA / all
    const category   = searchParams.get('category') || '';        // video / set / anime / vr
    const hasVideo   = searchParams.get('has_video') === 'true';  // 動画あり限定
    const minScore   = Number(searchParams.get('min_score')) || 0; // AI解析スコア最低点
    const sort       = searchParams.get('sort') || 'newest';      // newest / price_asc / spec_score
    const offset     = Number(searchParams.get('offset')) || 0;
    const limit      = Number(searchParams.get('limit')) || 24;

    // 📡 Djangoバックエンド（マトリックス・データベース）へ問い合わせ
    const data = await getUnifiedProducts({
      q: query,
      price_max: budget,
      api_source: source === 'all' ? '' : source,
      category: category === 'all' ? '' : category,
      has_video: hasVideo,
      min_score: minScore,
      sort: sort,
      limit: limit,
      offset: offset,
    });

    // ✅ 正常レスポンス
    return NextResponse.json({
      success: true,
      products: data.results || [],
      totalCount: data.count || 0,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < (data.count || 0)
      },
      // 開発・デバッグ用：実際に叩いたDjangoエンドポイントを確認可能にする
      debugUrl: data.debugUrl || null
    });

  } catch (error: any) {
    console.error("❌ Adult API Route Failure:", error);

    // 🚨 エラーレスポンス
    return NextResponse.json(
      { 
        success: false,
        error: "NODE_CONNECTION_FAILED",
        message: "マトリックス・データベースとの同期に失敗しました。",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}