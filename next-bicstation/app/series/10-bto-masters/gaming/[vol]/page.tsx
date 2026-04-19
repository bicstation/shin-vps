"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Terminal, 
  Cpu,
  AlertCircle,
  RefreshCcw,
  Database,
  Activity,
  Zap,
  CheckCircle2
} from 'lucide-react';

/**
 * 構成設定
 */
const SERIES_CONFIG = {
  phases: [
    { volRange: [1, 10], label: "ENTRY PHASE: 基礎構築" },
    { volRange: [11, 20], label: "MIDDLE PHASE: 最適化" },
    { volRange: [21, 30], label: "HIGH-END PHASE: 極限性能" },
    { volRange: [31, 40], label: "ULTIMATE PHASE: 未来展望" }
  ],
  targetModels: [
    "gemini-2.5-flash-preview-09-2025", 
    "gemini-1.5-pro-latest", 
    "gemini-1.5-flash"
  ]
};

// --- Firebase Initialization (Safe for SSR/Client) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "fake-key", authDomain: "fake.firebaseapp.com", projectId: "fake-id" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bto-masters-v2';

/**
 * APIキーのローテーション管理
 */
const KeyManager = {
  keys: [],
  lastIndex: -1,

  init() {
    this.keys = [];
    if (typeof window !== 'undefined') {
      const envKey = ""; 
      this.keys.push(envKey);

      for (let i = 0; i < 10; i++) {
        const k = window[`GEMINI_API_KEY_${i}`];
        if (k && !this.keys.includes(k)) this.keys.push(k);
      }
    }
    if (this.keys.length === 0) this.keys.push("");
  },

  getNextKey() {
    if (this.keys.length <= 1) return this.keys[0] || "";
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * this.keys.length);
    } while (nextIndex === this.lastIndex);
    this.lastIndex = nextIndex;
    return this.keys[nextIndex];
  }
};

/**
 * 指数バックオフ付きリクエスト
 */
async function fetchWithRetry(url, options, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 200) return response;
      
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, i) * 1000 + (Math.random() * 500);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw new Error(`HTTP_${response.status}`);
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("RETRY_LIMIT_EXCEEDED");
}

/**
 * 記事生成エンジン (Gemini API)
 */
