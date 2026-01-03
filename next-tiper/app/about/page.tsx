/* eslint-disable react/no-unescaped-entities */
import React from 'react';

// 静的ページのメタデータ
export const metadata = {
    title: '静的情報 | Tiper Live',
    description: 'このサイトに関する情報が記載されています。',
};

// 静的ページ（例: About Us）
export default function StaticPage() {
  return (
    <div className="min-h-screen py-16 px-[5%] md:px-[10%]">
      {/* メインカードコンテナ */}
      <div className="max-w-4xl mx-auto bg-[#16162d]/50 p-8 md:p-12 rounded-2xl border border-gray-800/50 shadow-2xl backdrop-blur-sm">

        {/* 1. ページタイトル (globals.css の static-title を想定) */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#99e0ff] border-b-2 border-[#3d3d66] pb-4 mb-10 tracking-wider flex items-center gap-4">
          会社概要
          <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">STATIC_PAGE_V2</span>
        </h1>

        {/* 2. コンテンツエリア */}
        <div className="text-gray-300 leading-relaxed text-base md:text-lg space-y-10">
          
          <section>
            <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-[#e94560]">
              このページは、Next.jsのルーティングにおける静的ページ（1カラム）の表示をテストするためのエリアです。
              <code className="bg-black/40 text-[#00d1b2] px-2 py-0.5 rounded mx-1 font-mono text-sm">/static</code>
              のルート直下に <code className="bg-black/40 text-[#00d1b2] px-2 py-0.5 rounded font-mono text-sm">page.tsx</code> を配置することで、全幅のレイアウトが適用されます。
            </p>
          </section>
          
          {/* ミッションセクション */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-[#e94560] mb-4 flex items-center gap-2 border-b border-[#3d3d66] pb-2">
              <span className="w-2 h-6 bg-[#e94560] rounded-full"></span>
              ミッション
            </h2>
            <p className="pl-4 border-l-2 border-gray-800">
              Tiper Liveは、最先端のデータとテクノロジーを駆使し、ユーザーに価値ある情報と体験を提供することを目指しています。
              正確で信頼性の高い情報を、誰でもアクセスしやすい形で提供します。
            </p>
          </section>

          {/* 技術スタックセクション */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-[#e94560] mb-6 flex items-center gap-2 border-b border-[#3d3d66] pb-2">
              <span className="w-2 h-6 bg-[#e94560] rounded-full"></span>
              技術スタック
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'フロントエンド', value: 'Next.js (App Router)' },
                { label: 'バックエンド/API', value: 'Django (Docker)' },
                { label: 'データベース', value: 'PostgreSQL' },
                { label: 'プロキシ', value: 'Traefik / Nginx' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col p-4 bg-black/30 rounded-lg border border-gray-800 hover:border-[#e94560]/50 transition-colors">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}