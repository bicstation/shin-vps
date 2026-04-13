import { ReactNode } from 'react'

export default function RebuildLogsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <article className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* 共通のヘッダー：シリーズ名を表示 */}
        <header className="bg-slate-800 text-white p-6">
          <p className="text-slate-300 text-xs font-mono mb-1">PROJECT: Bic-Saving / Rebuild Logs</p>
          <h1 className="text-xl font-bold">Googleにすべてを奪われた男の「再構築」ログ</h1>
        </header>

        {/* 記事の本文（各 vol-n/page.tsx の中身が入る） */}
        <div className="p-8 md:p-12 prose prose-slate max-w-none">
          {children}
        </div>

        {/* 共通のフッター：目次へのリンクなど */}
        <footer className="bg-gray-50 border-t p-6 text-center">
          <a href="/series/rebuild-logs" className="text-blue-600 hover:underline text-sm">
            ← 連載目次一覧へ戻る
          </a>
        </footer>
      </article>
    </div>
  )
}