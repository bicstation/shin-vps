"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useRouter } from 'next/navigation';
import { BTO_SERIES_CONFIG } from '../../data'; // 階層に合わせてパスを調整
import { 
  Terminal, Cpu, AlertCircle, RefreshCcw, 
  Database, Activity, Zap 
} from 'lucide-react';

// --- 設定 ---
const PHASE_SETTINGS = [
  { range: [1, 10], label: "ENTRY PHASE: 基礎構築" },
  { range: [11, 20], label: "MIDDLE PHASE: 最適化" },
  { range: [21, 30], label: "HIGH-END PHASE: 極限性能" },
  { range: [31, 40], label: "ULTIMATE PHASE: 未来展望" }
];

const TARGET_MODELS = ["gemini-2.0-flash-exp", "gemini-1.5-pro-latest", "gemini-1.5-flash"];

// --- Firebase (Safe) ---
const firebaseConfig = typeof window !== 'undefined' && (window as any).__firebase_config 
  ? JSON.parse((window as any).__firebase_config) 
  : { apiKey: "dummy", authDomain: "dummy", projectId: "dummy" };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export default function DynamicBtoEngine() {
  const params = useParams();
  const router = useRouter();
  
  // URLから動的に取得
  const seriesId = params?.id as string;
  const volNum = parseInt(params?.vol as string) || 1;
  const seriesConfig = BTO_SERIES_CONFIG[seriesId];

  const [user, setUser] = useState<any>(null);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing...");

  // クラス名エラー回避のため配列で定義
  const articleClasses = [
    "prose", "prose-invert", "prose-blue", "max-w-none",
    "prose-headings:italic", "prose-headings:font-black", "prose-headings:uppercase",
    "prose-p:text-zinc-400", "prose-p:text-lg", "prose-p:leading-[1.8]",
    "prose-blockquote:bg-zinc-900/50", "prose-blockquote:border-blue-600", "prose-blockquote:p-8", "prose-blockquote:rounded-2xl"
  ].join(" ");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, []);

  const phaseInfo = useMemo(() => 
    PHASE_SETTINGS.find(p => volNum >= p.range[0] && volNum <= p.range[1]) || PHASE_SETTINGS[0]
  , [volNum]);

  useEffect(() => {
    if (!user || !seriesConfig) return;
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setStatusMsg("Searching BICSTATION Archive...");
      try {
        const docRef = doc(db, 'artifacts', 'bto-masters-v3', seriesId, 'articles', `vol_${volNum}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          if (isMounted) setArticle(docSnap.data());
        } else {
          setStatusMsg("Fragment Missing. AI Reconstruction required.");
          // AI生成ロジック(generateViaAI)をここに呼ぶか、APIルートへ
          setError("NO_DATA_FOUND_IN_ARCHIVE");
        }
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [volNum, user, seriesId, seriesConfig]);

  const navigateTo = (newVol: number) => {
    router.push(`/series/${seriesId}/${newVol}`);
  };

  if (error || !seriesConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-mono text-red-500">
        <AlertCircle className="mr-2" /> {error || "INVALID_SERIES_ID"}
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 selection:bg-blue-600">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between">
        <div className="flex items-center gap-4">
          <Terminal size={18} className="text-blue-600" />
          <span className="text-white font-black uppercase italic">{seriesConfig.title}</span>
        </div>
        <div className="text-[10px] font-mono self-center">NODE: {seriesId.toUpperCase()} / VOL: {volNum}</div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 pt-32 flex gap-16">
        {/* インデックス */}
        <aside className="hidden lg:block w-64 sticky top-32 h-fit">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 40 }, (_, i) => i + 1).map(v => (
              <button 
                key={v} 
                onClick={() => navigateTo(v)}
                className={`p-2 text-[10px] font-mono border ${v === volNum ? "bg-blue-600 text-white" : "border-white/5"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 max-w-3xl pb-32">
          <h1 className="text-6xl font-black text-white mb-8 italic uppercase leading-none">
            {article?.title || "SYSTEM_LOADING"}
          </h1>
          
          <article className={articleClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article?.content || ""}
            </ReactMarkdown>
          </article>

          <footer className="mt-20 pt-10 border-t border-zinc-900 flex justify-between">
            <button onClick={() => navigateTo(volNum - 1)} disabled={volNum <= 1}>PREV</button>
            <button onClick={() => navigateTo(volNum + 1)} disabled={volNum >= 40}>NEXT</button>
          </footer>
        </main>
      </div>
    </div>
  );
}