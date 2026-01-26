import React from 'react';

interface StaticPageLayoutProps {
  title: string;
  description: string;
  lastUpdated: string;
  toc: { id: string; text: string }[];
  children: React.ReactNode;
}

export default function StaticPageLayout({ title, description, lastUpdated, toc, children }: StaticPageLayoutProps) {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* ヒーローセクション - 背景に少しグラデーションを付与 */}
      <header className="bg-white border-b border-slate-200 pt-20 pb-16 mb-12 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
            {description}
          </p>
          <div className="mt-8 flex items-center text-sm font-bold text-blue-600">
            <span className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              最終更新日: {lastUpdated}
            </span>
          </div>
        </div>
      </header>

      {/* コンテンツエリア - 幅を max-w-6xl に拡大 */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* サイドバー（目次） */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <nav className="sticky top-24 p-8 bg-white rounded-3xl shadow-md border border-slate-200">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-blue-600" />
              TABLE OF CONTENTS
            </h2>
            <ul className="space-y-4">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-slate-600 hover:text-blue-600 text-[15px] font-semibold transition-all duration-200 block hover:translate-x-1">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ - 見出しのデザインを大幅強化 */}
        <main className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-lg border border-slate-200 prose prose-slate max-w-none 
            prose-h2:text-3xl prose-h2:font-black prose-h2:text-slate-900 prose-h2:bg-slate-50 prose-h2:p-6 prose-h2:rounded-xl prose-h2:border-l-[8px] prose-h2:border-blue-600 prose-h2:mt-16 prose-h2:mb-10
            prose-h3:text-2xl prose-h3:font-bold prose-h3:text-slate-800 prose-h3:mt-12 prose-h3:mb-6
            prose-p:text-lg prose-p:text-slate-600 prose-p:leading-[2] prose-p:mb-10
            prose-li:text-lg prose-li:text-slate-600 prose-li:leading-relaxed">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}