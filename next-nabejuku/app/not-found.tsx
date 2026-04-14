"use client";
// /home/maya/shin-dev/shin-vps/next-bic-saving/app/not-found.tsx

// 💡 Next.jsの静的解析を強制的にバイパスし、ランタイムでの動作を保証
export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * 💡 404コンテンツ本体
 */
function NotFoundContent() {
  // useSearchParamsをSuspense内で呼ぶことで、ビルド時のデオプティマイズを防止
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* 🛸 視覚的インパクト（オレンジ系のアクセント） */}
      <h1 className="text-8xl font-black text-orange-500 mb-2 opacity-80">404</h1>
      <div className="h-1 w-20 bg-orange-500 mb-6 mx-auto rounded-full" />
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        PAGE_NOT_FOUND
      </h2>
      
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        お探しのコンテンツは存在しないか、移動した可能性があります。
        {query && <span className="block mt-2 text-sm text-orange-400">検索条件: "{query}"</span>}
      </p>

      <Link 
        href="/" 
        className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-orange-900/20"
      >
        ホームへ戻る
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
          LOADING_NOT_FOUND_HANDLER...
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}