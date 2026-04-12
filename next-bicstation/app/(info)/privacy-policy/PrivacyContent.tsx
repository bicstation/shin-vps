"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

// 💡 Next.jsの静的解析を強制的にバイパス
export const dynamic = "force-dynamic";

/**
 * 💡 ページのメインコンテンツ部分
 */
function PrivacyPolicyContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'privacy-policy', text: '個人情報の取り扱い方針' },
    { id: 'cookie-policy', text: 'Cookieおよびアクセス解析について' },
    { id: 'ad-disclosure', text: '広告の配信およびアフィリエイト表記' },
    { id: 'api-usage', text: 'APIデータの正確性と更新頻度' },
    { id: 'disclaimer', text: '免責事項・自己責任の原則' },
    { id: 'copyright', text: '著作権および引用ルール' },
  ];

  return (
    <StaticPageLayout 
      title="Privacy & Disclosure"
      description="BICSTATIONの運営方針、個人情報保護、およびアフィリエイト広告利用に関する法的開示情報です。"
      lastUpdated="2026年4月12日"
      toc={toc}
    >
      <section id="privacy-policy">
        <h2>1. 個人情報の取り扱い方針</h2>
        <p>
          BICSTATION（以下、「当サイト」）は、ユーザーのプライバシーを最優先事項として捉えています。当サイトが提供する各種情報サービスにおいて、ユーザーからお預かりする個人情報の重要性を認識し、個人情報保護法その他の関係法令を遵守いたします。
        </p>
        <h3>個人情報の利用目的</h3>
        <p>
          当サイトでは、お問い合わせ時に入力いただいた名前やメールアドレス等の個人情報は、質問に対する回答や必要な情報を電子メールなどでご連絡する場合にのみ利用し、目的以外での利用はいたしません。
        </p>
      </section>

      <section id="cookie-policy">
        <h2>2. Cookieおよびアクセス解析について</h2>
        <p>
          当サイトは、ユーザーへの最適な情報提供と広告の配信を目的として、Cookie（クッキー）技術を利用しています。Cookieとは、ブラウザとサーバー間で送受信される小さなデータであり、ユーザーの利便性を向上させるために使用されます。
        </p>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 text-sm">
          <strong>【アクセス解析ツールの利用】</strong><br />
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。GoogleアナリティクスはCookieを使用してトラフィックデータを収集しますが、データは匿名で収集されており、個人を特定するものではありません。
          Cookieを無効にすることで収集を拒否することが可能ですので、お使いのブラウザの設定をご確認ください。
        </div>
      </section>

      <section id="ad-disclosure">
        <h2>3. 広告の配信およびアフィリエイト表記</h2>
        <p>
          BICSTATIONは、第三者配信による広告サービス（Googleアドセンス）および各種アフィリエイトプログラムに参加しています。
        </p>
        <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 mb-8">
          <p className="font-bold mb-2">【Googleアドセンスに関する重要開示】</p>
          <p className="text-sm mb-4">
            Googleなどの第三者配信事業者は、Cookie を使用して、ユーザーが当サイトや他のウェブサイトに過去にアクセスした際の情報に基づいて広告を配信します。Google が広告 Cookie を使用することにより、Google やそのパートナーは当サイトや他のサイトへのアクセス情報に基づいて、適切な広告をユーザーに表示できます。
          </p>
          <p className="text-sm">
            ユーザーは、<a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">広告設定</a> でパーソナライズ広告を無効にできます。
          </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 text-sm italic">
          「BICSTATIONは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。」
        </div>
      </section>

      <section id="api-usage">
        <h2>4. APIデータの正確性と更新頻度</h2>
        <p>
          当サイトの価格、スペック、在庫状況は、Amazon、楽天市場、Yahoo!ショッピング等が提供するAPIを介して取得しています。
        </p>
        <p>
          情報の取得には細心の注意を払っておりますが、データの反映ラグやキャッシュの影響により、実際の販売サイトと表示内容が異なる場合があります。<strong>最終的な購入条件については、必ず各販売サイト（Amazon、楽天市場、Yahoo!ショッピング等）のページをご確認ください。</strong>
        </p>
      </section>

      <section id="disclaimer">
        <h2>5. 免責事項・自己責任の原則</h2>
        <p>
          当サイトに掲載されている情報、リンク先での取引によって生じたトラブルや損害について、当サイトおよび運営者は一切の責任を負いかねます。
        </p>
        <p>
          特にPC自作やファームウェアの更新等の技術的な操作は、環境によって結果が大きく異なります。情報のご利用にあたっては、メーカーの公式マニュアルを併読の上、ご自身の判断と責任において行っていただきますようお願い申し上げます。
        </p>
      </section>

      <section id="copyright">
        <h2>6. 著作権および引用ルール</h2>
        <p>
          当サイト内に掲載されている文章、画像、独自作成の比較表等の著作権は、BICSTATIONまたは正当な権利者に帰属します。引用については、当サイト名（BICSTATION）と該当ページへのリンクを明記した場合に限り許可いたします。無断転載および画像への直リンクは固く禁じます。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 */
export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">Initializing Privacy Module...</p>
      </div>
    }>
      <PrivacyPolicyContent />
    </Suspense>
  );
}