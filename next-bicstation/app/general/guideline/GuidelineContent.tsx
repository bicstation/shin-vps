"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

// 💡 Next.jsの静的解析を強制バイパス
export const dynamic = "force-dynamic";

/**
 * 💡 ページのメインコンテンツ実体
 */
function GuidelinePageContentInner() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'quality', text: '情報の品質維持と正確性の担保' },
    { id: 'ai-human-collab', text: 'AIと人間によるハイブリッド編集' },
    { id: 'review-standard', text: '多角的な評価スコアリング基準' },
    { id: 'update-cycle', text: '情報の鮮度とメンテナンス' },
    { id: 'neutrality', text: '中立性の保持と利益相反の排除' },
    { id: 'feedback', text: '誠実な訂正・改善対応' },
  ];

  return (
    <StaticPageLayout 
      title="Editorial Guideline"
      description="BICSTATIONが、読者の皆様に「信頼できるデータ」を届けるために遵守している編集・制作基準を公開します。"
      lastUpdated="2026年4月12日"
      toc={toc}
    >
      {/* リード文 */}
      <div className="border-l-4 border-slate-800 pl-6 my-10">
        <p className="text-slate-700 text-lg leading-relaxed italic">
          「溢れる情報の中から、真実のスペックを切り出す。」<br />
          BICSTATIONは、客観的データに基づく公正なガジェット評価を通じて、ユーザーの最適な選択を支援します。
        </p>
      </div>

      <section id="quality">
        <h2>1. 情報の品質維持と正確性の担保</h2>
        <p>
          私たちは、メーカーのホワイトペーパー、技術仕様書、および各通信規格（USB4, PCIe 5.0等）の公式策定資料を一次ソースとしています。曖昧な表現やマーケティング用語を排し、技術的根拠に基づいた正確な情報の提供を徹底します。
        </p>
      </section>

      <section id="ai-human-collab">
        <h2>2. AIと人間によるハイブリッド編集</h2>
        <p>
          BICSTATIONでは、膨大な製品データの収集と初期解析にAI技術（Gemini等）を導入しています。
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
          <ul className="list-none p-0 m-0 space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <span className="text-blue-600 font-bold">●</span>
              <span><strong>AIの役割:</strong> 複数ソースからのスペック抽出、定量的データの正規化、初期レビュー草案の作成。</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <span className="text-blue-600 font-bold">●</span>
              <span><strong>人間の役割:</strong> 評価基準の策定、AI生成内容のファクトチェック、文脈の微調整、および最終的な公開判断。</span>
            </li>
          </ul>
        </div>
      </section>

      <section id="review-standard">
        <h2>3. 多角的な評価スコアリング基準</h2>
        <p>
          製品評価は、単なる印象論ではなく、以下の4つの柱に基づいた独自のアルゴリズムによって数値化されています。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="p-4 border border-slate-200 rounded-xl">
            <h4 className="font-bold m-0 text-slate-800">🚀 パフォーマンス</h4>
            <p className="text-xs text-slate-500 mb-0">ベンチマーク実測値および理論上の最大処理能力</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <h4 className="font-bold m-0 text-slate-800">💎 品質・信頼性</h4>
            <p className="text-xs text-slate-500 mb-0">冷却設計、使用コンポーネント、メーカー保証期間</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <h4 className="font-bold m-0 text-slate-800">⚖️ コストパフォーマンス</h4>
            <p className="text-xs text-slate-500 mb-0">API経由で取得した市場価格と性能の相対比較</p>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <h4 className="font-bold m-0 text-slate-800">🧩 ユーザビリティ</h4>
            <p className="text-xs text-slate-500 mb-0">拡張性、設定の容易さ、ソフトウェアの安定性</p>
          </div>
        </div>
      </section>

      <section id="update-cycle">
        <h2>4. 情報の鮮度とメンテナンス</h2>
        <p>
          ガジェット情報の価値は「鮮度」に直結します。新モデルの登場や型落ちによる市場環境の変化をシステムで常時監視し、必要な場合は既存記事へ「最新の代替案」を追記します。APIによる自動価格更新と、人力による情報の再検証を組み合わせ、常に「今使える情報」の維持に努めます。
        </p>
      </section>

      <section id="neutrality">
        <h2>5. 中立性の保持と利益相反の排除</h2>
        <p>
          特定のメーカーからの金銭授受による評価の操作は一切行いません。貸出機によるレビューや広告掲載を行う場合も、編集権の独立を維持し、欠点（デメリット）を含めた率直な情報発信を条件としています。
        </p>
      </section>

      <section id="feedback">
        <h2>6. 誠実な訂正・改善対応</h2>
        <p>
          万が一、掲載内容に誤りがあった場合、または読者の皆様より情報の不一致をご指摘いただいた場合は、速やかに再調査を実施します。事実誤認が確認された場合は、24時間以内に修正を行い、更新履歴を透明性の高い形で管理します。
        </p>
      </section>
    </StaticPageLayout>
  );
}

/**
 * ✅ ページエントリポイント
 */
export default function GuidelinePageContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <span className="text-xs ml-2 tracking-widest">LOADING EDITORIAL CORE</span>
        </div>
      </div>
    }>
      <GuidelinePageContentInner />
    </Suspense>
  );
}