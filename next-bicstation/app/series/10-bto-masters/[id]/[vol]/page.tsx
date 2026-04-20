"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useRouter } from 'next/navigation';
import { 
  Terminal, Cpu, AlertCircle, Loader2, 
  ChevronLeft, ChevronRight, Binary, 
  ShieldCheck, Zap, HardDrive, Layout
} from 'lucide-react';

// --- BTO Series Config (内包または外部参照) ---
const BTO_SERIES_CONFIG: Record<string, { title: string; description: string }> = {
  "bto-masters-v3": {
    title: "BTO MASTERS V3",
    description: "44年の知見を凝縮した究極の自作・BTO攻略アーカイブ"
  }
};

const PHASE_SETTINGS = [
  { range: [1, 10], label: "ENTRY PHASE", sub: "基礎構築・選定の極意", color: "text-emerald-500" },
  { range: [11, 20], label: "MIDDLE PHASE", sub: "構成最適化・バランス", color: "text-blue-500" },
  { range: [21, 30], label: "HIGH-END PHASE", sub: "極限性能・冷却理論", color: "text-purple-500" },
  { range: [31, 40], label: "ULTIMATE PHASE", sub: "未来展望・次世代アーキテクチャ", color: "text-red-500" }
];

// --- Firebase Initialization ---
const firebaseConfig = typeof window !== 'undefined' && (window as any).__firebase_config 
  ? JSON.parse((window as any).__firebase_config) 
  : { apiKey: "dummy", authDomain: "dummy", projectId: "dummy" };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';

export default function DynamicBtoEngine() {
  const params = useParams();
  const router = useRouter();
  
  const seriesId = (params?.id as string) || "bto-masters-v3";
  const volNum = parseInt(params?.vol as string) || 1;
  const seriesConfig = BTO_SERIES_CONFIG[seriesId];

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Auth logic (Rule 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = (window as any).__initial_auth_token;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Data Fetching (Rule 1 & 2) ---
  useEffect(() => {
    if (!user || !seriesConfig) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Path Rule: /artifacts/{appId}/public/data/{collectionName}
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'articles', `${seriesId}_vol_${volNum}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle(docSnap.data());
        } else {
          setError("ARTICLE_NOT_FOUND_IN_ARCHIVE");
        }
      } catch (e: any) {
        console.error("Fetch error:", e);
        setError("CONNECTION_FAILED");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [volNum, user, seriesId, seriesConfig]);

  const currentPhase = useMemo(() => 
    PHASE_SETTINGS.find(p => volNum >= p.range[0] && volNum <= p.range[1]) || PHASE_SETTINGS[0]
  , [volNum]);

  const navigateTo = (newVol: number) => {
    if (newVol < 1 || newVol > 40) return;
    router.push(`/series/${seriesId}/${newVol}`);
  };

  if (error || !seriesConfig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] font-mono text-red-500 p-6">
        <AlertCircle size={48} className="mb-4 animate-pulse" />
        <h2 className="text-xl font-bold mb-2">SYSTEM ERROR: {error}</h2>
        <p className="text-zinc-500 text-sm mb-8">指定されたデータの断片がアーカイブに見つかりません。</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 border border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          RETURN_TO_BASE
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 selection:bg-blue-600 font-sans">
      {/* グローバル・ナビゲーション */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-black uppercase italic tracking-tighter leading-none">
              {seriesConfig.title}
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">
              VOL.{volNum.toString().padStart(3, '0')} / ARCHIVE_ACTIVE
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-[10px]">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-zinc-500 uppercase">Current Phase</span>
            <span className={currentPhase.color}>{currentPhase.label}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <div className="text-zinc-500">
            SECURED BY <ShieldCheck size={12} className="inline ml-1 text-blue-500" />
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-20 flex flex-col lg:flex-row gap-12">
        
        {/* サイド・マトリックス (Navigation Grid) */}
        <aside className="lg:w-80 space-y-8">
          <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-white text-xs font-bold font-mono">
              <Layout size={14} className="text-blue-500" />
              NAV_MATRIX
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 40 }, (_, i) => i + 1).map(v => (
                <button 
                  key={v} 
                  onClick={() => navigateTo(v)}
                  className={`
                    h-10 text-[10px] font-mono border rounded flex items-center justify-center transition-all
                    ${v === volNum 
                      ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110 z-10" 
                      : "border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 text-zinc-600 hover:text-zinc-300"}
                  `}
                >
                  {v.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 p-6 rounded-2xl">
            <h4 className={`text-xs font-bold font-mono mb-1 ${currentPhase.color}`}>
              {currentPhase.label}
            </h4>
            <p className="text-zinc-300 text-sm font-bold mb-3">{currentPhase.sub}</p>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${(volNum / 40) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono italic">COMPLETE_RATE: {Math.round((volNum/40)*100)}%</p>
          </div>
        </aside>

        {/* メイン・コンテンツ・エリア */}
        <main className="flex-1 max-w-4xl">
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-600 font-mono">
              <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
              <div className="animate-pulse">DECRYPTING_ARCHIVE...</div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 記事ヘッダー */}
              <div className="mb-12">
                <div className="flex items-center gap-2 text-blue-500 font-mono text-xs mb-4">
                  <Binary size={14} />
                  <span>DATA_FRAGMENT_VOL_{volNum}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 italic uppercase leading-tight tracking-tighter">
                  {article?.title || "NO_TITLE_ASSIGNED"}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {article?.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-zinc-900 text-zinc-500 text-[10px] font-mono border border-white/5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 記事本文 */}
              <article className="prose prose-invert prose-blue max-w-none 
                prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-[1.8]
                prose-strong:text-blue-400 prose-strong:font-bold
                prose-blockquote:bg-blue-600/5 prose-blockquote:border-blue-600 prose-blockquote:p-8 prose-blockquote:rounded-2xl prose-blockquote:not-italic
                prose-code:text-blue-300 prose-code:bg-blue-900/30 prose-code:px-1 prose-code:rounded
                prose-img:rounded-3xl prose-img:border prose-img:border-white/10 shadow-2xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article?.content || "No content found."}
                </ReactMarkdown>
              </article>

              {/* ナビゲーション・フッター */}
              <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-sm">
                <button 
                  onClick={() => navigateTo(volNum - 1)} 
                  disabled={volNum <= 1}
                  className="flex items-center gap-4 group disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronLeft size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-600">PREVIOUS_FRAGMENT</div>
                    <div className="font-bold">VOL.{(volNum - 1).toString().padStart(2, '0')}</div>
                  </div>
                </button>

                <div className="text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-black italic">
                  BicStation Neural Network
                </div>

                <button 
                  onClick={() => navigateTo(volNum + 1)} 
                  disabled={volNum >= 40}
                  className="flex items-center gap-4 group text-right disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-600">NEXT_FRAGMENT</div>
                    <div className="font-bold">VOL.{(volNum + 1).toString().padStart(2, '0')}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </button>
              </footer>
            </div>
          )}
        </main>
      </div>

      {/* 装飾用背景要素 */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent opacity-20" />
      <div className="fixed top-0 left-1/4 w-[1px] h-full bg-white/5 pointer-events-none" />
      <div className="fixed top-0 left-3/4 w-[1px] h-full bg-white/5 pointer-events-none" />
    </div>
  );
}