async function generateViaAI(volNum, phaseLabel) {
  const systemPrompt = `あなたは自作PCスペシャリスト「Maya」です。
「BTO Masters: Gaming Series」の第${volNum}巻（${phaseLabel}）を執筆してください。
出力形式: JSON ({"title": "...", "description": "...", "content": "Markdown...", "amazonAsin": "...", "affiliateLabel": "..."})`;

  const payload = {
    contents: [{ parts: [{ text: `Vol.${volNum} [${phaseLabel}] のコラムを執筆せよ。` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.8
    }
  };

  for (const model of SERIES_CONFIG.targetModels) {
    const apiKey = KeyManager.getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const jsonStr = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (jsonStr) {
        const cleanJson = jsonStr.replace(/```json\n?|```/g, '').trim();
        return { ...JSON.parse(cleanJson), modelUsed: model };
      }
    } catch (err) {
      continue;
    }
  }
  throw new Error("ALL_MODELS_FAILED");
}

export default function App() {
  const [user, setUser] = useState(null);
  const [volNum, setVolNum] = useState(1);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState("System Offline...");
  const [retryCount, setRetryCount] = useState(0);

  // Auth Initialization
  useEffect(() => {
    KeyManager.init();
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Failure:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const phaseInfo = SERIES_CONFIG.phases.find(p => volNum >= p.volRange[0] && volNum <= p.volRange[1]) || SERIES_CONFIG.phases[0];

  // Main Data Pipeline
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const syncData = async () => {
      setLoading(true);
      setError(null);
      setStatusMsg("Accessing Encrypted Archives...");

      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'articles', `vol_${volNum}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStatusMsg("Archive Unlocked.");
          if (isMounted) setArticle(docSnap.data());
        } else {
          setStatusMsg("Cache Miss. Requesting AI Reconstruction...");
          const aiData = await generateViaAI(volNum, phaseInfo.label);
          const finalData = { ...aiData, volNum, createdAt: new Date().toISOString() };
          await setDoc(docRef, finalData);
          if (isMounted) setArticle(finalData);
        }
        if (isMounted) window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncData();
    return () => { isMounted = false; };
  }, [volNum, user, retryCount, phaseInfo.label]);

  if (loading && !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse"></div>
          <Cpu className="w-20 h-20 text-blue-600 animate-[spin_5s_linear_infinite] relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-4 font-mono">
          <div className="text-blue-500 text-[10px] tracking-[0.8em] uppercase animate-pulse">{statusMsg}</div>
          <div className="w-48 h-[1px] bg-zinc-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 animate-[loading_2s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-10">
        <div className="max-w-md w-full border border-red-900/30 p-16 rounded-[3rem] bg-red-950/5 text-center backdrop-blur-3xl">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-6" />
          <h2 className="text-white font-black uppercase italic text-2xl mb-4 tracking-tighter">Connection_Lost</h2>
          <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest leading-loose mb-10">{error}</p>
          <button onClick={() => setRetryCount(c => c + 1)} className="w-full py-4 bg-red-600 text-white font-mono text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center gap-3">
            <RefreshCcw size={14} /> Re-Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Terminal size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-black tracking-tighter text-sm uppercase italic leading-none">BTO Masters</div>
            <div className="text-[8px] font-mono text-zinc-600 tracking-[0.3em] uppercase mt-1">Status: Online</div>
          </div>
        </div>
        <div className="hidden md:flex gap-8 font-mono text-[9px] text-zinc-500 tracking-widest uppercase items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-white/5">
            <Database size={10} className="text-blue-500" /> {article?.modelUsed || "ARCHIVE"}
          </div>
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-green-500 animate-pulse" /> SYNC_STABLE
          </div>
        </div>
      </nav>

      <div className="max-w-[1700px] mx-auto px-8 pt-32 flex flex-col lg:flex-row gap-16">
        
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-72 sticky top-32 h-[calc(100vh-10rem)] overflow-y-auto pr-6 scrollbar-hide pb-20 border-r border-white/5">
          <div className="space-y-12">
            {SERIES_CONFIG.phases.map((phase, i) => (
              <div key={i} className={`transition-all duration-700 ${volNum >= phase.volRange[0] && volNum <= phase.volRange[1] ? "opacity-100" : "opacity-20"}`}>
                <h4 className="text-[10px] text-blue-500 font-mono tracking-[0.4em] uppercase mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> {phase.label.split(':')[0]}
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, j) => {
                    const v = (i * 10) + j + 1;
                    const isActive = v === volNum;
                    return (
                      <button key={v} onClick={() => setVolNum(v)} className={`aspect-square text-[9px] font-mono flex items-center justify-center transition-all rounded-lg border ${isActive ? "bg-blue-600 border-blue-400 text-white shadow-lg scale-110 z-10" : "bg-[#0a0a0a] border-white/5 text-zinc-700 hover:text-zinc-400 hover:border-zinc-700"}`}>{v}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-4xl mx-auto pb-48 w-full">
          <header className="mb-24 relative">
            <div className="flex items-center gap-6 mb-10">
              <span className="px-4 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono uppercase tracking-[0.2em] rounded-full">
                {phaseInfo.label}
              </span>
              <div className="h-px flex-grow bg-gradient-to-r from-blue-500/30 to-transparent"></div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-500 fill-yellow-500/20" />
                <span className="text-white font-mono text-xs font-bold uppercase tracking-tighter italic">Vol_{String(volNum).padStart(2, '0')}</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-[-0.07em] leading-[0.85] uppercase italic group">
              {article?.title}
            </h1>
            
            <p className="text-2xl text-zinc-400 leading-relaxed font-light italic border-l-4 border-blue-600 pl-10 py-4 max-w-2xl bg-gradient-to-r from-blue-500/5 to-transparent">
              {article?.description}
            </p>

            <div className="mt-20 relative aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-950 group shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)] group-hover:scale-150 transition-transform duration-2000"></div>
              <div className="flex flex-col items-center justify-center h-full opacity-10 group-hover:opacity-30">
                <Cpu size={140} strokeWidth={0.3} className="text-blue-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            </div>
          </header>

          <article className="prose prose-invert prose-blue max-w-none 
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
            prose-h2:text-4xl prose-h2:mt-32 prose-h2:mb-10 prose-h2:italic prose-h2:text-white
            prose-p:text-zinc-400 prose-p:text-xl prose-p:leading-[1.8] prose-p:mb-10
            prose-strong:text-blue-500 prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-600/5 prose-blockquote:p-10 prose-blockquote:rounded-[2rem]
            prose-li:text-zinc-400 prose-code:text-blue-400 prose-code:bg-zinc-900 prose-code:px-2 prose-code:rounded
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article?.content || ""}
            </ReactMarkdown>
          </article>

          {/* Affiliate */}
          <div className="mt-48 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative p-12 bg-zinc-950 border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
                  <ShoppingCart size={16} /> Gear_Verification
                </div>
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Hardware_Core_Link</h4>
                <p className="text-zinc-500 text-xs font-mono max-w-sm leading-relaxed">
                  本巻で解析した構成の基盤となるASINアーキテクチャ。
                </p>
              </div>
              <a href={`https://www.amazon.co.jp/dp/${article?.amazonAsin}`} target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-blue-600 text-white text-[10px] font-mono tracking-[0.5em] uppercase rounded-2xl hover:bg-blue-500 transition-all hover:scale-105 shadow-xl text-center min-w-[240px]">
                {article?.affiliateLabel || "スペックを確認"}
              </a>
            </div>
          </div>

          {/* Pagination */}
          <footer className="mt-64 pt-20 border-t border-white/5 flex justify-between items-center">
            <button disabled={volNum <= 1} onClick={() => setVolNum(v => v - 1)} className="flex items-center gap-6 group disabled:opacity-0 transition-all">
              <div className="w-16 h-16 flex items-center justify-center border border-white/5 rounded-2xl group-hover:border-blue-600 group-hover:bg-blue-600/10 transition-all">
                <ChevronLeft className="text-zinc-600 group-hover:text-blue-500" />
              </div>
              <div className="text-left">
                <span className="block text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1 font-bold italic">Previous</span>
                <span className="text-3xl font-black text-zinc-600 group-hover:text-white transition-colors uppercase italic tracking-tighter">Vol_{String(volNum - 1).padStart(2, '0')}</span>
              </div>
            </button>
            <button disabled={volNum >= 40} onClick={() => setVolNum(v => v + 1)} className="flex items-center gap-6 group text-right disabled:opacity-0 transition-all">
              <div className="text-right">
                <span className="block text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1 font-bold italic">Next</span>
                <span className="text-3xl font-black text-zinc-600 group-hover:text-white transition-colors uppercase italic tracking-tighter">Vol_{String(volNum + 1).padStart(2, '0')}</span>
              </div>
              <div className="w-16 h-16 flex items-center justify-center border border-white/5 rounded-2xl group-hover:border-blue-600 group-hover:bg-blue-600/10 transition-all">
                <ChevronRight className="text-zinc-600 group-hover:text-blue-500" />
              </div>
            </button>
          </footer>
        </main>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}