// app/adspolicy/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import AdsPolicyPageContent from './AdsPolicyContent';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: '広告ポリシーと免責事項 | BIC-SAVING',
  description: 'BIC-SAVING（ビック的節約生活）の広告運用、アフィリエイトプログラムの利用、および免責事項に関する重要事項を掲載しています。',
};

export default function AdsPolicyPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center text-emerald-500 min-h-screen flex items-center justify-center bg-black font-mono text-xs uppercase tracking-widest">
        <span className="animate-pulse">Loading Compliance Data...</span>
      </div>
    }>
      <AdsPolicyPageContent />
    </Suspense>
  );
}