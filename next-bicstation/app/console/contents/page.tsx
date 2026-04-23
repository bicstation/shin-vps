"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  serverTimestamp, writeBatch, query, orderBy, limit, where, getDocs
} from "firebase/firestore";
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from "firebase/auth";
import { 
  Database, UploadCloud, Loader2, Layers, Search, 
  Edit3, ArrowLeft, Send, ChevronRight, BookOpen, ChevronDown, Terminal,
  Cpu, Zap, Globe, Copy, Sparkles, ShoppingCart, Image as ImageIcon, Link as LinkIcon,
  Target, DollarSign, Monitor, Wand2, Play, Activity, CheckCircle2, AlertTriangle, 
  Settings, Save, Eye, Hash, Clock, Palette, Flame, ShieldCheck, BarChart3, Binary,
  RefreshCw, Server, HardDrive, Shield, ZapOff, Code2, FileJson, Gauge
} from 'lucide-react';

// --- インフラ・データ構造定義 ---
import { GUIDE_STRUCTURE } from '@/content-data/category1_guide_structure';  
import { BTO_SERIES_CONFIG } from '@/content-data/category2_bto_series';
import { BTO_FORTRESS_CONFIG } from '@/content-data/category3_bto_fortess';
import { BTO_MAKERS_CONFIG } from '@/content-data/category4_bto_makers';
import { OS_HISTORY_SERIES } from '@/content-data/category5_bto_oshistories'; // 追加


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
  // --- Core Engine States ---
  const [user, setUser] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '', status: 'idle' });

  // --- UI Control States ---
  const [view, setView] = useState<'list' | 'edit'>('list'); 
  const [selectedEp, setSelectedEp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cat1');
  const [openSeries, setOpenSeries] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // --- Editor Field States ---
  const [editContent, setEditContent] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [rakutenUrl, setRakutenUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [metaTitle, setMetaTitle] = useState('');

  // --- Refs for Performance ---
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. Auth Lifecycle ---
  useEffect(() => {
    signInAnonymously(auth);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Real-time Data Stream (Nexus Sync) ---
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

  // --- 3. Advanced Sorting & Logic Processing ---
  const allEpsFlatSorted = useMemo(() => {
    return [...episodes].sort((a, b) => {
      if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
      if (a.seriesOrder !== b.seriesOrder) return a.seriesOrder - b.seriesOrder;
      return a.episodeNumber - b.episodeNumber;
    });
  }, [episodes]);

  const seriesAnalysis = useMemo(() => {
    const groups = {};
    episodes.forEach(ep => {
      const cat = ep.categoryId || 'unknown';
      const ser = ep.seriesId || 'unknown';
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][ser]) groups[cat][ser] = [];
      
      const isMatch = searchTerm === '' || 
        ep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ep.seriesTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.phaseLabel.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (isMatch) groups[cat][ser].push(ep);
    });

    const currentCatGroups = groups[activeTab] || {};
    return Object.keys(currentCatGroups)
      .map(id => ({
        id,
        title: currentCatGroups[id][0]?.seriesTitle || 'Untitled Series',
        eps: currentCatGroups[id].sort((a, b) => a.episodeNumber - b.episodeNumber),
        order: currentCatGroups[id][0]?.seriesOrder || 999,
        stats: {
          total: currentCatGroups[id].length,
          published: currentCatGroups[id].filter(e => e.status === 'published').length,
          percent: Math.round((currentCatGroups[id].filter(e => e.status === 'published').length / currentCatGroups[id].length) * 100)
        }
      }))
      .sort((a, b) => a.order - b.order);
  }, [episodes, searchTerm, activeTab]);

  // --- 4. Prompt Engineering Mastery ---
  const getFullPrompt = useCallback((ep = selectedEp) => {
    if (!ep) return "";
    const idx = allEpsFlatSorted.findIndex(e => e.id === ep.id);
    const context = {
      prev: idx > 0 ? allEpsFlatSorted[idx - 1] : null,
      next: idx < allEpsFlatSorted.length - 1 ? allEpsFlatSorted[idx + 1] : null
    };

    const personas = {
      cat1: { 
        role: "PCアーキテクチャの伝道師", 
        focus: "CPU内部構造、メモリバス、命令セットレベルの技術解説", 
        style: "緻密かつ哲学的。14歳でZ80マシン語を叩いた原体験をベースにする。" 
      },
      cat2: { 
        role: "BTO要塞構築スペシャリスト", 
        focus: "省電力・高密度・排熱効率の最適化", 
        style: "実用的だが、妥協を許さないプロスペック視点。計測データを重視する。" 
      },
      cat3: { 
        role: "物理インフラ最高責任者", 
        focus: "DC級サーバーラック、電源系統、ネットワークトポロジー", 
        style: "壮大かつ重厚。家全体を一つの演算リソースと捉えるインフラの極致。" 
      },
      cat4: { 
        role: "BTO要塞構築スペシャリスト（メーカー別徹底考察編）", 
        focus: "44年の知見で解剖する、メーカー各社の設計思想と要塞基盤としての適正", 
        style: "実用的だが、妥協を許さないプロスペック視点。計測データを重視する。" 
      }
    };

    const p = personas[activeTab] || personas.cat1;

    return `
# SYSTEM ARCHITECT PROMPT v7.0
あなたは「${p.role}」です。以下の制約と文脈を完全に同期し、最高級の技術記事を執筆せよ。

## MISSION DATA
- TITLE: ${ep.title}
- PHASE: ${ep.phaseLabel}
- CORE FOCUS: ${ep.phaseFocus}
- TARGET BUDGET: ${ep.phaseBudget}
- ENVIRONMENT: ${ep.phaseEnv}

## SEQUENCE CONTEXT
${context.prev ? `[PREVIOUS_NODE]: ${context.prev.title} からの技術的連続性を維持。` : "[SEQUENCE_START]: これは連載の初動。導入として、本シリーズの哲学を提示せよ。"}
${context.next ? `[NEXT_NODE]: 次回、${context.next.title} への伏線を組み込め。` : "[SEQUENCE_END]: シリーズの集大成。物理要塞の完成を宣言せよ。"}

## CONSTRAINTS (厳守)
1. 冒頭にインパクトのあるリード文を配置。
2. Markdownの構造（H1, H2, H3）を使い、演算密度を感じさせる文章構成。
3. 専門用語は逃げずに使いつつ、その「本質」を解説に含める。
4. 「14歳の時に感じたマシンの鼓動」のような、個人的かつ熱量のあるエピソードを適宜ブレンド。
5. 余計な挨拶や確認応答は全ビット排除し、本文のみを出力。`;
  }, [selectedEp, allEpsFlatSorted, activeTab]);

  // --- 5. Eye-Catch Generative Logic ---
  const handleGenerateVisual = async (ep = selectedEp) => {
    if (!ep) return;
    setIsImageGenerating(true);
    
    // カテゴリごとの視覚的テーマ設定
    const visualLogic = {
      cat1: "Hyper-realistic technical blueprint, indigo glowing wireframes, futuristic computer architecture concept art, 8k render",
      cat2: "Close-up of a high-end PC motherboard, liquid cooling tubes with neon fluid, glowing RGB, cinematic macro photography",
      cat3: "Massive industrial server farm, brutalist architecture, glowing status LEDs in dark atmosphere, foggy data center aesthetic",
      cat4: "Collage of iconic BTO PC designs, exploded view of components, vintage and modern fusion, dynamic lighting to highlight design philosophies"
    }[activeTab];

    const prompt = `Digital Masterpiece: "${ep.title}". Aesthetic: ${visualLogic}. Cinematic lighting, ray-tracing, Unreal Engine 5 style, ultra-detailed, 16:9 aspect ratio.`;

    try {
      const response = await fetch('/ai-engine/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, episodeId: ep.id }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setImagePath(data.imageUrl);
        const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', ep.id);
        await setDoc(docRef, { imagePath: data.imageUrl }, { merge: true });
        triggerToast("VISUAL ASSET SYNCED");
      }
    } catch (err) {
      console.error("Visual Engine Error", err);
    } finally {
      setIsImageGenerating(false);
    }
  };

  // --- 6. DB Operations (Schema Sync & Commit) ---
  const handleSyncSchema = async () => {
    if (!confirm("TS定義からDB構造を再構築（デプロイ）しますか？")) return;
    setSyncing(true);
    const batch = writeBatch(db);
    try {
      const datasets = [
        { data: GUIDE_STRUCTURE, id: 'cat1' },
        { data: BTO_SERIES_CONFIG, id: 'cat2' },
        { data: BTO_FORTRESS_CONFIG, id: 'cat3' },
        { data: BTO_MAKERS_CONFIG, id: 'cat4' },
        { data: { os_history: OS_HISTORY_SERIES }, id: 'cat5' } // 追加
      ];

      datasets.forEach(set => {
        Object.entries(set.data).forEach(([sKey, sValue]: [string, any]) => {
          sValue.phases.forEach((phase: any) => {
            phase.episodes.forEach((ep: any) => {
              const docId = `${set.id}_${sValue.id}_${String(ep.ep).padStart(2, '0')}`;
              const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', docId);
              batch.set(docRef, {
                categoryId: set.id,
                seriesId: sValue.id,
                seriesTitle: sValue.title,
                seriesOrder: sValue.order || 999,
                phaseLabel: phase.label,
                phaseBudget: phase.budget || "N/A",
                phaseFocus: phase.focus || "",
                phaseEnv: phase.environment || "",
                episodeNumber: ep.ep,
                title: ep.title,
                updatedAt: serverTimestamp(),
                status: 'planned'
              }, { merge: true });
            });
          });
        });
      });
      await batch.commit();
      triggerToast("GLOBAL ARCHITECTURE DEPLOYED");
    } catch (err) { alert("SYNC FAILED"); } finally { setSyncing(false); }
  };

  const handleCommitMission = async () => {
    if (!selectedEp) return;
    try {
      const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', selectedEp.id);
      await setDoc(docRef, {
        content: editContent, amazonUrl, rakutenUrl, originalUrl, imagePath,
        status: editContent.length > 50 ? 'published' : 'planned',
        lastEdited: serverTimestamp()
      }, { merge: true });
      setView('list');
      triggerToast("DATA COMMITTED TO CLOUD");
    } catch (err) { alert("COMMIT FAILED"); }
  };

  // --- 7. Auto-Pilot Chain Reaction ---
  const runAutoPilot = async () => {
    const targets = episodes.filter(ep => 
      ep.seriesId === selectedEp?.seriesId && (!ep.content || ep.content.length < 100)
    ).sort((a, b) => a.episodeNumber - b.episodeNumber);

    if (targets.length === 0) return alert("未生成のミッションは存在しません。");
    if (!confirm(`${targets.length}件の連鎖生成を開始します。よろしいですか？`)) return;

    setIsAutoPiloting(true);
    for (let i = 0; i < targets.length; i++) {
      const ep = targets[i];
      setProgress({ 
        current: i + 1, 
        total: targets.length, 
        label: `Active Generation: ${ep.title}`,
        status: 'processing'
      });

      try {
        const res = await fetch('/ai-engine/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: getFullPrompt(ep) }),
        });
        const data = await res.json();
        if (data.text) {
          const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', ep.id);
          await setDoc(docRef, {
            content: data.text, status: 'published', lastEdited: serverTimestamp(),
            imagePath: `/images/articles/${ep.id}.webp`
          }, { merge: true });
        }
      } catch (e) { console.error("Chain Error", e); }
      
      // Rate limit bypass delay
      await new Promise(r => setTimeout(r, 2500));
    }
    setIsAutoPiloting(false);
    triggerToast("SERIES COMPLETION SUCCESSFUL");
  };

  // --- Helpers ---
  const triggerToast = (msg: string) => {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-10 py-4 rounded-full text-[11px] font-black z-[100] shadow-2xl border border-blue-400 animate-in fade-in slide-in-from-bottom-5";
    toast.innerHTML = `<div class="flex items-center gap-3"><span class="animate-ping w-2 h-2 bg-white rounded-full"></span> ${msg}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const openEditor = (ep) => {
    setSelectedEp(ep);
    setEditContent(ep.content || '');
    setAmazonUrl(ep.amazonUrl || '');
    setRakutenUrl(ep.rakutenUrl || '');
    setOriginalUrl(ep.originalUrl || '');
    setImagePath(ep.imagePath || '');
    setView('edit');
  };

  // --- Initial Loading Screen ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-blue-500 font-mono">
      <div className="relative mb-12">
        <Loader2 className="animate-spin w-24 h-24 opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Database className="w-10 h-10 animate-pulse text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <span className="text-[12px] font-black uppercase tracking-[1em] text-white/50">Establishing Uplink</span>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-2/3 animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-600/40 font-sans">
      {/* --- Ultra Header --- */}
      <nav className="sticky top-0 z-[60] bg-[#020617]/85 backdrop-blur-3xl border-b border-white/[0.03] px-12 py-6">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="relative group cursor-crosshair">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl transition-all group-hover:rotate-12 group-hover:scale-110">
                <Cpu className="text-white w-7 h-7" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-[#020617] flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">BIC Station Console <span className="text-blue-500 text-xs ml-3 not-italic font-mono border border-blue-500/30 px-2 py-0.5 rounded-md">v6.2.0-PRO</span></h1>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-md border border-emerald-500/10">
                  <Activity size={12} className="animate-pulse" /> Live_Sync: Active
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-white/10 pl-5 font-mono">
                  Node_ID: JP-STATION-MAIN-01
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden xl:block">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search series, phase, or episode..." 
                className="bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/30 w-[450px] transition-all font-mono placeholder:text-slate-800"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDebug(!showDebug)} className={`p-4 rounded-2xl border transition-all ${showDebug ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}>
                <Settings size={20} />
              </button>
              <button onClick={handleSyncSchema} disabled={syncing} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 px-8 py-4 rounded-2xl text-[11px] font-black transition-all hover:text-white shadow-xl">
                {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} ARCHITECTURE SYNC
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto p-12">
        {view === 'list' ? (
          <div className="space-y-16 animate-in fade-in duration-1000">
            {/* --- Category Selector (High-End Tabs) --- */}
            <div className="flex justify-center">
              <div className="inline-flex bg-[#0F172A] p-3 rounded-[3.5rem] border border-white/5 shadow-2xl relative">
                {[
                  {id:'cat1', l:'Tactical Guide', i:Terminal, c:'text-blue-500'}, 
                  {id:'cat2', l:'BTO Fortress', i:Layers, c:'text-indigo-500'}, 
                  {id:'cat3', l:'Physical Infra', i:Database, c:'text-emerald-500'},
                  {id:'cat4', l:'Maker Analysis', i:ShieldCheck, c:'text-yellow-500'},
                  {id:'cat5', l:'OS History', i:Server, c:'text-amber-500'}
                ].map(t => (
                  <button key={t.id} onClick={() => {setActiveTab(t.id); setOpenSeries(null);}} className={`flex items-center gap-5 px-14 py-6 rounded-[3rem] text-[13px] font-black transition-all duration-500 relative z-10 ${activeTab === t.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'}`}>
                    <t.i size={20} className={activeTab === t.id ? 'text-white' : t.c} /> {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Stats Overview Bar --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {seriesAnalysis.slice(0, 4).map((s, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                  <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{s.title.substring(0, 15)}...</div>
                    <div className="text-2xl font-black text-white italic">{s.stats.percent}%</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-blue-500" size={20} />
                  </div>
                </div>
              ))}
            </div>

            {/* --- Series Interactive Accordion --- */}
            <div className="space-y-8">
              {seriesAnalysis.map((series) => {
                const isOpen = openSeries === series.id;
                return (
                  <div key={series.id} className={`group border rounded-[4rem] overflow-hidden transition-all duration-700 ${isOpen ? 'bg-[#0F172A] border-blue-500/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] scale-[1.01]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                    <button onClick={() => setOpenSeries(isOpen ? null : series.id)} className="w-full px-16 py-14 flex items-center justify-between relative overflow-hidden group/btn">
                      {isOpen && <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />}
                      <div className="flex items-center gap-14 relative z-10">
                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${isOpen ? 'bg-blue-600 text-white rotate-6 shadow-2xl shadow-blue-600/40' : 'bg-white/5 text-slate-700'}`}>
                          <BookOpen size={44} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-4xl font-black text-slate-100 italic tracking-tighter leading-none mb-4 group-hover/btn:text-white transition-colors">{series.title}</h3>
                          <div className="flex items-center gap-8">
                            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-600/10 px-5 py-2 rounded-full border border-blue-600/20">{series.stats.total} MISSIONS LOADED</span>
                            <div className="flex items-center gap-5">
                              <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_#3b82f6]" style={{ width: `${series.stats.percent}%` }} />
                              </div>
                              <span className="text-[12px] font-mono font-bold text-slate-500">{series.stats.percent}% SYNC</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`transition-all duration-700 relative z-10 ${isOpen ? 'rotate-180 text-blue-500 scale-125' : 'text-slate-800'}`}>
                        <ChevronDown size={40} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-16 pb-20 space-y-16 animate-in slide-in-from-top-12 duration-700">
                        {/* Phase Grouping Logic */}
                        {Array.from(new Set(series.eps.map(e => e.phaseLabel))).map((label, pIdx) => {
                          const phaseEps = series.eps.filter(e => e.phaseLabel === label);
                          return (
                            <div key={label} className="space-y-10 animate-in fade-in duration-500" style={{ animationDelay: `${pIdx * 100}ms` }}>
                              <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">
                                <div className="flex items-center gap-6">
                                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                                    <Target size={20} className="animate-pulse" />
                                  </div>
                                  <h4 className="text-sm font-black uppercase tracking-[0.6em] text-slate-400">{label}</h4>
                                </div>
                                <div className="flex items-center gap-12 font-mono">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-600 uppercase font-black mb-1">Focus Point</span>
                                    <span className="text-[11px] text-slate-300 italic">{phaseEps[0].phaseFocus}</span>
                                  </div>
                                  <div className="w-px h-10 bg-white/5" />
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-600 uppercase font-black mb-1">Budget Class</span>
                                    <span className="text-[11px] text-emerald-500 font-black">{phaseEps[0].phaseBudget}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {phaseEps.map((ep) => (
                                  <div key={ep.id} onClick={() => openEditor(ep)} className="group/item relative bg-black/40 border border-white/5 rounded-[3rem] p-10 cursor-pointer hover:border-blue-500/50 hover:bg-blue-600/[0.04] transition-all hover:translate-y-[-8px] shadow-2xl">
                                    <div className="flex justify-between mb-10">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full group-hover/item:animate-ping" />
                                        <span className="text-[11px] font-mono text-slate-600 font-black tracking-widest uppercase">NODE EP.{String(ep.episodeNumber).padStart(2, '0')}</span>
                                      </div>
                                      <div className={`w-4 h-4 rounded-full transition-all duration-700 ${ep.status === 'published' ? 'bg-emerald-500 shadow-[0_0_25px_#10b981]' : 'bg-slate-900 border border-white/10'}`} />
                                    </div>
                                    <h5 className="text-[19px] font-black text-slate-200 leading-tight mb-10 group-hover/item:text-white transition-colors">{ep.title}</h5>
                                    <div className="flex gap-4 opacity-20 group-hover/item:opacity-100 transition-all duration-500">
                                      {ep.content && <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500"><Hash size={18} /></div>}
                                      {ep.imagePath && <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-500"><ImageIcon size={18} /></div>}
                                      {(ep.amazonUrl || ep.rakutenUrl) && <div className="p-2.5 bg-orange-600/10 rounded-xl text-orange-500"><ShoppingCart size={18} /></div>}
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-blue-600 rounded-full scale-x-0 group-hover/item:scale-x-100 transition-transform duration-500" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- Ultra Editor Command Center --- */
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-12 pb-64">
            {/* --- Editor Control Bar --- */}
            <div className="flex items-center justify-between">
              <button onClick={() => setView('list')} className="group flex items-center gap-8 text-slate-500 hover:text-white font-black text-[13px] uppercase tracking-[0.6em] transition-all">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xl border border-white/5 group-hover:rotate-[-10deg]">
                  <ArrowLeft size={28} />
                </div> 
                Back to Command
              </button>
              
              <div className="flex items-center gap-6">
                <button onClick={() => handleGenerateVisual()} disabled={isImageGenerating} className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] text-[12px] font-black tracking-[0.2em] transition-all shadow-2xl ${isImageGenerating ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                  {isImageGenerating ? <Loader2 className="animate-spin" size={20} /> : <Palette size={20} />} {isImageGenerating ? "VISUALIZING..." : "GENERATE ART"}
                </button>
                <button onClick={() => copyToClipboard(getFullPrompt(), "PROMPT COPIED")} className="bg-white/5 border border-white/10 text-slate-400 px-10 py-5 rounded-[2.5rem] text-[12px] font-black tracking-[0.2em] hover:text-white transition-all flex items-center gap-4"><Sparkles size={20} /> CONTEXT PULL</button>
                <div className="w-[2px] h-12 bg-white/5 mx-2" />
                <button onClick={runAutoPilot} disabled={isAutoPiloting} className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] text-[12px] font-black tracking-[0.2em] shadow-2xl transition-all ${isAutoPiloting ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20'}`}>
                  <Play size={20} className={isAutoPiloting ? 'animate-ping' : ''} /> {isAutoPiloting ? "PILOT ACTIVE" : "AUTO-PILOT SERIES"}
                </button>
                <button onClick={handleCommitMission} className="bg-blue-600 hover:bg-blue-500 text-white px-14 py-5 rounded-[2.5rem] text-[12px] font-black tracking-[0.2em] shadow-2xl shadow-blue-600/40 border border-blue-400/30 transition-all flex items-center gap-4"><Send size={20} /> DEPLOY DATA</button>
              </div>
            </div>

            {/* --- Progress HUD for Auto-Pilot --- */}
            {isAutoPiloting && (
              <div className="bg-[#0F172A] border-2 border-indigo-500/30 rounded-[4.5rem] p-16 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-24 opacity-[0.05] pointer-events-none rotate-12 scale-150"><Zap size={400} className="text-indigo-500" /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex items-center gap-10">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center border border-indigo-500/30 animate-spin-slow">
                      <Gauge size={40} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-3">Neural Link Processing...</div>
                      <div className="text-3xl font-black text-white italic tracking-tighter">{progress.label}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-7xl font-black text-indigo-500 font-mono tracking-tighter leading-none mb-3">{Math.round((progress.current/progress.total)*100)}<span className="text-2xl text-indigo-400/50">%</span></div>
                    <div className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">{progress.current} / {progress.total} SECTIONS SYNCED</div>
                  </div>
                </div>
                <div className="mt-12 w-full h-5 bg-black/50 rounded-full p-1 border border-white/5 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-400 rounded-full shadow-[0_0_40px_#6366f1] transition-all duration-1000 ease-out" style={{width:`${(progress.current/progress.total)*100}%`}} />
                </div>
              </div>
            )}

            {/* --- Detailed Mission HUD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-3 bg-[#0F172A] border border-blue-500/20 rounded-[4.5rem] p-20 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-32 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 scale-125 pointer-events-none"><Cpu size={400} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-10">
                    <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.8em] bg-blue-600/10 px-8 py-3 rounded-full border border-blue-600/20 shadow-xl shadow-blue-600/10 italic">Target Node Identified</span>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-blue-600/40 to-transparent" />
                  </div>
                  <h2 className="text-8xl font-black text-white italic tracking-tighter mb-16 leading-[0.85] drop-shadow-2xl">{selectedEp?.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
                    <div className="space-y-4">
                      <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><Layers size={20} className="text-indigo-500"/> Sequence</div>
                      <div className="text-[20px] font-black text-slate-200 tracking-tight">{selectedEp?.phaseLabel}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><DollarSign size={20} className="text-emerald-500"/> Allocation</div>
                      <div className="text-[20px] font-black text-emerald-500 tracking-tight">{selectedEp?.phaseBudget}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><Monitor size={20} className="text-blue-500"/> Core_Env</div>
                      <div className="text-[20px] font-black text-slate-200 tracking-tight">{selectedEp?.phaseEnv}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3"><Target size={20} className="text-orange-500"/> Mission_Goal</div>
                      <div className="text-[16px] font-bold text-slate-400 italic leading-relaxed">{selectedEp?.phaseFocus}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-[4.5rem] p-16 flex flex-col justify-between relative shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/[0.02] transition-all duration-700" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] -rotate-12 transition-transform duration-1000 group-hover:rotate-0"><ShieldCheck size={180} /></div>
                <div className="relative z-10">
                  <div className="text-[12px] font-black text-slate-700 uppercase tracking-[0.5em] mb-12 flex items-center gap-4"><Clock size={20} /> Archive Status</div>
                  <div className="space-y-12">
                    <div className="group/item2">
                      <div className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest group-hover/item2:text-blue-500 transition-colors">Data Integrity</div>
                      <div className="flex items-center gap-4 text-emerald-500 text-[14px] font-black tracking-[0.3em] bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" /> VERIFIED
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Authority Node</div>
                      <div className="text-lg font-mono text-slate-300 font-black flex items-center gap-4"><div className="p-2 bg-white/5 rounded-xl"><Server size={18} className="text-blue-500" /></div> STATION_ADMIN</div>
                    </div>
                  </div>
                </div>
                <div className="text-[54px] font-black text-white/5 font-mono italic tracking-tighter leading-none mt-16 border-t border-white/[0.03] pt-12">FS-CORE-01</div>
              </div>
            </div>

            {/* --- Integration Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                {l:'Amazon Node', v:amazonUrl, s:setAmazonUrl, i:ShoppingCart, c:'text-orange-500'},
                {l:'Rakuten Node', v:rakutenUrl, s:setRakutenUrl, i:ShoppingCart, c:'text-red-500'},
                {l:'External Archive', v:originalUrl, s:setOriginalUrl, i:LinkIcon, c:'text-blue-500'},
                {l:'Visual Asset Path', v:imagePath, s:setImagePath, i:ImageIcon, c:'text-emerald-500'}
              ].map((f, i) => (
                <div key={i} className="bg-[#0F172A]/70 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-600/40 transition-all shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-5 mb-8 text-[12px] font-black uppercase text-slate-600 tracking-[0.4em] transition-colors group-hover:text-slate-300">
                    <f.i size={20} className={f.c} /> {f.l}
                  </div>
                  <input 
                    type="text" value={f.v} onChange={e => f.s(e.target.value)} 
                    placeholder="WAITING FOR URI..." 
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-8 py-5 text-[14px] font-mono text-blue-400 outline-none focus:border-blue-600/60 transition-all placeholder:text-slate-900" 
                  />
                </div>
              ))}
            </div>

            {/* --- Main Workspace Dual-Pane --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 min-h-[1000px]">
              {/* Writer Interface */}
              <div className="flex flex-col bg-[#0F172A] border border-white/10 rounded-[5rem] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.7)] overflow-hidden relative group/editor">
                <div className="absolute inset-0 bg-blue-600/[0.01] pointer-events-none group-focus-within/editor:bg-blue-600/[0.04] transition-all duration-1000" />
                <div className="px-16 py-12 bg-white/[0.03] border-b border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-8 text-[14px] font-black uppercase tracking-[0.7em] text-slate-400"><Code2 size={28} className="text-blue-500" /> Neural Flow Stream</div>
                  <div className="flex items-center gap-6">
                    <div className="text-blue-500 animate-pulse font-mono text-[12px] tracking-[0.5em] font-black uppercase">Core_Locked</div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" />
                  </div>
                </div>
                <textarea 
                  value={editContent} onChange={e => setEditContent(e.target.value)} 
                  className="flex-grow w-full bg-transparent p-24 outline-none text-slate-200 font-mono text-[20px] leading-relaxed resize-none scrollbar-hide relative z-10 transition-all duration-1000 placeholder:text-slate-900" 
                  placeholder="# 物理要塞の設計思想を、ここに定義せよ..." 
                />
                <div className="p-8 bg-black/20 text-[10px] font-mono text-slate-600 flex justify-between border-t border-white/5">
                  <span>CHAR_COUNT: {editContent.length}</span>
                  <span>SYNC_STATUS: LOCAL_READY</span>
                </div>
              </div>

              {/* Preview Atmosphere */}
              <div className="flex flex-col bg-[#020617] border border-white/5 rounded-[5rem] shadow-inner overflow-hidden relative group/preview shadow-2xl">
                <div className="px-16 py-12 bg-white/[0.03] border-b border-white/5 flex items-center gap-8 text-[14px] font-black uppercase tracking-[0.7em] text-slate-400"><Eye size={28} className="text-emerald-500" /> Atmosphere Projection</div>
                <div className="flex-grow overflow-y-auto p-28 custom-prose scrollbar-hide bg-gradient-to-b from-transparent via-transparent to-blue-900/[0.06] relative z-10">
                  
                  {/* Eye-Catch Projection */}
                  <div className="relative mb-28 rounded-[4.5rem] overflow-hidden border-2 border-white/10 aspect-video bg-black flex items-center justify-center group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]">
                    {imagePath ? (
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] group-hover:scale-110 group-hover:rotate-1" style={{ backgroundImage: `url(${imagePath})` }} />
                    ) : (
                      <div className="text-slate-900 flex flex-col items-center gap-10 opacity-20"><HardDrive size={100} strokeWidth={1} /><span className="text-[14px] font-black tracking-[1.2em] uppercase">Visual_Node_Offline</span></div>
                    )}
                    
                    {isImageGenerating && (
                      <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-10 z-30 animate-in fade-in duration-700">
                        <div className="relative">
                          <Loader2 className="animate-spin text-white w-24 h-24 opacity-30" />
                          <div className="absolute inset-0 flex items-center justify-center"><Palette className="text-white animate-bounce w-8 h-8" /></div>
                        </div>
                        <span className="text-[14px] font-black text-white tracking-[1em] animate-pulse uppercase">Rendering_Architecture...</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-14 left-14 right-14 flex justify-between items-end">
                      <div className="text-[12px] font-mono text-white/50 tracking-[0.4em] bg-black/70 backdrop-blur-2xl px-10 py-4 rounded-full border border-white/10 uppercase italic">RESOURCE: {imagePath || 'NULL'}</div>
                      <div className="text-blue-600/40 font-black italic text-2xl tracking-tighter uppercase">STATION VISUAL CORE</div>
                    </div>
                  </div>

                  <h1 className="text-9xl font-black text-white mb-24 italic tracking-tighter border-l-[30px] border-blue-700 pl-20 leading-[0.8] drop-shadow-2xl">{selectedEp?.title}</h1>
                  <div className="whitespace-pre-wrap text-slate-400 leading-[2.2] text-3xl font-light tracking-wide font-sans mb-40 transition-all">
                    {editContent || (
                      <div className="space-y-12 opacity-5 animate-pulse">
                        <div className="h-12 bg-white rounded-full w-full" />
                        <div className="h-12 bg-white rounded-full w-[95%]" />
                        <div className="h-12 bg-white rounded-full w-[85%]" />
                        <div className="h-12 bg-white rounded-full w-[90%]" />
                      </div>
                    )}
                  </div>

                  {/* Affiliate Component Infrastructure */}
                  {(amazonUrl || rakutenUrl) && (
                    <div className="mt-40 pt-24 border-t border-white/10 relative">
                      <div className="absolute -top-8 left-16 bg-[#020617] px-10 text-[14px] font-black text-slate-500 uppercase tracking-[0.8em] flex items-center gap-5 border border-white/10 rounded-full py-3 shadow-2xl"><Flame size={24} className="text-orange-500" /> Physical Components</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {amazonUrl && (
                          <div className="px-12 py-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between group/link hover:bg-orange-600/5 hover:border-orange-600/20 transition-all cursor-pointer shadow-xl">
                            <div className="flex items-center gap-8"><ShoppingCart size={32} className="text-orange-500"/><span className="text-[18px] font-black text-slate-300 italic group-hover/link:text-orange-400">Amazon Fortress Gateway</span></div>
                            <ChevronRight size={28} className="text-slate-800 group-hover/link:text-orange-500 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                          </div>
                        )}
                        {rakutenUrl && (
                          <div className="px-12 py-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between group/link hover:bg-red-600/5 hover:border-red-600/20 transition-all cursor-pointer shadow-xl">
                            <div className="flex items-center gap-8"><ShoppingCart size={32} className="text-red-500"/><span className="text-[18px] font-black text-slate-300 italic group-hover/link:text-red-400">Rakuten Fortress Gateway</span></div>
                            <ChevronRight size={28} className="text-slate-800 group-hover/link:text-red-500 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Global Architect Styles --- */}
      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loading { 0% { transform: translateX(-100%); } 50% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 14px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 7px; border: 4px solid #020617; transition: all 0.3s; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        ::selection { background: rgba(37, 99, 235, 0.5); color: white; }
        .custom-prose h1, .custom-prose h2 { font-style: italic; letter-spacing: -0.06em; }
        textarea { caret-color: #3b82f6; }
      `}</style>
    </div>
  );
};

export default ContentConsole;