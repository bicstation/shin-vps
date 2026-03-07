/**
 * =====================================================================
 * 💻 Next.js API Route Handler (app/api/products/route.ts)
 * =====================================================================
 */

import { NextResponse, NextRequest } from 'next/server';
/**
 * ✅ 共通APIのインポート
 * 物理パス: shared/lib/api.ts
 */
import { fetchPCProducts } from '@shared/lib/api'; 

/**
 * 💡 Next.js 15 仕様: 動的レンダリングの設定
 * クエリパラメータに基づき動的に商品を返すため、静的キャッシュを無効化します。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ✅ クエリパラメータの取得（型安全性を考慮）
    const budget = searchParams.get('budget') || '300000';
    const ram    = searchParams.get('ram') || '0';
    const npu    = searchParams.get('npu') === 'true';
    const gpu    = searchParams.get('gpu') === 'true';
    const type   = searchParams.get('type') || '';
    const brand  = searchParams.get('brand') || '';
    const offset = Number(searchParams.get('offset')) || 0;
    const limit  = Number(searchParams.get('limit')) || 20;
    const keyword = searchParams.get('keyword') || ''; // 🔍 キーワード検索も受け取れるように

    /**
     * ✅ fetchPCProducts の呼び出し
     * Django側の引数順序と型に厳格に合わせます
     */
    const data = await fetchPCProducts(
      brand === 'all' ? '' : brand, 
      offset,
      limit,
      keyword, 
      budget,
      ram,
      npu,
      gpu,
      type === 'all' ? '' : type
    );

    // ✅ レスポンスの返却
    // null合体演算子でデータが存在しない場合のクラッシュを防ぐ
    return NextResponse.json({
      success: true,
      products: data?.results || [],
      totalCount: data?.count || 0,
      debugUrl: data?.debugUrl || null
    });

  } catch (error: any) {
    console.error("❌ Next.js API Route Error:", error.message);
    
    // エラー時のレスポンス構造を統一
    return NextResponse.json(
      { 
        success: false,
        error: "PCデータの取得に失敗しました。",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }, 
      { status: 500 }
    );
  }
}