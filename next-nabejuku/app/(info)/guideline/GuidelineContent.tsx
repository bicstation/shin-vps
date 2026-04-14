"use client";

/**
 * 🛰️ BIC-SAVING: Editorial Guideline (Client Component)
 */

export const dynamic = "force-dynamic";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    CheckCircle2, 
    AlertTriangle, 
    Database, 
    Scale, 
    FileText, 
    RefreshCcw 
} from 'lucide-react';
import StaticPageLayout from '@shared/components/templates/StaticPageLayout';

export default function GuidelinePageContent() {
  const searchParams = useSearchParams();

  const toc = [
    { id: 'principle', text: '基本理念：三方良しの家計戦略' },
    { id: 'accuracy', text: '情報の正確性と一次情報の徹底' },
    { id: 'fairness', text: '公平性と客観性の担保' },
    { id: 'update', text: '情報の鮮度と更新ルール' },
    { id: 'compliance', text: '法令遵守と広告表記について' },
  ];

  return (
    <StaticPageLayout 
      title="Editorial Guideline"
      description="BIC-SAVINGが提供するすべてのコンテンツは、以下の厳格なガイドラインに基づいて制作されています。"
      lastUpdated="2026年4月14日"
      toc={toc}
    >
      <section id="principle">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-emerald-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">1. 基本理念：三方良しの家計戦略</h2>
        </div>
        <p className="leading-relaxed mb-4">
          私たちのコンテンツ制作の根幹には、<strong>「読者の利益」「正確なデータ」「誠実な運営」</strong>の三位一体があります。
        </p>
        <p className="leading-relaxed">
          家計の最適化（節約）は、単なる情報の消費ではなく、読者の皆様の「資産」に直結する重要な意思決定です。私たちは、読者が迷うことなく最適な選択（デバッグ）を行えるよう、論理的かつ実用的なガイドを提供することを約束します。
        </p>
      </section>

      <section id="accuracy" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-blue-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">2. 情報の正確性と一次情報の徹底</h2>
        </div>
        <p className="leading-relaxed mb-4">
          「情報のソース」こそが信頼の証です。BIC-SAVINGでは以下の基準を設けています。
        </p>
        <ul className="space-y-3 list-none p-0">
          <li className="flex gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-500 font-bold">✔</span>
            <span><strong>実体験の必須：</strong> 記事内で紹介する決済ルートやカード構成、サービスは、運営者が実際に契約・決済・運用し、検証した結果のみを記述します。</span>
          </li>
          <li className="flex gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-500 font-bold">✔</span>
            <span><strong>公式規約の裏付け：</strong> キャンペーンやポイント還元率は、必ず公式サイトの規約（PDF等）を読み解き、例外事項や罠についても明記します。</span>
          </li>
        </ul>
      </section>

      <section id="fairness" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="text-purple-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">3. 公平性と客観性の担保</h2>
        </div>
        <p className="leading-relaxed mb-4">
          特定の企業やサービスを不当に優遇、または貶めることはいたしません。
        </p>
        <p className="leading-relaxed">
          メリットを強調する際は、必ず同じ熱量で「デメリット」や「向かない人の特徴」を記載します。また、還元率の比較を行う際は、計算式を透明化し、誰でも同じ計算結果に辿り着けるよう配慮します。
        </p>
      </section>

      <section id="update" className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCcw className="text-emerald-400 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">4. 情報の鮮度と更新ルール</h2>
        </div>
        <p className="leading-relaxed mb-4">
          節約やポイント制度の世界は「改悪・改善」のスピードが極めて速いのが特徴です。
        </p>
        <p className="leading-relaxed">
          当サイトでは、主要な経済圏のアップデート情報を監視し、重大な変更があった記事には速やかに「追記」または「修正」を加え、冒頭に最終更新日を明記します。過去の情報が読者に誤解を与えないよう、メンテナンスを継続します。
        </p>
      </section>

      <section id="compliance" className="mt-12 border-t border-slate-800 pt-12">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-500 w-6 h-6" />
          <h2 className="m-0 text-2xl font-bold">5. 法令遵守と広告表記について</h2>
        </div>
        <div className="space-y-4">
          <p className="leading-relaxed">
            BIC-SAVINGは、景品表示法（ステマ規制）をはじめとする各種法令を遵守します。
          </p>
          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl">
            <h4 className="text-orange-500 font-bold mb-2 flex items-center gap-2">
              <FileText size={18} /> 広告の明記
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              アフィリエイトプログラム等の収益が発生するリンクを含む記事には、読者が容易に認識できる位置（記事冒頭など）に「PR」または「本ページには広告が含まれています」といった旨を明記します。広告収益の有無によって情報の歪曲を行うことは一切ありません。
            </p>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
}