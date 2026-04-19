"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'next/navigation';
import { BTO_SERIES_CONFIG } from '../data'; 
import { 
  Terminal, 
  Cpu,
  AlertCircle,
  RefreshCcw,
  Database,
  Activity,
  Zap
} from 'lucide-react';

/**
 * 構成設定
 */
const SERIES_SETTINGS = {
  phases: [
    { volRange: [1, 10], label: "ENTRY PHASE: 基礎構築" },
    { volRange: [11, 20], label: "MIDDLE PHASE: 最適化" },
    { volRange: [21, 30], label: "HIGH-END PHASE: 極限性能" },
    { volRange: [31, 40], label: "ULTIMATE PHASE: 未来展望" }
  ],
  targetModels: [
    "gemini-2.0-flash-exp", 
    "gemini-1.5-pro-latest", 
    "gemini-1.5-flash"
  ]
};

// --- Firebase Initialization ---
const firebaseConfig = typeof window !== 'undefined' && (window as any).__firebase_config 
  ? JSON.parse((window as any).__firebase_config) 
  : { apiKey: "dummy", authDomain: "dummy", projectId: "dummy" };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "bto-masters-v3";

const KeyManager = {
  getKeys(): string[] {
    if (typeof window === 'undefined') return [""];
    const keys: string[] = [];
    for (let i = 0; i < 10; i++) {
      const k = (window as any)[`GEMINI_API_KEY_${i}`];
      if (k) keys.push(k);
    }
    return keys.length > 0 ? keys : [""];
  }
};

