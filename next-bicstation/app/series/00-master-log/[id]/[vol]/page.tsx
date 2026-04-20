/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Terminal, Database, Activity, Zap, 
  ChevronLeft, ChevronRight, LayoutGrid, ShieldCheck
} from 'lucide-react';

// 共通設定のインポート
import { GUIDE_STRUCTURE } from '../../data'; 

// --- 🛠️ Firestoreから記事を直接取得する関数（サーバーサイド） ---
async function getArticleFromDB(seriesId: string, vol: number) {
  // 注意: 本来は Firebase Admin SDK を使用するのが理想ですが、
  // フロントエンドと共有のFirebase Configで動かすためのfetch擬似ロジック、
  // または既存のDjango API経由での取得を想定します。
  // ここではFirestoreのREST APIを使用して、クライアントSDKなしで高速取得します。
  
  const projectId = "YOUR_FIREBASE_PROJECT_ID"; // FirebaseのプロジェクトID
  const appId = "next-bicstation";
  const path = `artifacts/${appId}/public/data/articles`;
  
  try {
    // Firestore REST APIを使用して、特定のseriesIdとvolに一致する文書を検索
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?mask.fieldPaths=content&mask.fieldPaths=title&mask.fieldPaths=seriesId&mask.fieldPaths=vol`,
      { next: { revalidate: 60 } } // 60秒キャッシュ
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    // クエリフィルタ（volとseriesIdが一致するものを探す）
    // ※ 簡易化のため全取得してフィルタしていますが、本来はStructuredQueryが望ましい
    const articleDoc = data.documents?.find((doc: any) => {
      const fields = doc.fields;
      return fields.seriesId?.stringValue === seriesId && parseInt(fields.vol?.integerValue) === vol;
    });

    if (!articleDoc) return null;

    const fields = articleDoc.fields;
    return {
      title: fields.title?.stringValue || "UNTITLED_LOG",
      content: fields.content?.stringValue || "NO_DATA_ARCHIVED",
      integrity: "VERIFIED_PASS",
      ai_enhanced: true
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export default async function MasterLogArticlePage({ 
  params 
}: { 
  params: { id: string; vol: string } 
}) {
  const { id, vol } = params;
  const volNum = parseInt(vol);
  
  const config = GUIDE_STRUCTURE[id];
  if (!config) notFound();

  const allEpisodes = config.phases?.flatMap((p: any) => p.episodes) || [];
  const currentEpisode = allEpisodes.find((e: any) => e.ep === volNum);
  if (!currentEpisode) notFound();

  // ✅ DBから本物のデータを取得（なければ仮データを表示せず、適切に処理）
  const article = await getArticleFromDB(id, volNum);
  
  // 色の動的割り当て（TailwindのJIT対策としてオブジェクトで管理）
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    cyan: 'text-cyan-500',
    purple: 'text-purple-500'
  };
  const activeColorClass = colorMap[config.color] || 'text-cyan-500';
  const activeBgClass = config.color === 'blue' ? 'bg-blue-950/20 border-blue-500/40' : 
                        config.color === 'emerald' ? 'bg-emerald-950/20 border-emerald-500/40' :
                        'bg-cyan-950/20 border-cyan-500/40';

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 selection:bg-blue-600 font-sans leading-relaxed">
      
      {/* --- 🛰️ 固定ステータスバー --- */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href={`/series/00-master-log/${id}`} className="hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Terminal size={18} className={activeColorClass} />
            <span className="text-white font-black uppercase italic tracking-tighter text-lg">
              {config.title}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-mono text-[10px] tracking-widest uppercase">
          <span className={`${activeColorClass} flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current`} />
            READING_STREAM
          </span>
          <div className="bg-zinc-900 px-3 py-1 border border-white/10 rounded text-zinc-300">
            VOL_{vol.padStart(2, '0')}
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 pt-32 pb-20 flex flex-col lg:flex-row gap-12">
        
        {/* --- 🗂️ 左サイド：アーカイブインデックス --- */}
        <aside className="hidden lg:block w-80 sticky top-32 h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-thin">
          <div className="mb-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             <Database size={12} /> Sequential Archive Nodes
          </div>
          
          <div className="flex flex-col gap-1">
            {allEpisodes.map((episode: any) => {
              const isActive = episode.ep === volNum;
              return (
                <Link
                  key={episode.ep}
                  href={`/series/00-master-log/${id}/${episode.ep}`}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isActive ? `${activeBgClass} text-white shadow-lg` : "border-transparent hover:bg-zinc-900/50 text-zinc-500"
                  }`}
                >
                  <span className={`font-mono text-[10px] mt-1 ${isActive ? activeColorClass : "text-zinc-700"}`}>
                    {episode.ep.toString().padStart(2, '0')}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-bold uppercase ${isActive ? "text-white" : "group-hover:text-zinc-200"}`}>
                       {episode.title} 
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* --- 🖋️ メインコンテンツ --- */}
        <main className="flex-1 max-w-3xl lg:ml-8">
          <header className="mb-12">
            <div className={`${activeColorClass} font-mono text-[10px] font-bold mb-4 tracking-[0.3em] uppercase opacity-80`}>
              — Node_Sequence: VOL_{vol.padStart(2, '0')}
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-white mb-8 italic uppercase leading-[0.95] tracking-tighter">
              {currentEpisode.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> 
                Integrity: <span className="text-zinc-300">{article?.integrity || 'PENDING'}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <Zap size={12} className="text-yellow-500" /> 
                AI_Enhanced: <span className="text-zinc-300">TRUE</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Activity size={12} className={activeColorClass} /> 
                Status: <span className="text-zinc-300 animate-pulse italic">Encrypted_Link_Active</span>
              </div>
            </div>
          </header>

          <article className="prose prose-invert prose-zinc max-w-none 
            prose-headings:italic prose-headings:font-black prose-headings:uppercase 
            prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-[1.9] 
            prose-strong:text-white prose-code:text-cyan-400 prose-a:text-cyan-500">
            {article ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            ) : (
              <div className="py-20 flex flex-col items-center gap-4 border border-dashed border-zinc-800 rounded-3xl">
                <div className="animate-spin"><Database className="text-zinc-700" size={40} /></div>
                <p className="font-mono text-xs text-zinc-600 tracking-widest">AWAITING_DATA_STREAM...</p>
              </div>
            )}
          </article>

          {/* --- 📑 ナビゲーション --- */}
          <footer className="mt-24 pt-8 border-t border-zinc-900 flex justify-between items-center font-mono text-[10px]">
             <Link 
              href={`/series/00-master-log/${id}/${volNum - 1}`}
              className={`flex items-center gap-2 ${volNum <= 1 ? 'pointer-events-none opacity-10' : 'hover:text-white text-zinc-600'}`}
             >
               <ChevronLeft size={14} /> PREV_LOG_NODE
             </Link>

             <Link 
              href="/series/00-master-log" 
              className="text-zinc-500 hover:text-white flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5"
             >
                <LayoutGrid size={14} /> MASTER_INDEX
             </Link>

             <Link 
              href={`/series/00-master-log/${id}/${volNum + 1}`}
              className={`flex items-center gap-2 ${volNum >= allEpisodes.length ? 'pointer-events-none opacity-10' : 'hover:text-white text-zinc-600'}`}
             >
               NEXT_LOG_NODE <ChevronRight size={14} />
             </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}