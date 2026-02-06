import StaticPageLayout from '@shared/static/StaticPageLayout';

export const metadata = {
  title: 'コンテンツ制作ガイドライン | tiper.live',
  description: 'tiper.live（タイパー・ライブ）が情報を発信・解析する際の編集基準、独自の5軸評価メソッド、および品質管理に関する指針を公開しています。',
};

export default function GuidelinePage() {
  const toc = [
    { id: 'quality', text: '情報の正確性と専門性の担保' },
    { id: 'evaluation-logic', text: '独自の5軸評価（Stats）の算出基準' },
    { id: 'freshness', text: '情報の鮮度と更新サイクル' },
    { id: 'independence', text: '中立的な評価姿勢と広告の関係' },
    { id: 'compliance', text: 'コンプライアンスとゾーニングの徹底' },
    { id: 'corrections', text: '情報の誤り指摘への対応方針' },
  ];

  return (
    <StaticPageLayout 
      title="Editorial Guideline"
      description="読者の皆様に、常に「納得できる作品データ」を届けるための、tiper.live独自の制作・編集基準です。"
      lastUpdated="2026年1月26日"
      toc={toc}
    >
      <section id="quality">
        <h2>1. 情報の正確性と専門性の担保</h2>
        <p>
          tiper.liveでは、アダルトエンターテインメントに精通した専門のデータアナリストと編集部員が、コンテンツのメタデータを管理しています。作品のジャンル分け、出演者情報の紐付け、および配信形式の確認にあたっては、各販売プラットフォームの公式APIデータを一次ソースとし、人力によるダブルチェックを行うことで情報の精度を高めています。
        </p>
      </section>

      <section id="evaluation-logic">
        <h2>2. 独自の5軸評価（Stats）の算出基準</h2>
        <p>
          当サイトの最大の特徴である「Performance Stats」は、以下の基準をベースに、独自のアルゴリズムによって算出されています。
        </p>
        <ul>
          <li><strong>VISUAL：</strong> 撮影機材（4K/VR等）のスペック、ライティングの質、出演者のビジュアルインパクトを数値化。</li>
          <li><strong>STORY：</strong> 脚本の独創性、シチュエーションの没入感、および構成の完成度を評価。</li>
          <li><strong>EROTIC：</strong> 演出の密度、表現の多様性、およびユーザー期待値に対する充足度を解析。</li>
          <li><strong>RARITY：</strong> 限定企画、新人デビュー作、特殊なロケーションなど、市場における希少価値を算出。</li>
          <li><strong>COST：</strong> 販売価格と収録時間、および満足度の相関関係（コストパフォーマンス）を比較。</li>
        </ul>
      </section>

      <section id="freshness">
        <h2>3. 情報の鮮度と更新サイクル</h2>
        <p>
          エンターテインメント情報の価値は鮮度にあります。私たちは、新作の発売日情報、期間限定セール、および配信終了予定を24時間体制でシステム監視しています。APIを通じて取得される価格情報はリアルタイムで反映されるよう設計されており、ユーザーが「リンク先で価格が違っていた」という体験を最小限に抑えるよう努めています。
        </p>
      </section>

      <section id="independence">
        <h2>4. 中立的な評価姿勢と広告の関係</h2>
        <p>
          tiper.liveは、特定のメーカーや配信元から直接的な金銭提供を受けて評価スコアを操作することは一切ありません。紹介料率の変動が、作品の「Stats」やランキング順位に影響を与えることもありません。ユーザーにとって真に価値のある作品を浮き彫りにすることこそが、長期的なプラットフォームの価値に繋がると確信しています。
        </p>
      </section>

      <section id="compliance">
        <h2>5. コンプライアンスとゾーニングの徹底</h2>
        <p>
          成人向けコンテンツを扱う責任として、当サイトは国内の法的ガイドラインおよび各プラットフォームの規約を厳格に遵守します。過度な煽り表現の自粛、未成年者保護のための年齢制限確認の徹底、および権利関係に疑義のあるコンテンツの排除を行い、健全な紹介メディアとしての質を維持します。
        </p>
      </section>

      <section id="corrections">
        <h2>6. 情報の誤り指摘への対応方針</h2>
        <p>
          万が一、掲載内容（出演者名の誤字、リンクミス、データの不整合等）に誤りがある場合、ご指摘いただいた内容を速やかに精査し、原則として確認後24時間以内に修正対応を行います。 tiper.liveは、ユーザーの皆様からのフィードバックを通じて、より使いやすく、より正確なデータベースへと進化し続けます。
        </p>
      </section>
    </StaticPageLayout>
  );
}