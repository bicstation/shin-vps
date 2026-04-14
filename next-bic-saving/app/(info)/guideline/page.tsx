// app/guideline/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import GuidelinePageContent from './GuidelineContent';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Editorial Guideline | BIC-SAVING（ビック的節約生活）',
  description: '読者の皆様に、常に「再現性のある家計戦略」を届けるための、BIC-SAVING独自の制作・編集基準（エディトリアルガイドライン）です。',
};

export default function GuidelinePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center p-20 text-emerald-500 min-h-screen bg-black">
        <span className="animate-pulse font-mono text-xs uppercase tracking-widest">
          Syncing Editorial Standards...
        </span>
      </div>
    }>
      <GuidelinePageContent />
    </Suspense>
  );
}