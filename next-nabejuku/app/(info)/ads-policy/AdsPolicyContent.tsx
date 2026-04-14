"use client";

/**
 * 🛰️ BIC-SAVING: Ads Policy & Disclaimer (Client Component)
 * --------------------------------------------------------
 * 🔧 修正・最適化ポイント:
 * 1. 透明性の確保: アフィリエイトとGoogle AdSenseの利用を明記。
 * 2. 免責事項の強化: 投資や契約は自己責任であることを論理的に記述。
 * 3. クリーンなUI: 法的な硬い文章を Lucide アイコンで読みやすく整理。
 */

export const dynamic = "force-dynamic";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    Info, 
    ShieldAlert, 
    Handshake, 
    Scale, 
    Lock,
    ExternalLink 
} from 'lucide-react';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

export default function AdsPolicyPageContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'ads', text: '広告の配信について' },
    { id: 'affiliate', text: 'アフィリエイトプログラムの利用' },
    { id: 'disclaimer', text: '免責事項' },
    { id: 'copyright', text: '著作権・肖像権について' },
    { id: 'links', text: 'リンクについて' },
  ];

  return (
    <StaticPageLayout 
      title="Ads Policy & Disclaimer"
      description="BIC-SAVINGの運営方針、広告の取り扱い、およびご利用にあたっての免責事項を定めています。"
      lastUpdated="2026年4月14日"
      toc={toc}
    >
      <section id="ads">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-blue-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">1. 広告の配信について</h2>
        </div>
        <p className="leading-relaxed mb-4">
          当サイト（BIC-SAVING）では、第三者配信による広告サービス「Google AdSense（グーグルアドセンス）」を利用しています。
        </p>
        <p className="leading-relaxed">
          広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報「Cookie」（氏名、住所、メール アドレス、電話番号は含まれません）を使用することがあります。Cookieを無効にする設定およびGoogleアドセンスに関する詳細は、Googleの「<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">広告に関するポリシーと規約</a>」をご覧ください。
        </p>
      </section>

      <section id="affiliate" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Handshake className="text-emerald-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">2. アフィリエイトプログラムの利用</h2>
        </div>
        <p className="leading-relaxed mb-4">
          当サイトは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
        </p>
        <p className="leading-relaxed">
          その他、楽天アフィリエイトやバリューコマース、A8.net等の各種ASP（アフィリエイト・サービス・プロバイダ）を利用しています。これらのプログラムにより得られた収益は、サイトの運営維持および情報の検証費用に充てられます。
        </p>
      </section>

      <section id="disclaimer" className="mt-12 border-t border-slate-800 pt-12">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-orange-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">3. 免責事項</h2>
        </div>
        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="leading-relaxed text-sm">
            当サイトで掲載している画像の著作権・肖像権等は、各権利所有者に帰属します。権利を侵害する目的はございません。記事の内容や掲載画像等に問題がございましたら、各権利所有者様本人が直接メールでご連絡下さい。確認後、対応させて頂きます。
          </p>
          <p className="leading-relaxed text-sm">
            当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
          </p>
          <p className="leading-relaxed text-sm font-bold text-slate-200">
            当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
          </p>
        </div>
      </section>

      <section id="copyright" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="text-purple-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">4. 著作権について</h2>
        </div>
        <p className="leading-relaxed">
          当サイトに掲載されている文章・画像の無断転載は禁止しております。当サイトは著作権の侵害を目的とするものではありません。使用している版権物の知的所有権は、それぞれの著作者・団体に帰属します。著作権や肖像権に関して問題がある場合は、お問い合わせフォームよりご連絡ください。
        </p>
      </section>

      <section id="links" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="text-blue-400 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">5. リンクについて</h2>
        </div>
        <p className="leading-relaxed">
          当サイトは基本的にリンクフリーです。リンクを行う場合の許可や連絡は不要です。ただし、インラインフレームの使用や画像の直リンクはご遠慮ください。
        </p>
      </section>
    </StaticPageLayout>
  );
}