async function generateViaAI(volNum: number, phaseLabel: string, seriesTitle: string, concept: string) {
  const systemPrompt = `あなたはBICSTATIONの自作PCスペシャリスト「Maya」です。
シリーズ名:「${seriesTitle}」
コンセプト:「${concept}」
第${volNum}巻（${phaseLabel}）の技術コラムを執筆してください。
出力はJSONのみ。Markdownコードブロック不可。
{
  "title": "第${volNum}回：主題",
  "description": "概要100字",
  "content": "Markdown解説",
  "amazonAsin": "ASIN",
  "affiliateLabel": "ラベル"
}`;

  const keys = KeyManager.getKeys();
  for (const model of SERIES_SETTINGS.targetModels) {
    const apiKey = keys[Math.floor(Math.random() * keys.length)];
    if (!apiKey) continue;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Vol.${volNum} [${phaseLabel}] を生成せよ。` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { ...JSON.parse(text), modelUsed: model };
    } catch (err) {
      console.error(`Model ${model} failed`);
    }
  }
  throw new Error("RECONSTRUCTION_FAILED");
}

export default function BtoMastersEngine() {
  const params = useParams();
  // URLパラメータの取得を修正
  const seriesId = (params?.id as string) || 'build_logic';
  const initialVol = params?.vol ? parseInt(params.vol as string) : 1;
  
  const seriesConfig = BTO_SERIES_CONFIG[seriesId];

  const [user, setUser] = useState<any>(null);
  const [volNum, setVolNum] = useState(initialVol);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing...");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, []);

  const phaseInfo = useMemo(() => 
    SERIES_SETTINGS.phases.find(p => volNum >= p.volRange[0] && volNum <= p.volRange[1]) || SERIES_SETTINGS.phases[0]
  , [volNum]);

  useEffect(() => {
    if (!user || !seriesConfig) return;
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setStatusMsg("Connecting to BICSTATION Archive...");
      try {
        const docRef = doc(db, 'artifacts', appId, seriesId, 'articles', `vol_${volNum}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStatusMsg("Archive Decrypted.");
          if (isMounted) setArticle(docSnap.data());
        } else {
          setStatusMsg("Data Fragment Missing. AI Synthesis...");
          const aiData = await generateViaAI(volNum, phaseInfo.label, seriesConfig.title, seriesConfig.concept);
          const finalData = { ...aiData, volNum, seriesId, createdAt: new Date().toISOString() };
          await setDoc(docRef, finalData);
          if (isMounted) setArticle(finalData);
        }
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [volNum, user, retryCount, seriesId, seriesConfig, phaseInfo.label]);

  if (loading && !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-8">
        <Cpu className="w-16 h-16 text-blue-600 animate-spin opacity-50" />
        <div className="font-mono text-[10px] text-blue-500 tracking-[0.5em] uppercase animate-pulse">{statusMsg}</div>
      </div>
    );
  }

  if (error || !seriesConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-10 font-mono">
        <div className="text-center border border-red-900/30 p-12 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-6" />
          <h2 className="text-white text-xl mb-4 italic">CRITICAL_ERROR</h2>
          <p className="text-zinc-600 text-xs mb-8 uppercase tracking-widest">{error || "SERIES_NOT_FOUND"}</p>
          <button onClick={() => setRetryCount(c => c + 1)} className="px-8 py-3 bg-red-600 text-white text-[10px] uppercase rounded-full flex items-center gap-2 mx-auto">
            <RefreshCcw size={12} /> Force_Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-blue-600">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Terminal size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm uppercase italic leading-none">{seriesConfig.title.split('：')[0]}</div>
            <div className="text-[8px] font-mono text-zinc-600 tracking-[0.3em] uppercase mt-1">VOL_{volNum} / NODE_ACTIVE</div>
          </div>
        </div>
        <div className="hidden md:flex gap-6 font-mono text-[9px] text-zinc-500 uppercase items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full">
            <Database size={10} className="text-blue-500" /> {article?.modelUsed || "CACHED"}
          </div>
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-green-500 animate-pulse" /> SYNC_OK
          </div>
        </div>
      </nav>

      <div className="max-w-[1700px] mx-auto px-8 pt-32 flex flex-col lg:flex-row gap-16">
        <aside className="hidden lg:block lg:w-72 sticky top-32 h-[calc(100vh-10rem)] overflow-y-auto pr-6 scrollbar-hide">
          <div className="space-y-10">
            {SERIES_SETTINGS.phases.map((phase, i) => (
              <div key={i} className={`transition-opacity duration-500 ${volNum >= phase.volRange[0] && volNum <= phase.volRange[1] ? "opacity-100" : "opacity-30"}`}>
                <h4 className="text-[9px] text-blue-500 font-mono tracking-[0.3em] uppercase mb-4">{phase.label}</h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }, (_, j) => {
                    const v = (i * 10) + j + 1;
                    const isActive = v === volNum;
                    return (
                      <button key={v} onClick={() => setVolNum(v)} className={`aspect-square text-[9px] font-mono rounded border transition-all ${isActive ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-700 hover:border-zinc-500"}`}>{v}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 max-w-4xl mx-auto pb-48 w-full">
          <header className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-blue-500 font-mono text-xs font-bold tracking-tighter">PHASE_{Math.ceil(volNum/10)}</span>
              <div className="h-px flex-grow bg-zinc-900"></div>
              <Zap size={14} className="text-yellow-500" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase italic leading-[0.9]">
              {article?.title || "RECONSTRUCTING..."}
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed italic border-l-2 border-blue-600 pl-8">
              {article?.description}
            </p>
          </header>

          <article className={`prose prose-invert prose-blue max-w-none 
            prose-headings:italic prose-headings:font-black prose-headings:uppercase
            prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-[1.8]
            prose-blockquote:bg-zinc-900/50 prose-blockquote:border-blue-600 prose-blockquote:p-8 prose-blockquote:rounded-2xl
          `}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article?.content || ""}
            </ReactMarkdown>
          </article>

          <div className="mt-40 p-10 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Technical_Assets</div>
              <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Hardware_Link_Established</h4>
            </div>
            <a href={`https://www.amazon.co.jp/dp/${article?.amazonAsin}`} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-white text-black font-mono text-[10px] tracking-[0.3em] uppercase font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl">
              {article?.affiliateLabel || "スペックを解析"}
            </a>
          </div>

          <footer className="mt-40 pt-10 border-t border-zinc-900 flex justify-between">
            <button disabled={volNum <= 1} onClick={() => setVolNum(v => v - 1)} className="flex flex-col gap-2 group disabled:opacity-0 transition-opacity">
              <span className="text-[10px] font-mono text-zinc-600 uppercase">Previous_Node</span>
              <span className="text-2xl font-black text-zinc-400 group-hover:text-white italic tracking-tighter uppercase">Vol_{volNum - 1}</span>
            </button>
            <button disabled={volNum >= 40} onClick={() => setVolNum(v => v + 1)} className="flex flex-col gap-2 group items-end disabled:opacity-0 transition-opacity">
              <span className="text-[10px] font-mono text-zinc-600 uppercase">Next_Node</span>
              <span className="text-2xl font-black text-zinc-400 group-hover:text-white italic tracking-tighter uppercase">Vol_{volNum + 1}</span>
            </button>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}