// /home/maya/shin-dev/shin-vps/next-bic-saving/app/about/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import AboutPageContent from './AboutContent';

/**
 * 🛰️ メタデータ (SEO & 信頼性重視)
 */
export const metadata: Metadata = {
  title: 'About BIC-SAVING | 技術で支出をデバッグする家計戦略メディア',
  description: 'BIC-SAVING（ビック的節約生活）は、元IT成功者がNext.jsとDockerを駆使して構築した、一次情報に基づいた「家計の再構築」メディアです。',
};

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center text-emerald-500 font-mono text-xs animate-pulse uppercase tracking-widest">
        Fetching Archive Info...
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}