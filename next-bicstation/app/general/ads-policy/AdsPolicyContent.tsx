"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

// 💡 Next.jsの静的解析バイパス
export const dynamic = "force-dynamic";

/**
 * 💡 ページのメインコンテンツ
 */
function AdsPolicyPageContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'mission', text: '当サイトの運営方針' },
    { id: 'affiliate-disclosure', text: '広告の仕組みと紹介料' },
    { id: 'amazon-assoc', text: 'Amazonアソシエイトについて' },
    { id: 'api-disclaimer', text: 'データの正確性とAI解析について' },
    { id: 'price-notice', text: '価格と在庫の確認' },
    { id: 'liability', text: '免責事項' },
  ];

  return (
    <StaticPageLayout 
      title="Ads Policy & Disclaimer"
      description="BICSTATIONの運営を支える広告の仕組みと、AI解析データの扱い、免責事項についてご説明します。"
      lastUpdated="2026年4月12日"
      toc={toc}
    >
      {/* イントロダクション */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-10">
        <h2 className="text-blue-900 mt-0 text-xl">💡 読者の皆様へ</h2>
        <p className="text-blue-800 text-sm mb-0">
          BICSTATIONは、最新のAI技術を活用して「本当に価値のあるPC・ガジェット」を可視化する個人メディアです。
          情報の透明性を確保し、安心してご利用いただくために、以下のポリシーを定めています。
        </p>
      </div>

      <section id="mission">
        <h2>1. 当サイトの運営方針</h2>
        <p>
          当サイトは、膨大な製品データの中から、ユーザーの用途に最適な一台を「客観的な数値」で見つけ出すことを目的としています。
          <strong>紹介料の高さによってランキングの順位や評価を操作することは一切ありません。</strong> 
          評価スコアは、AIがスペックデータに基づいて一貫したアルゴリズムで算出しています。
        </p>
      </section>

      <section id="affiliate-disclosure">
        <h2>2. 広告の仕組みと紹介料</h2>
        <p>
          BICSTATIONに掲載されている一部のリンクは、アフィリエイト広告を利用しています。
          読者の皆様がリンクを経由して商品を購入された場合、販売額の一部が紹介料として当サイトに支払われます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 m-0">収益の使い道</h4>
            <p className="text-sm text-slate-600 mb-0">サーバー維持費、AI API利用料、検証用デバイスの購入、より精度の高い解析システムの開発に使用されます。</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 m-0">ユーザー様への影響</h4>
            <p className="text-sm text-slate-600 mb-0">リンクを経由しても、商品価格が上がったり追加費用が発生することは一切ありません。ご安心ください。</p>
          </div>
        </div>
      </section>

      <section id="amazon-assoc">
        <h2>3. Amazonアソシエイトについて</h2>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 italic text-sm text-slate-700">
          「BICSTATIONは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。」
        </div>
        <p>
          アマゾンジャパン合同会社を含む各公式プログラムに則り、適切にリンクを掲載しています。
        </p>
      </section>

      <section id="api-disclaimer">
        <h2>4. データの正確性とAI解析について</h2>
        <p>
          当サイトでは、Amazon、楽天、Yahoo!ショッピング等の公式API、およびGemini等の高度なAIを用いて情報を取得・解析しています。
        </p>
        <ul className="space-y-2">
          <li><strong>AI解析スコア：</strong> レーダーチャートやスペック評価は、AIが技術仕様を分析して算出した「独自の指標」です。実際の使用感やメーカー公式のベンチマークとは異なる場合があります。</li>
          <li><strong>情報の更新：</strong> データは定期的に更新されていますが、販売サイト側の急な変更により、スペックや仕様が異なる場合があります。</li>
        </ul>
      </section>

      <section id="price-notice">
        <h2>5. 価格と在庫の確認（重要）</h2>
        <p>
          PCパーツやガジェットの価格は非常に流動的です。
          <strong>当サイトに表示されている価格や「在庫あり」のステータスは、データ取得時点のものです。</strong>
          購入を確定される際は、必ず各販売サイト（Amazon等）の最終確認画面にて、価格・送料・納期を再度ご確認ください。
        </p>
      </section>

      <section id="liability">
        <h2>6. 免責事項</h2>
        <p>
          当サイトの情報は、可能な限り正確を期すよう努めておりますが、その内容を保証するものではありません。
          当サイトの情報を利用したことにより生じたいかなる損害（PCの故障、購入トラブル、金銭的損失等）についても、当サイトおよび運営者は一切の責任を負いかねます。
          最終的な購入の決定は、ユーザー様ご自身の判断でお願いいたします。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 */
export default function AdsPolicyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="animate-pulse">Loading Policy...</div>
      </div>
    }>
      <AdsPolicyPageContent />
    </Suspense>
  );
}