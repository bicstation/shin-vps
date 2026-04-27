"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useRouter } from 'next/navigation';
// ✅ Series 20専用のConfig
import { BTO_FORTRESS_CONFIG } from '../../data'; 
import { 
  Terminal, Cpu, AlertCircle, 
  Database, Activity, Zap, ChevronLeft, ChevronRight,
  ShieldCheck, Lock, Landmark, RefreshCcw, FileText
} from 'lucide-react';
import Link from 'next/link';

// --- Firebase Initialization (Rule 1 & 3 Compliance) ---
const firebaseConfig = typeof window !== 'undefined' && (window as any).__firebase_config 
  ? JSON.parse((window as any).__firebase_config) 
  : { apiKey: "dummy", authDomain: "dummy", projectId: "dummy" };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';

export default function BtoFortressEngine() {
  const params = useParams();
  const router = useRouter();
  
  const id = (params?.id as string) || "bto-fortress-v3";
  const vol = params?.vol as string;
  const volNum = parseInt(vol) || 1;
  const config = BTO_FORTRESS_CONFIG[id];

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing Fortress System...");

  // 記事のデザインクラス
  const articleClasses = `
    prose prose-invert prose-blue max-w-none
    prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
    prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-[1.9] 
    prose-strong:text-emerald-400 prose-strong:font-bold
    prose-blockquote:bg-emerald-900/10 prose-blockquote:border-emerald-600 prose-blockquote:p-10 prose-blockquote:rounded-3xl prose-blockquote:not-italic
    prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5
  `;

  // 1. Firebase Auth (Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = (window as any).__initial_auth_token;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err: any) {
        setError(`AUTH_FAILED: ${err.message}`);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching (Rule 1 & 2)
  useEffect(() => {
    if (!user || !config) return;
    
    const fetchData = async () => {
      setLoading(true);
      setStatusMsg("Connecting to Secure Archive...");
      try {
        // Path Rule: /artifacts/{appId}/public/data/{collectionName}
        const docPath = `${id}_vol_${volNum}`;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'articles', docPath);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle(docSnap.data());
          setError(null);
          setStatusMsg("Status: SECURE_ENCRYPTED");
        } else {
          // Placeholder for Missing Content (AI Guidance)
          setArticle({
            title: `FRAGMENT_MISSING: ${id.toUpperCase()}_VOL_${volNum}`,
            content: `
### ⚠️ 内部プロトコル：データ断片の欠落

法人・公共セクション ${volNum} の詳細は現在、アーカイブ・バッファに存在しません。

**【AI再構築の提案】**
BICSTATIONの44年にわたる技術調達・運用知見に基づき、このエピソードを生成しますか？
法人基準（長期保守、安定稼働、コンプライアンス）に最適化されたロジックを展開可能です。

> ※この操作には、Gemini-2.0-Flash-Exp へのプロンプト送信が必要です。
            `
          });
          setStatusMsg("Status: RECONSTRUCTION_REQUIRED");
        }
      } catch (e: any) {
        console.error(e);
        setError(`DATABASE_ACCESS_DENIED: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, volNum, user, config]);

  const navigateTo = (v: number) => {
    if (v < 1 || v > 30) return;
    router.push(`/series/20-bto-fortress/${id}/${v}`);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-mono text-red-500">
        <AlertCircle className="mr-2 animate-bounce" /> INVALID_FORTRESS_NODE
      </div>
    );
  }

  return (
    <div className="bg-[#040404] min-h-screen text-zinc-400 selection:bg-emerald-600/30">
      
      {/* --- FORTRESS TOP BAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/5 px-8 py-5 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-6">
          <Link href={`/series/20-bto-fortress/${id}`} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-1.5 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Landmark size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black uppercase italic tracking-tighter leading-none text-xl">
                {config.title.split('：')[0]}
              </span>
              <span className="text-[9px] font-mono text-zinc-600 tracking-[0.2em] mt-1">GOVERNMENT & ENTERPRISE SOLUTION</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex flex-col items-end">
            <span className="text-zinc-600">Encryption</span>
            <span className="text-white">AES-256_ACTIVE</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-zinc-600">Access_Status</span>
            <span className="text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {statusMsg}
            </span>
          </div>
          <div className="bg-zinc-900 px-4 py-2 border border-white/10 rounded-lg text-white font-bold">
            NODE_0{volNum}
          </div>
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-8 pt-36 flex gap-16">
        
        {/* --- LEFT NAVIGATION: ARCHIVE NODES --- */}
        <aside className="hidden xl:block w-72 sticky top-36 h-[calc(100vh-160px)]">
          <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 text-zinc-200 text-xs font-bold font-mono">
              <Lock size={14} className="text-emerald-500" />
              SECURE_INDEX
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(v => (
                <button 
                  key={v} 
                  onClick={() => navigateTo(v)}
                  className={`h-11 text-[11px] font-mono border rounded-lg transition-all duration-300 ${
                    v === volNum 
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 z-10" 
                    : "border-white/5 bg-black/40 hover:border-emerald-500/50 hover:text-white text-zinc-600"
                  }`}
                >
                  {v.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-zinc-500">
                <ShieldCheck size={16} className="text-emerald-900" />
                <span className="text-[10px] font-mono">STABILITY_CHECK: OK</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <FileText size={16} className="text-emerald-900" />
                <span className="text-[10px] font-mono">COMPLIANCE: VERIFIED</span>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT: THE FORTRESS CORE --- */}
        <main className="flex-1 max-w-3xl pb-40">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Landmark size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" />
              </div>
              <span className="font-mono text-sm tracking-[0.4em] text-zinc-600">DECRYPTING_PROTOCOL...</span>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 font-mono text-[10px] mb-8">
                  <Activity size={12} />
                  PROTOCOL_LEVEL: ENTERPRISE_GRADE
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-white mb-10 italic uppercase leading-[0.85] tracking-tighter">
                  {article?.title || "UNTITLED_FRAGMENT"}
                </h1>

                <div className="flex gap-4 font-mono text-[11px]">
                  <div className="px-4 py-2 bg-zinc-900/50 rounded border border-white/5 flex items-center gap-2">
                    <span className="text-zinc-600">VER:</span> <span className="text-emerald-500">3.0.4-LTS</span>
                  </div>
                  <div className="px-4 py-2 bg-zinc-900/50 rounded border border-white/5 flex items-center gap-2">
                    <span className="text-zinc-600">LOAD:</span> <span className="text-yellow-500">OPTIMAL</span>
                  </div>
                </div>
              </div>

              {/* 記事本文 */}
              <article className={articleClasses}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article?.content || ""}
                </ReactMarkdown>
              </article>

              {/* フッター：要塞間移動 */}
              <footer className="mt-32 pt-16 border-t border-white/5">
                <div className="flex justify-between items-center mb-12">
                  <button 
                    onClick={() => navigateTo(volNum - 1)} 
                    disabled={volNum <= 1}
                    className="flex flex-col group disabled:opacity-20 transition-opacity"
                  >
                    <span className="text-[10px] font-mono text-zinc-600 mb-2 group-hover:text-emerald-500 flex items-center gap-2">
                      <ChevronLeft size={14} /> PREV_NODE
                    </span>
                    <span className="text-lg font-bold text-zinc-400 group-hover:text-white uppercase italic">以前のプロトコル</span>
                  </button>

                  <div className="flex-1 flex flex-col items-center px-10">
                    <div className="w-full h-[1px] bg-white/5 relative">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-700" 
                        style={{ left: `${(volNum / 30) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => navigateTo(volNum + 1)} 
                    disabled={volNum >= 30}
                    className="flex flex-col items-end group disabled:opacity-20 transition-opacity"
                  >
                    <span className="text-[10px] font-mono text-zinc-600 mb-2 group-hover:text-emerald-500 flex items-center gap-2">
                      NEXT_NODE <ChevronRight size={14} />
                    </span>
                    <span className="text-lg font-bold text-zinc-400 group-hover:text-white uppercase italic">次段階の解析</span>
                  </button>
                </div>

                <div className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h5 className="text-white font-bold mb-1 uppercase tracking-tight">法人・公務員向け高信頼性データ</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                      THIS DATA IS PROTECTED UNDER BICSTATION ENTERPRISE PROTOCOL. 
                      ANY UNAUTHORIZED RECONSTRUCTION WITHOUT AI_SUPERVISION IS PROHIBITED.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </main>
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
    </div>
  );
}