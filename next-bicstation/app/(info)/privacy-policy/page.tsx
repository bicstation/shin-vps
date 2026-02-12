import { Metadata } from 'next';
import { Suspense } from 'react'; // ✅ Suspenseをインポート
import PrivacyContent from './PrivacyContent';

// ✅ サーバーサイドでメタデータを定義（ここは変更なし）
export const metadata: Metadata = {
  title: 'Privacy & Disclosure | BICSTATION',
  description: 'BICSTATIONの運営方針、個人情報保護、およびアフィリエイト広告利用に関する法的開示情報です。',
};

export default function PrivacyPolicyPage() {
  return (
    // ✅ PrivacyContent の中で useSearchParams を使っているため、ここでラップが必要
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 font-mono text-xs animate-pulse uppercase tracking-widest">
          Loading Privacy Policy...
        </div>
      </div>
    }>
      <PrivacyContent />
    </Suspense>
  );
}