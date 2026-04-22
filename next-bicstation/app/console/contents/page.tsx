"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  serverTimestamp, writeBatch 
} from "firebase/firestore";
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from "firebase/auth";
import { 
  Database, UploadCloud, Loader2, Layers, Search, 
  Edit3, ArrowLeft, Send, ChevronRight, BookOpen, ChevronDown, Terminal
} from 'lucide-react';

// --- 設計図データのインポート ---
import { GUIDE_STRUCTURE } from '@/content-data/category1_guide_structure';  
import { BTO_SERIES_CONFIG } from '@/content-data/category2_bto_series';
import { BTO_FORTRESS_CONFIG } from '@/content-data/category3_bto_fortess';

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
  const [user, setUser] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState('list'); 
  const [selectedEp, setSelectedEp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editContent, setEditContent] = useState('');

  // UI状態管理：初期値をcat1に変更
  const [activeTab, setActiveTab] = useState('cat1');
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // 1. 認証
  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
  }, []);

  // 2. データリアルタイム購読
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

  // 3. 階層構造へのデータ整形
  const groupedContent = useMemo(() => {
    const groups = {};
    episodes.forEach(ep => {
      const cat = ep.categoryId || 'unknown';
      const ser = ep.seriesId || 'unknown';
      
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][ser]) groups[cat][ser] = [];

      const matchSearch = searchTerm === '' || 
        ep.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ep.seriesTitle.toLowerCase().includes(searchTerm.toLowerCase());

      if (matchSearch) {
        groups[cat][ser].push(ep);
      }
    });

    Object.keys(groups).forEach(c => {
      Object.keys(groups[c]).forEach(s => {
        groups[c][s].sort((a, b) => a.episodeNumber - b.episodeNumber);
      });
    });
    return groups;
  }, [episodes, searchTerm]);

  // 同期ロジック
  const handleSyncBlueprints = async () => {
    if (!confirm("設計図(TS)をDBに同期します。本文は保持されます。")) return;
    setSyncing(true);
    const batch = writeBatch(db);

    try {
      const configs = [
        { data: GUIDE_STRUCTURE, catId: 'cat1' },
        { data: BTO_SERIES_CONFIG, catId: 'cat2' },
        { data: BTO_FORTRESS_CONFIG, catId: 'cat3' },
      ];

      configs.forEach(({ data, catId }) => {
        Object.values(data).forEach((series: any) => {
          series.phases.forEach((phase: any) => {
            phase.episodes.forEach((ep: any) => {
              const docId = `${catId}_${series.id}_${String(ep.ep).padStart(2, '0')}`;
              const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', docId);
              batch.set(docRef, {
                categoryId: catId,
                seriesId: series.id,
                seriesTitle: series.title,
                phaseLabel: phase.label,
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
      alert("同期完了。反映されない場合はリロードしてください。");
    } catch (err) {
      alert("同期エラー");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedEp) return;
    try {
      const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'episodes', selectedEp.id);
      await setDoc(docRef, {
        content: editContent,
        status: editContent.length > 50 ? 'published' : 'planned',
        lastEdited: serverTimestamp()
      }, { merge: true });
      alert("保存しました。");
      setView('list');
    } catch (err) {
      alert("エラー");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-blue-500 font-mono">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <span className="tracking-[0.3em] animate-pulse">CONNECTING TO STATION...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter text-white italic text-shadow-sm">STATION COMMAND</h1>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span className="text-emerald-500 animate-pulse">●</span> Active Protocol 3.5
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSyncBlueprints}
            disabled={syncing}
            className="flex items-center gap-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all active:scale-95"
          >
            {syncing ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud size={16} />}
            SYNC ARCHITECTURE
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 pb-24">
        {view === 'list' ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Category Navigation - 修正ポイント: cat1を追加 */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5 shadow-inner">
                {[
                  { id: 'cat1', label: 'ガイド・構造', icon: Terminal },
                  { id: 'cat2', label: 'PCビルドの聖典', icon: Layers },
                  { id: 'cat3', label: '物理要塞の構築', icon: Database }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setOpenSeries(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[11px] font-black transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text"
                placeholder="高速検索..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Accordion Series List */}
            <div className="space-y-4">
              {groupedContent[activeTab] && Object.keys(groupedContent[activeTab]).length > 0 ? (
                Object.keys(groupedContent[activeTab]).map(seriesId => {
                  const seriesEps = groupedContent[activeTab][seriesId];
                  const isOpen = openSeries === seriesId;
                  const doneCount = seriesEps.filter(e => e.status === 'published').length;
                  const progressPercent = Math.round((doneCount / seriesEps.length) * 100);

                  return (
                    <div key={seriesId} className={`group border rounded-3xl transition-all duration-300 ${
                      isOpen ? 'bg-[#0F172A] border-blue-500/30 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}>
                      <button 
                        onClick={() => setOpenSeries(isOpen ? null : seriesId)}
                        className="w-full px-8 py-6 flex items-center justify-between outline-none"
                      >
                        <div className="flex items-center gap-5 text-left">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            isOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'
                          }`}>
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-slate-100 group-hover:text-blue-400 transition-colors">
                              {seriesEps[0]?.seriesTitle}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-mono text-slate-600 uppercase">ID: {seriesId}</span>
                              <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                                {seriesEps.length} EPISODES
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="hidden md:block text-right">
                            <div className="text-[10px] font-black text-slate-500 mb-1">{progressPercent}% COMPLETED</div>
                            <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px]">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                          {isOpen ? <ChevronDown className="text-blue-400" /> : <ChevronRight className="text-slate-700" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-black/20 rounded-2xl overflow-hidden divide-y divide-white/[0.03]">
                            {seriesEps.map(ep => (
                              <div 
                                key={ep.id}
                                onClick={() => { setSelectedEp(ep); setEditContent(ep.content || ''); setView('edit'); }}
                                className="flex items-center gap-5 px-6 py-4 hover:bg-blue-600/10 cursor-pointer group/item transition-all"
                              >
                                <span className="text-[11px] font-mono text-slate-600 w-8 group-hover/item:text-blue-500 transition-colors">#{String(ep.episodeNumber).padStart(2, '0')}</span>
                                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  ep.status === 'published' 
                                    ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                    : 'bg-slate-800'
                                }`} />
                                <div className="flex-grow">
                                  <div className={`text-[14px] font-bold ${ep.status === 'published' ? 'text-slate-200' : 'text-slate-500'} group-hover/item:text-white`}>
                                    {ep.title}
                                  </div>
                                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{ep.phaseLabel}</div>
                                </div>
                                <Edit3 size={14} className="text-slate-700 opacity-0 group-hover/item:opacity-100 transition-all" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 bg-white/[0.01] rounded-[3rem] border border-dashed border-white/5">
                  <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">NO DATA DETECTED IN {activeTab}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EDITOR VIEW */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView('list')} 
                className="group flex items-center gap-3 text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
              >
                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg"><ArrowLeft size={16} /></div>
                Back to Command
              </button>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">{selectedEp?.seriesTitle}</div>
                  <div className="text-lg font-black text-white leading-none tracking-tight">{selectedEp?.title}</div>
                </div>
                <button 
                  onClick={handleSaveContent}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-500/40 transition-all active:scale-95"
                >
                  <Send size={16} />
                  DEPLOY CONTENT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
              <div className="flex flex-col bg-[#0F172A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
                <div className="px-8 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Edit3 size={14} className="text-blue-500" /> Editor
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">{editContent.length} CHARS</div>
                </div>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-grow w-full bg-transparent p-10 outline-none text-slate-300 leading-relaxed resize-none font-mono text-sm scrollbar-hide"
                />
              </div>

              <div className="flex flex-col bg-[#020617] border border-white/5 rounded-[2.5rem] shadow-inner overflow-hidden">
                <div className="px-8 py-4 bg-white/[0.03] border-b border-white/5 flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
                </div>
                <div className="flex-grow overflow-y-auto p-12 custom-prose scrollbar-hide">
                  <h1 className="text-4xl font-black text-white mb-6 italic tracking-tighter leading-tight border-l-4 border-blue-600 pl-6">
                    {selectedEp?.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-12">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                      {selectedEp?.phaseLabel}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-400 leading-relaxed text-lg font-light">
                    {editContent || <span className="opacity-20 italic">待機中... 執筆を開始してください。</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-prose h1 { font-size: 2.5rem; margin-bottom: 2rem; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ContentConsole;