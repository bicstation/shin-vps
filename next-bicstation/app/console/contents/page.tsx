// /home/maya/shin-vps/next-bicstation/app/console/contents/page.tsx
"use client";
console.log("🔥🔥🔥 THIS IS NEW CODE 🔥🔥🔥");

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  serverTimestamp, writeBatch, query, orderBy, limit, where, getDocs
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Database, UploadCloud, Loader2, Layers, Search, Edit3, ArrowLeft, Send, 
  ChevronRight, BookOpen, ChevronDown, Terminal, Cpu, Zap, Globe, Copy, 
  Sparkles, ShoppingCart, Image as ImageIcon, Link as LinkIcon, Target, 
  DollarSign, Monitor, Wand2, Play, Activity, CheckCircle2, AlertTriangle, 
  Settings, Save, Eye, Hash, Clock, Palette, Flame, ShieldCheck, BarChart3, Binary,
  RefreshCw, Server, HardDrive, Shield, ZapOff, Code2, FileJson, Gauge, ExternalLink,Box //
} from 'lucide-react';

// --- インフラ・データ構造定義 ---
import { GUIDE_STRUCTURE } from '@/content-data/category1_guide_structure';  
import { BTO_SERIES_CONFIG } from '@/content-data/category2_bto_series';
import { BTO_FORTRESS_CONFIG } from '@/content-data/category3_bto_fortess';
import { BTO_MAKERS_CONFIG } from '@/content-data/category4_bto_makers';
import { OS_HISTORY_SERIES } from '@/content-data/category5_bto_oshistories';

// --- Firebase Configuration ---
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB2dizTRDncD3hOkgsLLKiDX6tQpzZtNY0",
  authDomain: "bicstationaicontents.firebaseapp.com",
  projectId: "bicstationaicontents",
  storageBucket: "bicstationaicontents.firebasestorage.app",
  messagingSenderId: "268855528598",
  appId: "1:268855528598:web:c61f5b128b4f675c09c6b7",
  measurementId: "G-7LBQ5W03BB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);
const currentAppId = 'bicstation-main';

