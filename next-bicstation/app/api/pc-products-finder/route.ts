/**
 * =====================================================================
 * 💻 Next.js API Route Handler (app/api/products/route.ts)
 * Djangoバックエンドから製品データを取得し、フロントへ中継します
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import { fetchPCProducts } from '@/lib/api'; // 先ほど作成した統合API層をインポート

export async function GET(request: Request) {
  try {
    // 1. URLからクエリパラメータを取得（Next.jsフロントのPCファインダーからのリクエスト）
    const { searchParams } = new URL(request.url);

    // フロントエンドのUIコンポーネントの命名規則に合わせつつ取得
    const budget = searchParams.get('budget') || '300000';
    const ram = searchParams.get('ram') || '0';
    const npu = searchParams.get('npu') === 'true';
    const gpu = searchParams.get('gpu') === 'true';
    const type = searchParams.get('type') || '';       // unified_genreに対応
    const brand = searchParams.get('brand') || '';     // Django側のmakerに対応
    const offset = Number(searchParams.get('offset')) || 0;
    const limit = Number(searchParams.get('limit')) || 20;

    // 🏆 ポイント:
    // ソート(sort)条件はDjango側のPCProductListAPIView内の 
    // OrderingFilter（orderingパラメータ）に渡す設計が理想的ですが、
    // 今回はfetchPCProductsの拡張引数として、Djangoへフィルタ条件をパスします。

    // 2. Django API サービス層 (lib/api.ts) を呼び出し
    // 引数順: (maker, offset, limit, attribute, budget, ram, npu, gpu, type)
    const data = await fetchPCProducts(
      brand === 'all' ? '' : brand, 
      offset,
      limit,
      '', // attribute (現在は未使用)
      budget,
      ram,
      npu,
      gpu,
      type === 'all' ? '' : type
    );

    // 3. Djangoから返ってきた結果（results, count等）をフロントに返却
    // これにより、フロント側はDjangoの存在を意識せずにデータを取得できます。
    return NextResponse.json({
      success: true,
      products: data.results, // Django DRFの標準出力
      totalCount: data.count,
      debugUrl: data.debugUrl // 開発時の疎通確認用
    });

  } catch (error: any) {
    console.error("Next.js API Route Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal Server Error",
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}