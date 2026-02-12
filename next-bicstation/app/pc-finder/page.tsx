import { Metadata } from 'next';
import { Suspense } from 'react';
import PCFinderClient from './PCFinderClient'; // クライアントコンポーネントを読み込む

export const metadata: Metadata = {
  title: 'PC Finder | あなたに最適な構成を診断',
  description: '予算や用途に合わせて、最適なPCパーツ構成を自動で提案します。',
};

export default function PCFinderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-900 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500 font-mono text-xs tracking-widest animate-pulse">INITIALIZING PC_FINDER...</p>
      </div>
    }>
      <PCFinderClient />
    </Suspense>
  );
}