const ContentConsole = () => {
  // --- States ---
  const [user, setUser] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '', status: 'idle' });
  const [view, setView] = useState('list'); 
  const [selectedEp, setSelectedEp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cat1');
  const [editContent, setEditContent] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [rakutenUrl, setRakutenUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [imagePath, setImagePath] = useState('');

  // --- Auth & Data Stream ---
  useEffect(() => {
    signInAnonymously(auth);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', currentAppId, 'public', 'data', 'episodes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEpisodes(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Logic Helpers ---
  const validateContent = (text) => {
    if (!text || text.length < 500) return { ok: false, reason: "Insufficient Data Length" };
    if (text.includes("AIとして")) return { ok: false, reason: "AI Persona Leak Detected" };
    return { ok: true };
  };

  const callAiEngine = async (prompt, priority = 1) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180秒

    try {
      const res = await fetch('/ai-engine/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, priority }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text();
        console.error("🔥 API ERROR:", text);
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.message || "AI Engine Error");
      }

      return data.content;

    } catch (e) {
      clearTimeout(timeoutId);

      if (e.name === 'AbortError') {
        console.error("⏰ TIMEOUT: AI generation took too long");
        throw new Error("AI generation timeout");
      }

      console.error("🔥 FETCH ERROR:", e);
      throw e;
    }
  };

  const saveToFirestore = async (id, content) => {
    const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', id);
    await setDoc(docRef, {
      content,
      status: 'published',
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const getFullPrompt = useCallback((ep) => {
    const personaMap = {
      cat1: { role: "PCアーキテクチャの伝道師", tone: "緻密かつ哲学的" },
      cat2: { role: "BTO要塞構築スペシャリスト", tone: "実用的・プロスペック" },
      cat3: { role: "物理インフラ最高責任者", tone: "壮大かつ重厚" },
      cat4: { role: "メーカー設計思想アナリスト", tone: "辛口・徹底解剖" },
      cat5: { role: "OS史学者", tone: "回顧的-アカデミック" }
    };
    const p = personaMap[activeTab] || { role: "エンジニア", tone: "標準" };
    return `あなたは「${p.role}」です。${p.tone}なトーンでMarkdown形式で執筆せよ。タイトル: ${ep.title}\n1200文字以上、挨拶不要。`;
  }, [activeTab]);

  // --- Handlers ---
  const handleSyncMaster = async () => {
  setSyncing(true);
  const batch = writeBatch(db);

  const flatten = (data, categoryId) => {
    return Object.values(data || {}).flatMap(series =>
      (series?.phases || []).flatMap(phase =>
        (phase?.episodes || []).map(ep => ({
          id: `${categoryId}_${series.id}_${ep.ep}`, // ← 超重要
          title: ep.title,
          episodeNumber: ep.ep,
          seriesId: series.id  || 'unknown',
          seriesTitle: series.title ?? 'Untitled Series',
          phase: phase.label || 'Phase 0',
          categoryId,
          order: series.order ?? 0
        }))
      )
    );
  };

  const flattenSingle = (data, categoryId) => {
    return (data?.phases || []).flatMap(phase =>
      (phase?.episodes || []).map(ep => ({
        id: `${categoryId}_main_${ep.ep}`,
        title: ep.title,
        episodeNumber: ep.ep,
        seriesId: 'main',
        seriesTitle: data.title,
        phase: phase.label || 'Phase 0',
        categoryId,
        order: 999
      }))
    );
  };

  const allMaster = [
    ...flatten(GUIDE_STRUCTURE, 'cat1'),
    ...flatten(BTO_SERIES_CONFIG, 'cat2'),
    ...flatten(BTO_FORTRESS_CONFIG, 'cat3'),
    ...flatten(BTO_MAKERS_CONFIG, 'cat4'),
    ...flattenSingle(OS_HISTORY_SERIES, 'cat5')
  ];

  for (const item of allMaster) {
    const ref = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', item.id);
    batch.set(ref, {
  ...item,
  status: 'planned',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}, { merge: true });

  }

  await batch.commit();
  setSyncing(false);
};

  // --- AutoPilot ---
  const runAutoPilot = async () => {
  if (isAutoPiloting) return;

  const targets = episodes
  .filter(ep => (!ep.content || ep.content.length === 0) && ep.categoryId === activeTab)
  .sort((a, b) => a.episodeNumber - b.episodeNumber);

  if (targets.length === 0) return;

  setIsAutoPiloting(true);

  let count = 0;

  for (const ep of targets) {
    try {
      // --- ① 生成 ---
      setProgress({
        current: count,
        total: targets.length,
        label: `🧠 Generating text: ${ep.title}`,
        status: 'active'
      });

      let content = await callAiEngine(getFullPrompt(ep));

      // --- ② バリデーション & リトライ ---
      let check = validateContent(content);
      let retry = 0;

      while (!check.ok && retry < 2) {
        console.warn(`🔁 Retry ${retry + 1}: ${ep.title} / ${check.reason}`);

        content = await callAiEngine(
          `以下の問題を修正して再生成してください:\n${check.reason}\n\n${content}`
        );

        check = validateContent(content);
        retry++;
      }

      // --- ③ 保存 ---
      if (check.ok) {

        // --- 🔥 画像生成API呼び出し ---
        await new Promise(r => setTimeout(r, 5000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        let res;

        try {
          console.log("🚀 START IMAGE:", ep.title);

          setProgress({
            current: count,
            total: targets.length,
            label: `🎨 Generating image: ${ep.title}`,
            status: 'active'
          });

          res = await fetch('/ai-engine/image-generate/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: ep.title,
              content: content
            }),
            signal: controller.signal
          });

          console.log("✅ DONE IMAGE:", ep.title);

        } catch (e) {
          console.error("🔥 FETCH ERROR:", e);
          continue;
        } finally {
          clearTimeout(timeoutId);
        }

        if (!res.ok) {
          console.log("📡 STATUS:", res.status);
          console.error("🔥 API ERROR:", await res.text());
          continue;
        }

        const data = await res.json();
        const imagePath = data.imagePath;

        if (!imagePath) {
          console.error("🔥 NO IMAGE PATH");
          continue;
        }

        // --- 🔥 Firestore保存（画像付き） ---

        console.log("🖼 Saving image:", imagePath);

        setProgress({
          current: count,
          total: targets.length,
          label: `💾 Saving: ${ep.title}`,
          status: 'active'
        });

        await setDoc(
          doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', ep.id),
          {
            content,
            imagePath,
            status: 'published',
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

      } else {
        console.warn(`⚠️ Skip: ${ep.title} (validation failed)`);
      }

      // --- ④ 進捗更新 ---
      count++;

      setProgress({
        current: count,
        total: targets.length,
        label: `✅ Done: ${ep.title}`,
        status: 'active'
      });

      // --- ⑤ Rate Limit対策 ---
      await new Promise(r => setTimeout(r, 8000));

    } catch (e) {
        console.error("🔥🔥🔥 FULL ERROR:", e);

          count++;

          setProgress({
            current: count,
            total: targets.length,
            label: `❌ Failed: ${ep.title}`,
            status: 'active'
          });

        if (e instanceof Error) {
          console.error("MESSAGE:", e.message);
          console.error("STACK:", e.stack);
          }
    }
  }
  
  setIsAutoPiloting(false);

  setProgress({
    current: 0,
    total: 0,
    label: 'Idle',
    status: 'idle'
  });
};

  const handleSelectEpisode = (ep) => {
    setSelectedEp(ep);
    setEditContent(ep.content || '');
    setAmazonUrl(ep.amazonUrl || '');
    setRakutenUrl(ep.rakutenUrl || '');
    setOriginalUrl(ep.originalUrl || '');
    setImagePath(ep.imagePath || 'http://localhost:8083/media/articles/cat1_bto_02.png');
    setView('edit');
  };

  const handleCommitMission = async () => {
    if (!selectedEp) return;
    await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', selectedEp.id), {
      content: editContent, amazonUrl, rakutenUrl, originalUrl, imagePath,
      status: editContent.length > 50 ? 'published' : 'planned',
      updatedAt: serverTimestamp()
    }, { merge: true });
    setView('list');
  };

const grouped = useMemo(() => {
  const data = Object.create(null);

  episodes
    .filter(ep =>
      ep.categoryId === activeTab &&
      (ep.title || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    )

    .forEach(ep => {
  if (!data[ep.seriesId]) {
    data[ep.seriesId] = {
      title: ep.seriesTitle ?? 'Untitled Series',
      order: ep.order ?? 0,
      phases: {}
    };
  }

  if (!data[ep.seriesId].phases[ep.phase]) {
    data[ep.seriesId].phases[ep.phase] = [];
  }

  data[ep.seriesId].phases[ep.phase].push(ep);
}); 

// その後にソート
Object.values(data).forEach(series => {
  Object.values(series.phases).forEach(eps => {
    eps.sort((a, b) => a.episodeNumber - b.episodeNumber);
  });
});

  return data;
}, [episodes, activeTab, searchTerm]);

// 👇 これを「後」に置く
const sortedGrouped = useMemo(() => {
  return Object.entries(grouped).sort((a, b) => {
    const orderA = a[1].order || 0;
    const orderB = b[1].order || 0;
    return orderA - orderB;
  });
}, [grouped]);

const getPhaseNumber = (label) => {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
};
 
  // --- Render ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-mono text-blue-500">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={48} />
        <span className="animate-pulse tracking-[0.3em] text-[10px]">INITIALIZING_SYSTEM...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative p-2.5 bg-black rounded-lg border border-white/10 shadow-2xl shadow-blue-500/10">
              <Cpu className="text-blue-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">BIC Station Console v6</h1>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest"><Binary size={10}/> Data_Nodes: {episodes.length}</span>
                <span className="flex items-center gap-1.5 text-[8px] font-bold text-blue-500 uppercase tracking-widest"><Activity size={10}/> Engine_Status: Synchronized</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAutoPiloting && (
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex flex-col gap-1">
                
                <div className="flex items-center gap-2">
                  <RefreshCw className="animate-spin text-blue-400" size={14} />
                  <span className="text-[10px] font-black text-blue-400 font-mono">
                    {progress.current} / {progress.total}
                  </span>
                </div>

                <div className="text-[9px] text-slate-400 font-mono">
                  {progress.label}
                </div>

                {/* 👇 ここに追加 */}
                <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`
                    }}
                  />
                </div>

              </div>
            )}
            <button onClick={handleSyncMaster} disabled={syncing} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-[10px] font-black rounded-lg border border-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
               <RefreshCw size={14} className={syncing ? "animate-spin" : ""}/> Master Sync
            </button>
            <button onClick={runAutoPilot} disabled={isAutoPiloting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white rounded-lg transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} /> Auto-Pilot
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-10 relative z-10">
        {view === 'list' ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Category Tabs */}
            <div className="flex gap-3 bg-white/[0.02] p-1.5 border border-white/5 rounded-2xl w-fit">
              {['cat1', 'cat2', 'cat3', 'cat4', 'cat5'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)} 
                  className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === cat ? 'bg-white text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
              <input 
                type="text" 
                placeholder="ACCESS_DATABASE_QUERY..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm focus:border-blue-500/40 outline-none transition-all font-mono placeholder:text-slate-700"
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* Matrix Grid */}
              <div className="space-y-6">
 
                {sortedGrouped.map(([seriesId, series]) => (
  <div key={seriesId}>

    <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
      {series.title ?? 'Untitled Series'}
    </h2>

    {Object.entries(series.phases)
      .sort(([a], [b]) => getPhaseNumber(a) - getPhaseNumber(b))
      .map(([phase, eps]) => (
        <details key={phase} className="mb-4 bg-white/5 p-4 rounded-xl">

          <summary className="cursor-pointer text-blue-400 font-bold">
        📂 {phase} ({eps.length})
          </summary>  

          <div className="mt-4 space-y-2">
            {eps.map(ep => (
              <div
                key={ep.id}
                onClick={() => handleSelectEpisode(ep)}
                className={`p-3 rounded-lg cursor-pointer transition-all
                  ${ep.content 
                    ? 'bg-black/40 hover:bg-blue-500/10' 
                    : 'bg-red-500/10 hover:bg-red-500/20'}
                `}
              >
                <span className="text-xs text-slate-500 mr-2">
                  EP {ep.episodeNumber}
                </span>
                {ep.title}
              </div>
            ))}
          </div>

        </details>
      ))}
  </div>
))}
</div>
          </div>
        ) : (
          /* Editor View */
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center">
              <button onClick={() => setView('list')} className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10"><ArrowLeft size={16} /></div> 
                TERMINATE_SESSION
              </button>
              <button onClick={handleCommitMission} className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white text-[11px] font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/50 uppercase tracking-widest">
                <Save size={18} /> Commit to Mainframe
              </button>
            </div>

            <div className="relative">
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/5 to-transparent"></div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-12">
                {selectedEp?.title}
              </h2>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-8 space-y-4">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black text-slate-500 flex items-center gap-2"><Terminal size={12}/> DATA_CONTENT_STREAM</span>
                </div>
                 {imagePath && (
                  <img
                    src={imagePath}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                <textarea 
                  value={editContent} 
                  onChange={e => setEditContent(e.target.value)} 
                  className="w-full h-[700px] bg-black/60 border border-white/10 rounded-[2.5rem] p-12 font-mono text-sm leading-relaxed outline-none focus:border-blue-500/40 transition-all shadow-inner placeholder:text-slate-800"
                  placeholder="// Awaiting data..."
                />
              </div>

              <div className="col-span-4 space-y-6">
                <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-6">
                   <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Globe size={14}/> Affiliate Hub</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[8px] font-black text-slate-600 ml-2 mb-1 block">AMAZON_SIG</label>
                       <input type="text" value={amazonUrl} onChange={e => setAmazonUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-slate-400 outline-none focus:border-blue-500/30 transition-all font-mono" />
                     </div>
                     <div>
                       <label className="text-[8px] font-black text-slate-600 ml-2 mb-1 block">RAKUTEN_SIG</label>
                       <input type="text" value={rakutenUrl} onChange={e => setRakutenUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-slate-400 outline-none focus:border-blue-500/30 transition-all font-mono" />
                     </div>
                   </div>
                </div>

                <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-6">
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Box size={14}/> Asset Management</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[8px] font-black text-slate-600 ml-2 mb-1 block">IMG_PATH</label>
                       <input type="text" value={imagePath} onChange={e => setImagePath(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-slate-400 outline-none focus:border-emerald-500/30 transition-all font-mono" />
                     </div>
                     <div>
                       <label className="text-[8px] font-black text-slate-600 ml-2 mb-1 block">REF_URL</label>
                       <input type="text" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-slate-400 outline-none focus:border-emerald-500/30 transition-all font-mono" />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ContentConsole;