export const dynamic = "force-dynamic"; // ✅ これを追加

import { Metadata } from 'next';
import { Suspense } from 'react';
import DisclaimerPageContent from './DisclaimerContent'; // コンテンツ側を読み込む

export const metadata: Metadata = {
  title: 'Disclaimer | BICSTATION',
  description: '当サイトをご利用いただくにあたっての法的責任の範囲と、免責事項に関する重要なガイドラインです。',
};

export default function DisclaimerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 font-mono text-xs animate-pulse uppercase tracking-widest">
          Loading Disclaimer...
        </div>
      </div>
    }>
      <DisclaimerPageContent />
    </Suspense>
  );
}