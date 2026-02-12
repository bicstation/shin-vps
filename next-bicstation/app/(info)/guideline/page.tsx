import { Metadata } from 'next';
import { Suspense } from 'react';
import GuidelinePageContent from './GuidelineContent'; // クライアント側をインポート

export const metadata: Metadata = {
  title: 'Editorial Guideline | BICSTATION',
  description: '読者の皆様に、常に「信頼できるデータ」を届けるための、BICSTATION独自の制作・編集基準です。',
};

export default function GuidelinePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center p-20 text-gray-400 min-h-screen bg-slate-950">
        <span className="animate-pulse font-mono text-xs uppercase tracking-widest">Loading Guidelines...</span>
      </div>
    }>
      <GuidelinePageContent />
    </Suspense>
  );
}