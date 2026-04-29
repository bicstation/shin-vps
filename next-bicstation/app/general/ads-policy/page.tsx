export const dynamic = "force-dynamic"; // ✅ これを追加

import { Metadata } from 'next';
import { Suspense } from 'react';
import AdsPolicyPageContent from './AdsPolicyContent'; // 中身をインポート

export const metadata: Metadata = {
  title: 'Ads Policy & Disclaimer | BICSTATION',
  description: 'BICSTATIONの運営を支える広告の仕組みと、免責事項に関する重要なガイドラインです。',
};

export default function AdsPolicyPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center text-slate-400 min-h-screen flex items-center justify-center bg-slate-950 font-mono text-xs uppercase tracking-widest">
        <span className="animate-pulse">Loading Policy...</span>
      </div>
    }>
      <AdsPolicyPageContent />
    </Suspense>
  );
}