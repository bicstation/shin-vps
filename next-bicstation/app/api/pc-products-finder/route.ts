/**
 * =====================================================================
 * 💻 Next.js API Route Handler (app/api/products/route.ts)
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import { fetchPCProducts } from '@shared/lib/api'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ✅ 引用符をしっかり閉じるように修正しました
    const budget = searchParams.get('budget') || '300000';
    const ram = searchParams.get('ram') || '0';
    const npu = searchParams.get('npu') === 'true';
    const gpu = searchParams.get('gpu') === 'true';
    const type = searchParams.get('type') || '';    // ← ここ！
    const brand = searchParams.get('brand') || '';  // ← ここ！
    const offset = Number(searchParams.get('offset')) || 0;
    const limit = Number(searchParams.get('limit')) || 20;

    const data = await fetchPCProducts(
      brand === 'all' ? '' : brand, 
      offset,
      limit,
      '', 
      budget,
      ram,
      npu,
      gpu,
      type === 'all' ? '' : type
    );

    return NextResponse.json({
      success: true,
      products: data.results,
      totalCount: data.count,
      debugUrl: data.debugUrl
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