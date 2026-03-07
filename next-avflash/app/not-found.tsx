"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ✅ ビルド時の静的レンダリングエラーを回避し、常に実行時に評価
export const dynamic = "force-dynamic";

/**
 * 💡 404コンテンツ本体
 */
function NotFoundContent() {
  // 💡 Next.js 15 / App Router のビルドエラー回避用
  // useSearchParamsをSuspense内で呼ぶことで、ビルド時の「Entire page deoptimized to client-side rendering」を防ぎます。
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* 🛸 視覚的インパクト（AVFLASHのテーマに合わせた色使い） */}
      <h1 className="text-8xl font-black text-orange-500 mb-2 opacity-80">404</h1>
      <div className="h-1 w-20 bg-orange-500 mb-6 mx-auto rounded-full" />
      
      <h2 className="text-2xl font-bold text-white mb-4">
        TARGET_NOT_FOUND
      </h2>
      
      <p className="text-gray-400 mb-10 max-w-md mx-auto">
        お探しのコンテンツはアーカイブに存在しないか、移動した可能性があります。
        {query && <span className="block mt-2 text-sm text-orange-400/70">検索条件: "{query}"</span>}
      </p>

      <Link 
        href="/" 
        className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-orange-900/20"
      >
        RETURN_TO_DASHBOARD
      </Link>
    </div>
  );
}

/**
 * ✅ Next.js 15 用エントリポイント
 * static generation時のエラーを回避するための完全なSuspense境界です。
 */
export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-orange-500 font-mono text-sm">
          SYNCING_ERROR_LOGS...
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}