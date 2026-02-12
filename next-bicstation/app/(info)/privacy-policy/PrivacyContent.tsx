"use client";

// 💡 【最強の回避策】Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
// ✅ 修正ポイント: useSearchParams をインポート
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/static/StaticPageLayout';

// ❌ 削除: export const metadata = { ... };
// 💡 重要: "use client" が宣言されたファイルからは metadata を export できません。
// タイトルや説明文は、下の StaticPageLayout の Props を通じてコンポーネントに渡されます。

/**
 * 💡 ページのメインコンテンツ部分を分離
 */
function PrivacyPolicyContent() {
  // ✅ 修正ポイント: ここで呼び出すことでビルド時の CSR bailout エラーを回避
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
      lastUpdated="2026年1月26日"
      toc={toc}
    >
      <section id="privacy-policy">
        <h2>1. 個人情報の取り扱い方針</h2>
        <p>
          BICSTATION（以下、「当サイト」）は、ユーザーのプライバシーを最優先事項として捉えています。当サイトが提供する各種情報サービス（以下、「本サービス」）において、ユーザーからお預かりする個人情報の重要性を認識し、個人情報保護法その他の関係法令を遵守するとともに、本方針に従って適切な取り扱いを行います。
        </p>
        <h3>収集する情報の範囲</h3>
        <p>
          当サイトでは、お問い合わせ時に入力いただく「お名前」「メールアドレス」以外に、アクセスログの収集（IPアドレス、ブラウザタイプ、リファラ情報等）を行っています。これらの情報は、サイトの利用状況分析、および不正アクセスの防止を目的としたものであり、個人を特定するものではありません。
        </p>
      </section>

      <section id="cookie-policy">
        <h2>2. Cookieおよびアクセス解析について</h2>
        <p>
          当サイトは、ユーザーへの最適な情報提供と広告の配信を目的として、Cookie（クッキー）技術を利用しています。Cookieとは、ブラウザとサーバー間で送受信される小さなテキストデータであり、ユーザーの利便性を向上させるために使用されます。
        </p>
        <h3>Googleアナリティクスの利用</h3>
        <p>
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。GoogleアナリティクスはCookieを使用してデータを収集しますが、データは匿名で収集されており、個人を特定するものではありません。詳細についてはGoogleのポリシーページをご確認ください。
        </p>
      </section>

      <section id="ad-disclosure">
        <h2>3. 広告の配信およびアフィリエイト表記</h2>
        <p>
          BICSTATIONは、各企業との提携に基づき、アフィリエイトプログラムに参加しています。これにより、当サイト内のリンクを経由して商品を購入された際、運営者に紹介料が発生する場合があります。この収益は、サーバー維持費、記事執筆のための製品購入、および最新情報の調査費用に充てられます。
        </p>
        <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 mb-8">
          <p className="font-bold mb-2">【Amazonアソシエイト・プログラム参加宣言】</p>
          <p className="text-sm">
            BICSTATIONは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
          </p>
        </div>
        <p>
          その他、楽天アフィリエイト、Yahoo!ショッピング、バリューコマース（リンクシェアを含む）等のASP（アフィリエイト・サービス・プロバイダ）を利用しています。当サイトが特定の製品を「おすすめ」として紹介する場合でも、それは公平な基準に基づいた評価であり、紹介料の有無によって評価が歪められることはありません。
        </p>
      </section>

      <section id="api-usage">
        <h2>4. APIデータの正確性と更新頻度</h2>
        <p>
          当サイトで表示されているPC周辺機器やパーツの価格、スペック、在庫状況は、各販売プラットフォームが提供するAPI（Application Programming Interface）を介してリアルタイム、あるいは短周期でキャッシュされたデータを表示しています。
        </p>
        <h3>情報の反映ラグについて</h3>
        <p>
          PC関連市場は価格変動が非常に激しく、1日に何度も価格が改定される場合があります。当サイトではAPIの仕様に基づき最新データの取得に努めておりますが、API側の遅延やキャッシュの保持期間により、実際の販売サイトと表示価格が異なる場合があります。最終的な取引条件については、必ず遷移先のECサイト（Amazon、楽天市場、Yahoo!ショッピング等）の販売ページをご確認ください。
        </p>
      </section>

      <section id="disclaimer">
        <h2>5. 免責事項・自己責任の原則</h2>
        <p>
          当サイトに掲載されている情報、リンク先での取引によって生じたトラブルや損害について、当サイトおよび運営者は一切の責任を負いかねます。
        </p>
        <p>
          特に PC 自作、ファームウェアのアップデート、周辺機器の互換性に関する情報は、環境によって結果が大きく異なる場合があります。情報のご利用にあたっては、メーカーの公式マニュアルを併読の上、ご自身の判断と責任において行っていただきますようお願い申し上げます。
        </p>
      </section>

      <section id="copyright">
        <h2>6. 著作権および引用ルール</h2>
        <p>
          当サイト内に掲載されている文章、画像、独自作成の比較表、ロゴ、デザインの著作権は、BICSTATIONまたは正当な権利者に帰属します。
        </p>
        <p>
          引用については「著作権法」に基づき、引用元として当サイト名（BICSTATION）と該当ページへのリンクを明記した場合に限り許可いたします。ただし、全文転載や、画像のみを直接リンクして表示させる行為（直リンク）、および商用利用目的での無断転載は固く禁じます。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 * CSRフックを使用する StaticPageLayout を Suspense 境界で保護
 */
export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        <p className="text-gray-400 text-sm">Loading Privacy Policy...</p>
      </div>
    }>
      <PrivacyPolicyContent />
    </Suspense>
  );
}