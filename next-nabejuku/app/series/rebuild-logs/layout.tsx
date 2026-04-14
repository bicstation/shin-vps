import { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react' // ✅ これが必要でした

export default function RebuildLogsLayout({ children }: { children: ReactNode }) {
  return (
    /* 背景をメインサイトに合わせたダークトーンに設定 */
    <div className="min-h-screen bg-[#0a0c10] py-6 md:py-12 px-0 md:px-4">
      
      {/* 💡 修正ポイント: 
         - max-w-3xl (狭い) から max-w-6xl (広い) へ変更し、全幅感を出しました。
         - shadow-emerald-500/10 で、うっすらとエメラルドの光彩を放つ高級感を演出。
      */}
      <article className="max-w-6xl mx-auto bg-white shadow-2xl shadow-emerald-500/10 border border-gray-800/50 rounded-none md:rounded-3xl overflow-hidden">
        
        {/* 共通のヘッダー：グラデーションとエメラルドのアクセント */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-12 border-b border-emerald-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">ARCHIVE</span>
              <p className="text-emerald-400 text-xs font-mono">PROJECT: Bic-Saving / Rebuild Logs</p>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Googleにすべてを奪われた男の<br className="md:hidden" />
              <span className="text-emerald-400">「再構築」</span>ログ
            </h1>
          </div>
          
          {/* 背景に薄くアイコンを配置（デザインアクセント） */}
          <RefreshCw className="absolute -right-8 -top-8 w-48 h-48 text-white/5 rotate-12" />
        </header>

        {/* 記事の本文：タイポグラフィの最適化 */}
        <div className="p-6 md:p-16 prose prose-slate prose-lg max-w-none 
          prose-headings:text-slate-900 prose-headings:font-bold
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-a:text-emerald-600 prose-strong:text-slate-900">
          {children}
        </div>

        {/* 共通のフッター */}
        <footer className="bg-slate-50 border-t border-gray-100 p-8 text-center">
          <a 
            href="/series/rebuild-logs" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors text-sm"
          >
            <span className="text-lg">←</span> 連載目次一覧へ戻る
          </a>
        </footer>
      </article>
    </div>
  )
}