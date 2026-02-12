"use client";

// 💡 Next.jsの静的解析を強制的にバイパス
export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
// ✅ 修正ポイント: useSearchParams を明示的にインポート
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/static/StaticPageLayout';

// ❌ 削除: export const metadata = { ... }; 
// 💡 重要: "use client" のファイルからは metadata を export できません。
// メタデータが必要な場合は、layout.tsx で定義するか、別のサーバーコンポーネントから読み込ませる必要があります。

/**
 * 💡 ページのメインコンテンツ部分
 */
function AdsPolicyPageContent() {
  // ✅ 修正ポイント: ここで useSearchParams を呼び出し、ビルドエラーを抑制
  const searchParams = useSearchParams();

  const toc = [
    { id: 'affiliate-disclosure', text: 'アフィリエイト広告の開示' },
    { id: 'amazon-assoc', text: 'Amazonアソシエイトについて' },
    { id: 'api-disclaimer', text: 'APIデータの正確性と免責' },
    { id: 'product-selection', text: '製品選定と公平性の担保' },
    { id: 'price-notice', text: '価格変動に関する重要事項' },
    { id: 'liability', text: '責任の制限' },
  ];

  return (
    <StaticPageLayout 
      title="Ads Policy & Disclaimer"
      description="BICSTATIONの運営を支える広告の仕組みと、ユーザーの皆様に承諾いただきたい免責事項について記述します。"
      lastUpdated="2026年1月26日"
      toc={toc}
    >
      <section id="affiliate-disclosure">
        <h2>1. アフィリエイト広告の開示</h2>
        <p>
          BICSTATION（以下「当サイト」）に掲載されている一部のリンクは、アフィリエイト広告を利用しています。読者が当サイトのリンクを経由して商品を購入した場合、広告主から当サイトに対し、販売額の一部が紹介料として支払われる仕組みとなっています。
        </p>
        <p>
          これらの収益は、当サイトのサーバー維持費、コンテンツ制作のための調査費、検証用機材の購入に充てられており、読者に対して追加の費用が発生することは一切ありません。
        </p>
      </section>

      <section id="amazon-assoc">
        <h2>2. Amazonアソシエイトについて</h2>
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mb-8">
          <p className="text-sm font-bold">
            「BICSTATIONは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。」
          </p>
        </div>
        <p>
          当サイトは、Amazon.co.jp（アマゾンジャパン合同会社）が提供する公式のアフィリエイトプログラム参加し、適切な規約に基づいたリンク掲載を行っています。
        </p>
      </section>

      <section id="api-disclaimer">
        <h2>3. APIデータの正確性と免責</h2>
        <p>
          当サイトは、Amazon Product Advertising API、楽天市場商品検索API、Yahoo!ショッピングAPI等の各種APIを使用し、商品情報を動的に取得しています。
        </p>
        <ul>
          <li><strong>正確性：</strong> 取得した情報は最新の状態を維持するようプログラムされていますが、情報の更新間隔により、実際の販売サイトと価格や在庫が異なる場合があります。</li>
          <li><strong>仕様：</strong> 商品のスペック（CPU速度、メモリ容量、インターフェース等）は、各メーカーおよび販売元が提供するAPIデータに基づいています。</li>
        </ul>
      </section>

      <section id="product-selection">
        <h2>4. 製品選定と公平性の担保</h2>
        <p>
          当サイトにおける製品の選定基準は、スペック、コストパフォーマンス、ユーザーレビュー、および当サイト独自の検証データに基づいています。紹介料の高さによって製品のランキングや評価を操作することは一切ありません。
        </p>
      </section>

      <section id="price-notice">
        <h2>5. 価格変動に関する重要事項</h2>
        <p>
          ガジェットおよびPCパーツの市場価格は非常に流動的です。当サイトに記載されている「最安値」や「セール情報」は、特定の時点におけるデータです。購入を確定される前に、必ず各販売サイトのカート画面で最終金額（送料・税込価格等）を確認してください。
        </p>
      </section>

      <section id="liability">
        <h2>6. 責任の制限</h2>
        <p>
          当サイトの情報を利用したことにより生じたいかなる損害（ハードウェアの故障、データの損失、金銭的損失等）についても、当サイトは一切の責任を負いません。
        </p>
        <p>
          特に自作PC関連の相性問題や、非公式な設定変更については、ユーザーご自身の責任において実施してください。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 * StaticPageLayout を Suspense 境界で保護
 */
export default function AdsPolicyPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center text-slate-400">
        Loading Policy...
      </div>
    }>
      <AdsPolicyPageContent />
    </Suspense>
  );
}