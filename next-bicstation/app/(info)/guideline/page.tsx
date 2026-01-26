import StaticPageLayout from '@/components/static/StaticPageLayout';

export const metadata = {
  title: 'コンテンツ制作ガイドライン | BICSTATION',
  description: 'BICSTATION（ビックステーション）が情報を発信・検証する際の編集基準、評価方法、および品質管理に関する指針を公開しています。',
};

export default function GuidelinePage() {
  const toc = [
    { id: 'quality', text: '情報の品質維持と正確性の担保' },
    { id: 'review-standard', text: '製品レビュー・比較の評価基準' },
    { id: 'update-cycle', text: '記事の更新・メンテナンス周期' },
    { id: 'neutrality', text: '公平・中立な立場での情報発信' },
    { id: 'fact-check', text: '外部ソースとファクトチェック' },
    { id: 'feedback', text: '誤り指摘・改善依頼への対応' },
  ];

  return (
    <StaticPageLayout 
      title="Editorial Guideline"
      description="読者の皆様に、常に「信頼できるデータ」を届けるための、BICSTATION独自の制作・編集基準です。"
      lastUpdated="2026年1月26日"
      toc={toc}
    >
      <section id="quality">
        <h2>1. 情報の品質維持と正確性の担保</h2>
        <p>
          BICSTATIONでは、テクノロジーの専門知識を持つ編集部員が、全てのコンテンツの監修を行っています。PCパーツやガジェットのスペック、対応規格（USB4, PCIe 5.0等）は多岐にわたり、誤解を招きやすい表現が多く存在します。私たちは、メーカーのホワイトペーパーや技術仕様書を一次ソースとし、曖昧な表現を排除した情報の提供を徹底しています。
        </p>
      </section>

      <section id="review-standard">
        <h2>2. 製品レビュー・比較の評価基準</h2>
        <p>
          当サイトにおける製品評価は、単なる主観ではなく、以下の多角的なスコアリングに基づいています。
        </p>
        <ul>
          <li><strong>パフォーマンス：</strong> 各種ベンチマークソフトによる実測値。</li>
          <li><strong>耐久性・品質：</strong> 使用されている素材、冷却設計、保証期間。</li>
          <li><strong>市場価格：</strong> 競合製品との相対的なコストパフォーマンス（APIデータ比較）。</li>
          <li><strong>ユーザー利便性：</strong> 設定の容易さ、ソフトウェアの安定性。</li>
        </ul>
      </section>

      <section id="update-cycle">
        <h2>3. 記事の更新・メンテナンス周期</h2>
        <p>
          ガジェット情報の価値は鮮度にあります。私たちは、製品の「型落ち」や「新モデル登場」を検知した際、速やかに既存記事への追記やリンク更新を行います。また、APIによる価格監視を行い、極端な高騰や品切れが発生している場合には、代替案の提示を推奨する自動通知システムを導入しています。
        </p>
      </section>

      <section id="neutrality">
        <h2>4. 公平・中立な立場での情報発信</h2>
        <p>
          特定のメーカーから直接的な金銭提供を受けて「良い評価」を約束するようなコンテンツ制作は一切行いません。貸出機によるレビューの場合も、欠点（デメリット）があれば率直に記述することを条件としています。ユーザーの利益を最優先することが、メディアとしての長期的成功に繋がると確信しています。
        </p>
      </section>

      <section id="fact-check">
        <h2>5. 外部ソースとファクトチェック</h2>
        <p>
          複雑な技術検証が必要な場合、当サイト独自の検証だけでなく、国内外の信頼できる技術系メディアの検証データとのクロスチェックを行います。また、ユーザーコミュニティでの実際の使用報告も貴重なデータとして扱い、理論値と実測値の乖離がないかを常に検証しています。
        </p>
      </section>

      <section id="feedback">
        <h2>6. 誤り指摘・改善依頼への対応</h2>
        <p>
          万が一、掲載内容に誤りがある場合、または最新情報との不一致をご指摘いただいた場合、編集部にて内容を確認し、原則24時間以内に修正・更新対応を行います。情報の正確性は、読者の皆様との共同作業で高められるものと考えております。
        </p>
      </section>
    </StaticPageLayout>
  );
}