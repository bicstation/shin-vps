import StaticPageLayout from '@shared/static/StaticPageLayout';

export const metadata = {
  title: '広告掲載規定および免責事項 | tiper.live',
  description: 'tiper.liveにおけるアフィリエイト広告の取り扱い、各種APIの利用、および情報の正確性・年齢制限に関する免責事項の詳細。',
};

export default function AdsPolicyPage() {
  const toc = [
    { id: 'affiliate-disclosure', text: 'アフィリエイト広告の開示' },
    { id: 'fanza-assoc', text: 'FANZAアフィリエイトについて' },
    { id: 'api-disclaimer', text: 'APIデータの正確性と免責' },
    { id: 'content-policy', text: '作品評価の公平性の担保' },
    { id: 'age-restriction', text: '年齢制限と視聴資格' },
    { id: 'liability', text: '責任の制限' },
  ];

  return (
    <StaticPageLayout 
      title="Ads Policy & Disclaimer"
      description="tiper.liveの運営を支える広告の仕組みと、ユーザーの皆様に承諾いただきたい免責事項について記述します。"
      lastUpdated="2026年1月26日"
      toc={toc}
    >
      <section id="affiliate-disclosure">
        <h2>1. アフィリエイト広告の開示</h2>
        <p>
          tiper.live（以下「当サイト」）に掲載されている作品リンクの多くは、アフィリエイト広告プログラムを利用しています。ユーザーが当サイトのリンクを経由して配信サイト（FANZA等）で作品を購入した場合、広告主から当サイトに対し、販売額の一部が紹介料として支払われる仕組みとなっています。
        </p>
        <p>
          これらの収益は、高負荷なデータ解析サーバーの維持、情報の鮮度を保つためのシステム開発、およびコンテンツ制作の調査費用に充てられており、ユーザーに対して追加の費用が発生することは一切ありません。
        </p>
      </section>

      <section id="fanza-assoc">
        <h2>2. FANZAアフィリエイトについて</h2>
        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-[#e83e8c]/20 mb-8">
          <p className="text-sm font-bold text-gray-200">
            「tiper.liveは、株式会社デジタルコマースが運営するFANZA（旧DMM.R18）等の公式アフィリエイトプログラムに参加しています。当サイトが独自に提供する解析データに基づき、適切な規約の範囲内で作品紹介を行っています。」
          </p>
        </div>
        <p>
          当サイトは各配信プラットフォームのガイドラインを遵守し、成人向けコンテンツの適切な流通を支援する立場からリンクを掲載しています。
        </p>
      </section>

      <section id="api-disclaimer">
        <h2>3. APIデータの正確性と免責</h2>
        <p>
          当サイトは、各配信プラットフォームが提供するAPI（Application Programming Interface）を使用し、作品タイトル、出演者名、価格、画像等の情報を動的に取得・表示しています。
        </p>
        <ul>
          <li><strong>情報の即時性：</strong> 取得した情報は定期的に更新していますが、配信サイト側での急な価格改定やセール終了により、実際の販売価格とサイト上の表記が一時的に異なる場合があります。</li>
          <li><strong>配信終了：</strong> APIの仕様上、権利関係等により作品の配信が終了した場合でも、当サイト上にキャッシュデータが残る場合があります。最新の配信状況は、必ず遷移先の販売ページにてご確認ください。</li>
        </ul>
      </section>

      <section id="content-policy">
        <h2>4. 作品評価の公平性の担保</h2>
        <p>
          当サイト独自の指標である「5軸スコア」および解析内容は、収集されたメタデータとユーザー反響、および独自の評価ロジックに基づいています。特定作品の紹介料率の高さや、プロモーションの有無によって、評価スコアを不当に操作することはありません。
        </p>
      </section>

      <section id="age-restriction">
        <h2>5. 年齢制限と視聴資格</h2>
        <p>
          当サイトで紹介するコンテンツは、18歳以上の成人を対象としています。
        </p>
        <ul>
          <li><strong>自己責任：</strong> リンク先の外部サイトにて提供される作品の視聴・購入にあたっては、各サイトの利用規約および各自治体の定める法令を遵守してください。</li>
          <li><strong>ゾーニング：</strong> 未成年者の閲覧を防ぐためのフィルタリング設定などは、ユーザーご自身の責任において管理していただくようお願いいたします。</li>
        </ul>
      </section>

      <section id="liability">
        <h2>6. 責任の制限</h2>
        <p>
          当サイトの情報を利用したことにより生じたいかなる損害（金銭的損失、精神的苦痛、デバイスの不具合等）についても、当サイトは一切の責任を負いません。
        </p>
        <p>
          当サイトからリンクされている外部サイトのコンテンツ内容、プライバシーポリシー、およびサービス利用に関するトラブル（決済トラブル、視聴不可等）については、当該サイトの運営元に直接お問い合わせください。
        </p>
      </section>
    </StaticPageLayout>
  );
}