/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-bicstation/app/pc-finder/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import PCFinderClient from './PCFinderClient';

/**
 * =============================================================================
 * 🌐 サーバーセクション (Metadata & Configuration)
 * =============================================================================
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'PC Finder | あなたに最適な構成を診断',
  description: '予算や用途に合わせて、約4,000件のデータベースから最適なPCを自動で提案します。',
};

/**
 * =============================================================================
 * 🏗️ ページエントリポイント (Root Export)
 * =============================================================================
 */
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