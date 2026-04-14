"use client";

/**
 * 🛰️ BIC-SAVING: About Page (Client Component)
 * 修正内容:
 * - Next.js 15 の useSearchParams 警告を Suspense 境界で回避
 * - ガジェット軸から「技術的節約・家計デバッグ」軸へ内容を全面刷新
 * - E-E-A-T (経験・専門性・権威性・信頼性) を強化するライティング
 */

export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    ShieldCheck, 
    Code, 
    TrendingUp, 
    Zap, 
    AlertCircle, 
    HeartHandshake 
} from 'lucide-react';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

/**
 * 💡 ページのメインコンテンツ
 */
function AboutPageContent() {
  // useSearchParamsを呼び出すことで、親のSuspense境界が機能します
  const searchParams = useSearchParams();

  const toc = [
    { id: 'mission', text: 'BIC-SAVINGのミッション' },
    { id: 'debug', text: '家計を「デバッグ」するという考え方' },
    { id: 'editorial-policy', text: '一次情報と検証方針' },
    { id: 'tech-stack', text: '技術（API/VPS）による情報の正確性' },
    { id: 'transparency', text: '運営の透明性と信頼について' },
    { id: 'vision', text: '2026年、これからの展望' },
  ];

  return (
    <StaticPageLayout 
      title="About BIC-SAVING"
      description="私たちは、技術とロジックを駆使して「家計の脆弱性」を克服する、エンジニアのための家計戦略ステーションです。"
      lastUpdated="2026年4月14日"
      toc={toc}
    >
      <section id="mission">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-emerald-500 w-6 h-6" />
          <h2 className="m-0">1. BIC-SAVINGのミッション</h2>
        </div>
        <p>
          「複雑化するポイント経済圏、不透明な通信費、乱立するキャッシュレス決済。その迷路にロジックを通し、最短距離の正解を提示すること。」これがBIC-SAVINGのミッションです。
        </p>
        <p>
          現代の家計管理は、かつてないほど高度な「情報戦」となっています。同じ1万円の支出でも、経由するルートや決済カードの組み合わせ（スタック）によって、リターンは数％単位で異なります。私たちは、エンジニアリングの視点でこれら複雑な情報を構造化し、誰もが再現可能な「最適解」を提供することを目指しています。
        </p>
      </section>

      <section id="debug">
        <div className="flex items-center gap-2 mb-4">
          <Code className="text-blue-500 w-6 h-6" />
          <h2 className="m-0">2. 家計を「デバッグ」するという考え方</h2>
        </div>
        <p>
          BIC-SAVINGが提唱するのは、家計を一つの「システム」として捉える手法です。
        </p>
        <p>
          プログラムにバグ（脆弱性）があれば、処理効率は落ち、リソースは浪費されます。家計も同様です。不必要なサブスクリプション、最適化されていない決済ルート、還元率の低い固定費――これらはすべて「家計のバグ」です。私たちは、最新のWeb技術とデータ解析を用いてこれらのバグを特定し、修正（デバッグ）することで、生活の質を落とさずに余剰資金を最大化する戦略を構築しています。
        </p>
      </section>

      <section id="editorial-policy">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-emerald-500 w-6 h-6" />
          <h2 className="m-0">3. 一次情報と検証方針</h2>
        </div>
        <p>
          情報の信頼性は、私たちの生命線です。当サイトでは、以下の厳格なガイドラインを遵守しています。
        </p>
        <ul>
          <li><strong>一次情報の徹底：</strong> 運営者自らが実際に契約・使用・検証した実体験に基づかない情報は掲載しません。</li>
          <li><strong>ロジック優先：</strong> 感情的なお勧めではなく、還元率の計算、シミュレーション、規約の裏付けを優先します。</li>
          <li><strong>適時更新：</strong> 経済圏のルール変更（改悪・改善）が発生した際は、迅速に記事をアップデートし、常に「今使える」情報を維持します。</li>
        </ul>
      </section>

      <section id="tech-stack">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-purple-500 w-6 h-6" />
          <h2 className="m-0">4. 技術による情報の正確性</h2>
        </div>
        <p>
          当サイト「BIC-SAVING（技術の駅）」は、その名の通りエンジニアリングによって支えられています。
        </p>
        <p>
          VPSサーバー（Docker/Next.js/Django）を活用した自社開発のシステムにより、日々変動するキャンペーン情報やポイント還元率を効率的に集計しています。手動更新の限界を技術でカバーし、ユーザーが「記事を読んだ時には既に終わっていた」という失望を最小限に抑える仕組みを追求し続けています。
        </p>
      </section>

      <section id="transparency">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-orange-500 w-6 h-6" />
          <h2 className="m-0">5. 運営の透明性と信頼について</h2>
        </div>
        <p>
          BIC-SAVINGは、一部アフィリエイトプログラムによる収益によって運営されています。この収益は、検証用の機材購入、サーバー維持費、および情報の精度を高めるための取材・調査費用に還元されます。
        </p>
        <p>
          私たちは「信頼こそが最大の資産」であると考えます。収益のために不適切な金融商品やサービスを推奨することは、メディアとしての死を意味します。メリットだけでなく、デメリットや隠れたコストも明記することが、長期的に読者の皆様に支持される唯一の道であると確信しています。
        </p>
      </section>

      <section id="vision">
        <div className="flex items-center gap-2 mb-4">
          <HeartHandshake className="text-pink-500 w-6 h-6" />
          <h2 className="m-0">6. 2026年、これからの展望</h2>
        </div>
        <p>
          私たちは単なるブログに留まりません。今後は、個々の支出状況を入力することで最適なカードスタックを提案する「家計診断AI」の実装や、エンジニア同士が独自の節約スクリプトを共有できるコミュニティ機能の拡充を予定しています。
        </p>
        <p>
          技術は、私たちの生活を自由にするための道具です。BIC-SAVINGはこれからも、テクノロジーの最前線で、あなたの「守り」と「攻め」の家計戦略をサポートし続けます。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 */
export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-emerald-500 font-mono text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading System Identity...
        </div>
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}