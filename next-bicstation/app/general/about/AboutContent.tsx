"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

// 💡 Next.jsの静的解析を強制バイパス
export const dynamic = "force-dynamic";

/**
 * 💡 ページのメインコンテンツ部分
 */
function AboutPageContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'mission', text: 'BICSTATIONのミッション' },
    { id: 'origin', text: '設立の背景：ガジェット選びの「迷路」' },
    { id: 'how-we-work', text: 'AIとデータが導く、新しい評価基準' },
    { id: 'editorial-policy', text: '編集・レビューの3原則' },
    { id: 'transparency', text: '情報の透明性と信頼性' },
    { id: 'future', text: '進化し続ける「技術の駅」として' },
  ];

  return (
    <StaticPageLayout 
      title="About BICSTATION"
      description="私たちは、膨大なデータとAI技術を駆使し、あなたの「納得感のあるガジェット選び」を加速させるテックメディアです。"
      lastUpdated="2026年4月12日"
      toc={toc}
    >
      {/* ヒーローメッセージ的な強調 */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white mb-12 shadow-xl">
        <h2 className="text-white mt-0 text-2xl font-bold">技術の力で、情報の迷路に光を。</h2>
        <p className="text-slate-300 text-base leading-relaxed mb-0">
          「どれを選べば正解なのか？」<br />
          複雑化し続けるPCパーツやデバイスのスペック、そして秒単位で動く市場価格。
          BICSTATIONは、最新のAI解析とシステム連携により、その答えを最短距離で導き出します。
        </p>
      </div>

      <section id="mission">
        <h2>1. BICSTATIONのミッション</h2>
        <p>
          「膨大なスペック表の中から、ユーザーにとっての『真の価値』を可視化すること。」これが私たちの使命です。
        </p>
        <p>
          現代のガジェット市場は、同じ製品名でも中身が異なる「マイナーチェンジ」や、地域限定モデルなど、情報の非対称性が強まっています。私たちは、これら複雑な情報を構造化し、誰もが後悔のない選択を行えるプラットフォームを提供し続けます。
        </p>
      </section>

      <section id="origin">
        <h2>2. 設立の背景：ガジェット選びの「迷路」</h2>
        <p>
          BICSTATIONは、運営者自身の苦い経験から生まれました。何時間もかけて選んだパーツが、実は最新の環境では最適ではなかったり、購入直後に大幅なセールが始まったりといった経験です。
        </p>
        <p>
          インターネットには情報が溢れていますが、その多くは断片的であり、過去の情報が放置されています。<strong>「今、この瞬間に最適な選択はどれか？」</strong>という問いに、リアルタイムなデータと公平な視点で答える場所が必要だと確信し、本サイトを立ち上げました。
        </p>
      </section>

      <section id="how-we-work">
        <h2>3. AIとデータが導く、新しい評価基準</h2>
        <p>
          BICSTATION（技術の駅）という名には、技術によって情報を整理し、ユーザーを次の目的地へ送り出すという意味を込めています。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mt-0">📈 リアルタイムAPI連携</h4>
            <p className="text-sm text-slate-600 mb-0">Amazon、楽天、Yahoo!等の各モールと連携し、価格や在庫状況を自動反映。情報の「鮮度」をシステムで担保しています。</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mt-0">🤖 高度なAIスペック解析</h4>
            <p className="text-sm text-slate-600 mb-0">Gemini等の大規模言語モデルを活用し、製品スペックを多角的にスコアリング。主観に頼りすぎない、客観的な評価を実現しています。</p>
          </div>
        </div>
      </section>

      <section id="editorial-policy">
        <h2>4. 編集・レビューの3原則</h2>
        <ul>
          <li><strong>データ・ドリブン：</strong> ベンチマークや実測スペックを最優先し、数値に基づいた評価を行います。</li>
          <li><strong>公平な比較：</strong> 高価なフラッグシップ機だけでなく、予算に応じた「価格相応の価値（Value for Money）」を徹底的に追求します。</li>
          <li><strong>誠実な情報提供：</strong> 良い点だけでなく、欠点や注意すべき仕様についても隠さず明記します。</li>
        </ul>
      </section>

      <section id="transparency">
        <h2>5. 情報の透明性と信頼性</h2>
        <p>
          BICSTATIONは、アフィリエイト広告による収益によって支えられています。しかし、<strong>紹介料の高さで評価や順位を操作することは、私たちの信念に反します。</strong>
        </p>
        <p>
          一度でも不適切な推奨を行えば、ユーザーの信頼は失われ、メディアとしての価値は消滅します。長期的な信頼関係こそが最大の資産であると考え、常にフラットな視点での発信を徹底しています。
        </p>
      </section>

      <section id="future">
        <h2>6. 進化し続ける「技術の駅」として</h2>
        <p>
          私たちは単なるレビューサイトに留まりません。今後は、個々のユーザーのPC環境をAIが診断し、最適なアップグレードパスを提案する機能など、よりパーソナライズされた体験の提供を目指しています。
        </p>
        <p>
          ガジェットは生活を拡張するツールです。そのツール選びを、もっとワクワクする、確実な体験に。BICSTATIONは、進化し続けるテクノロジーの最前線で、あなたの選択をサポートし続けます。
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
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono">
        <div className="animate-pulse text-sm">LOADING BICSTATION CORE...</div>
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}