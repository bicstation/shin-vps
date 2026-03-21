// app/about/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import AboutPageContent from './AboutContent'; // 下記のクライアントコンポーネントを呼ぶ

// ✅ メタデータはサーバーコンポーネントでのみ定義可能
export const metadata: Metadata = {
  title: 'About BICSTATION | サイトについて',
  description: '私たちは「納得感のあるガジェット選び」を加速させるための、技術と情報のステーションです。',
};

// ✅ 静的生成をスキップし、実行時の最新状態を保証
export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-mono text-xs animate-pulse uppercase tracking-widest">
        Loading System Data...
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}