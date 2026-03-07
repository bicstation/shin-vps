/**
 * =====================================================================
 * 💻 Next.js API Route Handler (app/api/products/route.ts)
 * AVFLASH アダルト製品取得用
 * =====================================================================
 */

import { NextResponse } from 'next/server';
// ✅ アダルト用の取得関数にインポートを修正
import { fetchAdultProducts } from '@shared/lib/api/django/adult'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ✅ アダルトサイトのクエリパラメータに合わせて調整
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 24;
    const category = searchParams.get('category') || '';   // 例: 'video', 'anime'
    const actress = searchParams.get('actress') || '';     // 女優ID
    const maker = searchParams.get('maker') || '';         // メーカー
    const sort = searchParams.get('sort') || '-release_date'; // 並び替え
    const keyword = searchParams.get('keyword') || '';     // 検索キーワード

    // 💡 fetchAdultProducts の引数順序はプロジェクトの定義に合わせてください
    // 一般的に page 指定がある場合は offset ではなく page を渡すことが多いです
    const data = await fetchAdultProducts({
      page,
      limit,
      category,
      actress,
      maker,
      sort,
      keyword
    });

    return NextResponse.json({
      success: true,
      products: data.results,
      totalCount: data.count,
      next: data.next,
      previous: data.previous
    });

  } catch (error: any) {
    console.error("[AVFLASH] API Route Error:", error);
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