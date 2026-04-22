"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  serverTimestamp, writeBatch, query, orderBy 
} from "firebase/firestore";
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from "firebase/auth";
import { 
  Database, UploadCloud, Loader2, Layers, Search, 
  Edit3, ArrowLeft, Send, ChevronRight, BookOpen, ChevronDown, Terminal,
  Cpu, Zap, Globe, Copy, Sparkles, ShoppingCart, Image as ImageIcon, Link as LinkIcon,
  Target, DollarSign, Monitor, Wand2, Play, Activity, CheckCircle2, AlertTriangle, 
  Settings, Save, Eye, Hash, Clock
} from 'lucide-react';

// データ構造のインポート
import { GUIDE_STRUCTURE } from '@/content-data/category1_guide_structure';  
import { BTO_SERIES_CONFIG } from '@/content-data/category2_bto_series';
import { BTO_FORTRESS_CONFIG } from '@/content-data/category3_bto_fortess';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });

  const [view, setView] = useState<'list' | 'edit'>('list'); 
  const [selectedEp, setSelectedEp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // Input States
  const [amazonUrl, setAmazonUrl] = useState('');
  const [rakutenUrl, setRakutenUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [imagePath, setImagePath] = useState('');

  const [activeTab, setActiveTab] = useState('cat1');
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // --- Auth & Initial Sync ---
  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
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

  // --- Logic: Sorting & Grouping ---
  const allEpsFlatSorted = useMemo(() => {
    return [...episodes].sort((a, b) => {
      if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
      if (a.seriesOrder !== b.seriesOrder) return a.seriesOrder - b.seriesOrder;
      return a.episodeNumber - b.episodeNumber;
    });
  }, [episodes]);

  const sortedSeriesList = useMemo(() => {
    const groups = {};
    episodes.forEach(ep => {
      const cat = ep.categoryId || 'unknown';
      const ser = ep.seriesId || 'unknown';
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][ser]) groups[cat][ser] = [];
      const matchSearch = searchTerm === '' || 
        ep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ep.seriesTitle.toLowerCase().includes(searchTerm.toLowerCase());
      if (matchSearch) groups[cat][ser].push(ep);
    });
    const currentCatGroups = groups[activeTab] || {};
    return Object.keys(currentCatGroups)
      .map(id => ({
        id,
        eps: currentCatGroups[id].sort((a, b) => a.episodeNumber - b.episodeNumber),
        order: currentCatGroups[id][0]?.seriesOrder || 999 
      }))
      .sort((a, b) => a.order - b.order);
  }, [episodes, searchTerm, activeTab]);

  // --- Helper: Copy & Notifications ---
  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.createElement('div');
      toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full text-xs font-black z-[100] shadow-2xl animate-bounce";
      toast.innerText = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });
  };

  // --- AI Prompt Engine (Logic intensive) ---
  const getFullPrompt = useCallback((ep = selectedEp) => {
    if (!ep) return "";
    const currentIndex = allEpsFlatSorted.findIndex(e => e.id === ep.id);
    const prevEp = currentIndex > 0 ? allEpsFlatSorted[currentIndex - 1] : null;
    const nextEp = currentIndex < allEpsFlatSorted.length - 1 ? allEpsFlatSorted[currentIndex + 1] : null;

    const persona = {
      cat1: { role: "PCアーキテクチャの伝道師", tone: "論理的かつ情熱的", goal: "読者の思考をアップデートし、本質を見抜く視座を与える" },
      cat2: { role: "環境構築のスペシャリスト", tone: "実用的かつ緻密", goal: "省電力・小型・高効率な究極の作業環境を設計する" },
      cat3: { role: "物理要塞の最高責任者", tone: "壮大かつ重厚", goal: "家全体を計算リソースとする、物理インフラの極致を提示する" }
    }[activeTab] || { role: "テクニカルライター", tone: "丁寧", goal: "技術解説" };

    return `
# システム命令
あなたは「${persona.role}」として、以下の文脈を完全に理解し、最高級の技術解説記事を【日本語】のみで執筆してください。
Markdown形式で、冒頭からタイトル・リード文・本文を出力してください。

## 記事基本情報
- タイトル: ${ep.title}
- シリーズ: ${ep.seriesTitle}
- フェーズ: ${ep.phaseLabel} (予算: ${ep.phaseBudget})
- 注力領域: ${ep.phaseFocus}
- 環境条件: ${ep.phaseEnv}

## 文脈(Context)
${prevEp ? `・前回の記事内容: ${prevEp.title}` : '・これは連載の初回記事です。'}
${nextEp ? `・次回の予告内容: ${nextEp.title}` : '・これは連載の最終回です。'}

## 執筆ガイドライン
1. 14歳のマシン語体験に基づく、ハードウェアへの狂信的なこだわりを込める。
2. 「演算密度の最大化」を軸にした独自の哲学を展開する。
3. 日本語の美しさと技術用語の正確さを両立させる。
4. 読者の知的好奇心を刺激する「洞察」を必ず含める。
5. 余計な前置き（「了解しました」「執筆を開始します」等）は一切禁止。`;
  }, [selectedEp, allEpsFlatSorted, activeTab]);

  const generateImagePrompt = () => {
    if (!selectedEp) return;
    const p = `(Professional Digital Art:1.3), ${selectedEp.title}, PC hardware fortress, cybernetic architecture, brutalism, hyper-realistic, 8k, volumetric light, blueprints in background, indigo and white theme --ar 16:9`;
    copyToClipboard(p, "IMAGE PROMPT READY");
  };

  // --- Handlers: DB Operations ---
  const handleSyncBlueprints = async () => {
    if (!confirm("設計図(TS)をDBにデプロイしますか？")) return;
    setSyncing(true);
    const batch = writeBatch(db);
    try {
      const dataSets = [
        { data: GUIDE_STRUCTURE, id: 'cat1' },
        { data: BTO_SERIES_CONFIG, id: 'cat2' },
        { data: BTO_FORTRESS_CONFIG, id: 'cat3' }
      ];
      
      dataSets.forEach(set => {
        Object.values(set.data).forEach((series: any) => {
          series.phases.forEach((phase: any) => {
            phase.episodes.forEach((ep: any) => {
              const docId = `${set.id}_${series.id}_${String(ep.ep).padStart(2, '0')}`;
              const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', docId);
              batch.set(docRef, {
                categoryId: set.id,
                seriesId: series.id,
                seriesTitle: series.title,
                seriesOrder: series.order || 999,
                phaseLabel: phase.label,
                phaseBudget: phase.budget || "ASK",
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
      alert("ARCHITECTURE SYNCED SUCCESSFULLY");
    } catch (err) { alert("SYNC ERROR"); } finally { setSyncing(false); }
  };

  const handleSave = async () => {
    if (!selectedEp) return;
    try {
      const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', selectedEp.id);
      await setDoc(docRef, {
        content: editContent,
        amazonUrl,
        rakutenUrl,
        originalUrl,
        imagePath,
        status: editContent.length > 100 ? 'published' : 'planned',
        lastEdited: serverTimestamp()
      }, { merge: true });
      setView('list');
    } catch (err) { alert("SAVE FAILED"); }
  };

  // --- Auto-Pilot Engine ---
  const runAutoPilot = async () => {
    const targets = episodes.filter(ep => 
      ep.seriesId === selectedEp?.seriesId && (!ep.content || ep.content.length < 50)
    ).sort((a, b) => a.episodeNumber - b.episodeNumber);

    if (targets.length === 0) return alert("未執筆のエピソードが見つかりません。");
    if (!confirm(`${targets.length}件の未執筆分を自動生成し、DBへ直接保存しますか？`)) return;

    setIsAutoPiloting(true);
    setProgress({ current: 0, total: targets.length, label: 'Initializing...' });

    for (let i = 0; i < targets.length; i++) {
      const ep = targets[i];
      setProgress({ current: i + 1, total: targets.length, label: `Generating: ${ep.title}` });
      
      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: getFullPrompt(ep) }),
        });
        const data = await res.json();
        
        if (data.text) {
          const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', ep.id);
          await setDoc(docRef, {
            content: data.text,
            status: 'published',
            lastEdited: serverTimestamp(),
            imagePath: `/images/articles/${ep.id}.webp`
          }, { merge: true });
        }
      } catch (e) { console.error("Pilot Error", e); }
      await new Promise(r => setTimeout(r, 2000)); // Rate limit bypass
    }
    
    setIsAutoPiloting(false);
    alert("AUTO-PILOT COMPLETE");
  };

  // --- UI Components ---
  const openEditor = (ep) => {
    setSelectedEp(ep);
    setEditContent(ep.content || '');
    setAmazonUrl(ep.amazonUrl || '');
    setRakutenUrl(ep.rakutenUrl || '');
    setOriginalUrl(ep.originalUrl || '');
    setImagePath(ep.imagePath || `/images/articles/${ep.id}.webp`);
    setView('edit');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-blue-500 font-mono">
      <div className="relative">
        <Loader2 className="animate-spin w-20 h-20 opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="animate-pulse" />
        </div>
      </div>
      <span className="mt-8 tracking-[0.5em] text-[10px] font-black uppercase animate-pulse">Establishing Fortress Connection...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/40">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/[0.03] px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Station Console <span className="text-blue-500 text-xs ml-2 not-italic font-mono">v4.5.2</span></h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> System Online
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest border-l border-white/10 pl-3">
                  Node: JP-EAST-01
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Archives..." 
                className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-6 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-64 transition-all"
              />
            </div>
            <button 
              onClick={handleSyncBlueprints} 
              disabled={syncing}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all"
            >
              {syncing ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />} 
              SYNC SCHEMA
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-10">
        {view === 'list' ? (
          <div className="space-y-12">
            {/* Tab Navigation */}
            <div className="flex justify-center">
              <div className="inline-flex bg-[#0F172A] p-2 rounded-3xl border border-white/5 shadow-inner">
                {[
                  { id: 'cat1', label: 'Guide Strategy', icon: Terminal, color: 'text-blue-500' },
                  { id: 'cat2', label: 'BTO Fortress', icon: Layers, color: 'text-indigo-500' },
                  { id: 'cat3', label: 'Physical Infra', icon: Database, color: 'text-emerald-500' }
                ].map((tab) => (
                  <button 
                    key={tab.id} 
                    onClick={() => { setActiveTab(tab.id); setOpenSeries(null); }}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all ${
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : tab.color} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Series Grid */}
            <div className="grid grid-cols-1 gap-6">
              {sortedSeriesList.map(({ id: seriesId, eps: seriesEps }) => {
                const isOpen = openSeries === seriesId;
                const publishedCount = seriesEps.filter(e => e.status === 'published').length;
                const progressPercent = Math.round((publishedCount / seriesEps.length) * 100);

                return (
                  <div key={seriesId} className={`group border rounded-[2rem] transition-all overflow-hidden ${
                    isOpen ? 'bg-[#0F172A] border-blue-500/30 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}>
                    <button 
                      onClick={() => setOpenSeries(isOpen ? null : seriesId)} 
                      className="w-full px-10 py-8 flex items-center justify-between group-hover:bg-white/[0.01]"
                    >
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                          isOpen ? 'bg-blue-600 text-white rotate-3 shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-500'
                        }`}>
                          <BookOpen size={28} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-2xl text-slate-100 italic tracking-tight">{seriesEps[0]?.seriesTitle}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
                              {seriesEps.length} EPISODES
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{progressPercent}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {progressPercent === 100 && <CheckCircle2 className="text-emerald-500" size={20} />}
                        {isOpen ? <ChevronDown className="text-blue-400" /> : <ChevronRight className="text-slate-700" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-10 pb-10 space-y-8 animate-in slide-in-from-top-4 duration-500">
                        {/* Grouped by Phase */}
                        {Array.from(new Set(seriesEps.map(e => e.phaseLabel))).map(label => {
                          const phaseEps = seriesEps.filter(e => e.phaseLabel === label);
                          return (
                            <div key={label} className="space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-3">
                                  <Target size={14} className="text-blue-500" />
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{label}</h4>
                                </div>
                                <span className="text-[10px] font-mono text-slate-600 italic">{phaseEps[0].phaseFocus}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {phaseEps.map((ep) => (
                                  <div 
                                    key={ep.id} 
                                    onClick={() => openEditor(ep)}
                                    className="group/item relative bg-black/40 border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
                                  >
                                    <div className="flex justify-between items-start mb-4">
                                      <span className="text-[10px] font-mono text-slate-600 font-black">#EP.{String(ep.episodeNumber).padStart(2, '0')}</span>
                                      <div className={`w-2 h-2 rounded-full ${ep.status === 'published' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
                                    </div>
                                    <h5 className="text-[13px] font-bold text-slate-200 group-hover/item:text-white leading-snug">{ep.title}</h5>
                                    <div className="flex gap-2 mt-4 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                      {ep.content && <Hash size={12} className="text-blue-400" />}
                                      {ep.amazonUrl && <ShoppingCart size={12} className="text-orange-500" />}
                                      {ep.imagePath && <ImageIcon size={12} className="text-emerald-400" />}
                                    </div>
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
          /* --- Editor View --- */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-32">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('list')} 
                className="group flex items-center gap-4 text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-[0.3em] transition-all"
              >
                <div className="p-3.5 bg-white/5 rounded-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all">
                  <ArrowLeft size={18} />
                </div>
                Return to Command
              </button>
              
              <div className="flex items-center gap-3">
                <button onClick={generateImagePrompt} className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all">
                  <Wand2 size={16} /> IMAGE PROMPT
                </button>
                <button onClick={() => copyToClipboard(getFullPrompt(), "AI PROMPT COPIED")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all">
                  <Copy size={16} /> COPY AI CONTEXT
                </button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <button 
                  onClick={runAutoPilot} 
                  disabled={isAutoPiloting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
                    isAutoPiloting ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  <Play size={16} /> {isAutoPiloting ? "AUTO-PILOT RUNNING" : "AUTO-PILOT SERIES"}
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest shadow-2xl shadow-blue-500/30 transition-all"
                >
                  <Send size={16} /> DEPLOY CONTENT
                </button>
              </div>
            </div>

            {/* Progress Bar for Auto-Pilot */}
            {isAutoPiloting && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-center gap-4">
                    <Activity className="text-indigo-400 animate-spin-slow" />
                    <div>
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Neural Chain Processing</div>
                      <div className="text-lg font-bold text-white italic">{progress.label}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-400 font-mono tracking-tighter">
                      {Math.round((progress.current / progress.total) * 100)}%
                    </div>
                    <div className="text-[10px] font-bold text-slate-600">{progress.current} / {progress.total} COMPLETE</div>
                  </div>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Context Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-[#0F172A] border border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-1000 rotate-12">
                  <Cpu size={240} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">Active Mission</span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {selectedEp?.id}</span>
                  </div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter mb-10 leading-none">{selectedEp?.title}</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Layers size={14} className="text-indigo-500"/> Phase</div>
                      <div className="text-[13px] font-bold text-slate-200">{selectedEp?.phaseLabel}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><DollarSign size={14} className="text-emerald-500"/> Budget</div>
                      <div className="text-[13px] font-bold text-slate-200">{selectedEp?.phaseBudget}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Monitor size={14} className="text-blue-500"/> Environment</div>
                      <div className="text-[13px] font-bold text-slate-200">{selectedEp?.phaseEnv}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Target size={14} className="text-orange-500"/> Focus</div>
                      <div className="text-[11px] font-bold text-slate-400 italic leading-snug">{selectedEp?.phaseFocus}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Timing */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={12} /> Timeline Metrics
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">First Draft Created</div>
                      <div className="text-xs font-mono text-slate-300">2026.04.12 14:22</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Current Sync Status</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-black text-emerald-500">ENCRYPTED & SYNCED</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="text-[32px] font-black text-white/10 font-mono tracking-tighter">STATION-01</div>
                </div>
              </div>
            </div>

            {/* Input Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Amazon Affiliate', val: amazonUrl, set: setAmazonUrl, icon: ShoppingCart, color: 'text-orange-500' },
                { label: 'Rakuten Affiliate', val: rakutenUrl, set: setRakutenUrl, icon: ShoppingCart, color: 'text-red-500' },
                { label: 'External Source', val: originalUrl, set: setOriginalUrl, icon: LinkIcon, color: 'text-blue-500' },
                { label: 'Static Asset Path', val: imagePath, set: setImagePath, icon: ImageIcon, color: 'text-emerald-500' },
              ].map((field, i) => (
                <div key={i} className="bg-[#0F172A]/50 border border-white/5 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    <field.icon size={14} className={field.color} /> {field.label}
                  </div>
                  <input 
                    type="text" 
                    value={field.val} 
                    onChange={(e) => field.set(e.target.value)} 
                    placeholder="Enter URI..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-[11px] font-mono text-blue-400 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800" 
                  />
                </div>
              ))}
            </div>

            {/* Core Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[700px]">
              {/* Editor Pane */}
              <div className="flex flex-col bg-[#0F172A] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                <div className="px-10 py-6 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500"><Edit3 size={18} /></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Content Stream</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-mono text-slate-600 bg-black/30 px-3 py-1 rounded-lg">
                      Tokens: ~{Math.round(editContent.length / 1.5)}
                    </div>
                    <div className="text-[10px] font-black text-blue-500 animate-pulse">● LIVE_EDITING</div>
                  </div>
                </div>
                <textarea 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)} 
                  className="flex-grow w-full bg-transparent p-12 outline-none text-slate-300 leading-relaxed resize-none font-mono text-[15px] scrollbar-hide focus:bg-blue-500/[0.01] transition-all" 
                  placeholder="# 執筆マニフェストをここに記述..." 
                />
              </div>

              {/* Preview Pane */}
              <div className="flex flex-col bg-[#020617] border border-white/5 rounded-[3rem] shadow-inner overflow-hidden relative">
                <div className="px-10 py-6 bg-white/[0.03] border-b border-white/5 flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-500"><Eye size={18} /></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Atmospheric Preview</span>
                </div>
                <div className="flex-grow overflow-y-auto p-16 custom-prose scrollbar-hide bg-gradient-to-b from-transparent to-blue-900/[0.03]">
                  {/* Hero Image Section */}
                  <div className="relative mb-16 rounded-[2.5rem] overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center group shadow-2xl">
                    {imagePath ? (
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${imagePath})` }} />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center gap-4 opacity-50">
                        <ImageIcon size={48} className="text-slate-800" />
                        <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">No Image Bound</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-8 left-8 text-[10px] font-mono text-white/40 tracking-widest bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 uppercase">
                      Asset Path: {imagePath || 'null'}
                    </div>
                  </div>

                  <h1 className="text-6xl font-black text-white mb-12 italic tracking-tighter border-l-[12px] border-blue-600 pl-10 leading-[0.9]">{selectedEp?.title}</h1>
                  
                  <div className="whitespace-pre-wrap text-slate-400 leading-loose text-xl font-light font-sans tracking-wide">
                    {editContent || (
                      <div className="space-y-6 opacity-10 animate-pulse">
                        <div className="h-6 bg-white rounded-full w-full" />
                        <div className="h-6 bg-white rounded-full w-[90%]" />
                        <div className="h-6 bg-white rounded-full w-[95%]" />
                        <div className="h-6 bg-white rounded-full w-[80%]" />
                      </div>
                    )}
                  </div>

                  {/* Affiliate Section Preview */}
                  {(amazonUrl || rakutenUrl) && (
                    <div className="mt-20 pt-10 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8">Related Infrastructure</h4>
                      <div className="flex gap-4">
                        {amazonUrl && <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-xs font-bold text-orange-400 italic"><ShoppingCart size={14}/> Amazon Fortress Link</div>}
                        {rakutenUrl && <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-400 italic"><ShoppingCart size={14}/> Rakuten Fortress Link</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-prose h1 { line-height: 0.9; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 5px; border: 3px solid #020617; }
        ::selection { background: rgba(37, 99, 235, 0.5); color: white; }
      `}</style>
    </div>
  );
};

export default ContentConsole;