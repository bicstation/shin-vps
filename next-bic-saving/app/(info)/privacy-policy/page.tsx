// app/privacy-policy/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import PrivacyPolicyContent from './PrivacyPolicyContent';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'プライバシーポリシー | BIC-SAVING',
  description: 'BIC-SAVING（ビック的節約生活）における個人情報の取り扱い、Cookieの使用、およびデータ保護方針について説明します。',
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center text-emerald-500 min-h-screen flex items-center justify-center bg-black font-mono text-xs uppercase tracking-widest">
        <span className="animate-pulse">Loading Privacy Protocol...</span>
      </div>
    }>
      <PrivacyPolicyContent />
    </Suspense>
  );
}