import { Metadata } from 'next';
import { Suspense } from 'react';
import AboutPageContent from './AboutContent'; // 中身をインポート

// ✅ クライアントコンポーネントでは定義できないメタデータをここで定義
export const metadata: Metadata = {
  title: 'About BICSTATION | サイトについて',
  description: '私たちは「納得感のあるガジェット選び」を加速させるための、技術と情報のステーションです。',
};

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs animate-pulse uppercase tracking-widest">
        Loading About Page...
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}