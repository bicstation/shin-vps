"use client";

// 💡 ビルド時の静的レンダリングを無効化し、実行時に評価するように強制します
export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
import Link from 'next/link';
// ✅ 将来的な拡張やビルドエラー回避のため、navigationをインポート可能にしておきます
import { useSearchParams } from 'next/navigation';

/**
 * 💡 404コンテンツ本体
 */
function NotFoundContent() {
  // 現状使用していなくても、Suspense境界の内部に配置することで
  // Next.jsのビルド時エラー（Missing Suspense boundary）を確実に防ぎます。
  try {
    useSearchParams();
  } catch (e) {
    // サーバーサイドでの実行時は無視
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">お探しのページは見つかりませんでした。</p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}

/**
 * ✅ Next.js 15 用のエントリポイント
 * static generation時の「useSearchParams()」エラーを回避するためのSuspense境界です。
 */
export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}