"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Send, Save, Eye, Edit3, Wand2, Settings, Layout, ChevronRight, 
  AlertCircle, CheckCircle2, Terminal, Database, Cpu, Loader2,
  Layers, Hash, Type, Plus, ListOrdered, Tag, Bookmark,
  Globe, Lock, Zap, History, FileText, Share2, Trash2,
  MoreVertical, ChevronDown, Monitor, Smartphone, Tablet,
  FolderTree, Link2, ExternalLink, Flag, BarChart3, Search,
  Image as ImageIcon, Sparkles, Download, RefreshCw
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, serverTimestamp, deleteDoc, orderBy } from "firebase/firestore";

// --- Global Constants & Config ---
const apiKey = ""; 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'shinvps-core-editor-v2';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;

const MASTER_CATEGORIES = [
  { id: '10-bto-masters', name: 'BTO Masters', color: 'blue', description: '核となる技術マニュアル' },
  { id: '20-bto-fortress', name: 'BTO Fortress', color: 'emerald', description: 'セキュリティ・堅牢化ガイド' },
  { id: '00-master-log', name: 'Master Log', color: 'purple', description: '開発・更新履歴ログ' },
  { id: '99-archive', name: 'Archive', color: 'zinc', description: 'レガシー・過去資料' }
];

const MASTER_SERIES_PRESETS = [
  { id: 'next-bicstation', title: 'Next.js BicStation Architecture', category: '10-bto-masters' },
  { id: 'linux-hardening', title: 'Linux Hardening Suite', category: '20-bto-fortress' }
];

const STATUS_LEVELS = [
  { id: 'draft', label: 'DRAFT', color: 'zinc' },
  { id: 'writing', label: 'WRITING', color: 'blue' },
  { id: 'review', label: 'REVIEW', color: 'purple' },
  { id: 'deployed', label: 'DEPLOYED', color: 'emerald' }
];

// --- Sub-components ---

const MarkdownPreview = ({ content, meta }) => {
  const processedHtml = useMemo(() => {
    if (!content) return '<p class="text-zinc-700 italic font-mono">NO_DATA_STREAM_DETECTED...</p>';
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-black italic uppercase text-white mb-10 border-l-8 border-blue-600 pl-6 tracking-tighter">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-extrabold italic text-white mt-16 mb-8 border-b border-white/10 pb-4">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-blue-400 mt-10 mb-5 flex items-center gap-2"><span class="w-2 h-2 bg-blue-500 rounded-full"></span> $1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-blue-300 font-bold">$1</strong>')
      .replace(/`(.*?)`/gim, '<code class="bg-zinc-800 text-pink-400 px-2 py-1 rounded font-mono text-sm border border-white/5">$1</code>')
      .replace(/> (.*$)/gim, '<blockquote class="border-l-4 border-blue-900/50 bg-blue-900/10 px-6 py-4 italic text-zinc-400 my-8 rounded-r-xl">$1</blockquote>')
      .replace(/\n/gim, '<br />');
  }, [content]);

  return (
    <div className="max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      {meta.thumbnail && (
        <img src={meta.thumbnail} alt="Cover" className="w-full h-80 object-cover rounded-3xl mb-12 shadow-2xl border border-white/10" />
      )}
      <div className="mb-12 flex flex-wrap gap-3">
        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-full">
          {meta.category_id}
        </span>
        <span className="px-4 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-white/5 rounded-full">
          VOL.{meta.episode_no}
        </span>
        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-full">
          {meta.status}
        </span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: processedHtml }} className="text-zinc-300 leading-relaxed text-lg" />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // edit | preview | dashboard
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeDocId, setActiveDocId] = useState(null);
  
  // Content State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body_md: '',
    plot_md: '',
    category_id: '10-bto-masters',
    series_id: '',
    episode_no: 1,
    tags: '',
    status: 'draft',
    description: '',
    thumbnail: null,
    imageHistory: []
  });

  // UI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState<'text' | 'visual'>('text');

  // --- Firebase Logic ---
  useEffect(() => {
    if (!firebaseConfigStr) return;
    const config = JSON.parse(firebaseConfigStr);
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Auth Fail", e); }
    };
    init();
    onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); });
  }, []);

  useEffect(() => {
    if (!user || !authReady) return;
    const db = getFirestore();
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'contents');
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Snapshot error:", err));
  }, [user, authReady]);

  // --- Handlers ---
  const handleSave = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const db = getFirestore();
      const docId = activeDocId || formData.slug || `node-${Date.now()}`;
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'contents', docId);
      const payload = {
        ...formData,
        updatedAt: serverTimestamp(),
        userId: user.uid,
        fullPath: `/series/${formData.category_id}/${formData.series_id || formData.slug}/vol-${formData.episode_no}`
      };
      await setDoc(docRef, payload, { merge: true });
      setActiveDocId(docId);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const loadDoc = (docData) => {
    setFormData({
      ...docData,
      imageHistory: docData.imageHistory || []
    });
    setActiveDocId(docData.id);
    setViewMode('edit');
  };

  const createNew = () => {
    setFormData({
      title: '', slug: '', body_md: '', plot_md: '',
      category_id: '10-bto-masters', series_id: '',
      episode_no: (history.length + 1), tags: '', status: 'draft', description: '',
      thumbnail: null, imageHistory: []
    });
    setActiveDocId(null);
    setViewMode('edit');
  };

  const askAi = async (customPrompt = null) => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse || isAiProcessing) return;
    setIsAiProcessing(true);
    
    const system = `You are the SHIN-VPS Content Architect. Output professional Markdown. Focus on technical accuracy. Target: ${formData.title}`;
    const userPayload = `Instruction: ${promptToUse}\nBlueprint: ${formData.plot_md}\nCurrent Body: ${formData.body_md}`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPayload }] }],
          systemInstruction: { parts: [{ text: system }] }
        })
      });
      const data = await res.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (result) setFormData(prev => ({ ...prev, body_md: prev.body_md + "\n\n" + result }));
    } catch (e) { console.error(e); }
    setIsAiProcessing(false);
    setAiPrompt('');
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt || isImageGenerating) return;
    setIsImageGenerating(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: { prompt: imagePrompt },
          parameters: { sampleCount: 1 }
        })
      });

      const result = await response.json();
      if (result.predictions?.[0]?.bytesBase64Encoded) {
        const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        setFormData(prev => ({ 
          ...prev, 
          thumbnail: imageUrl,
          imageHistory: [imageUrl, ...(prev.imageHistory || [])].slice(0, 12)
        }));
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setIsImageGenerating(false);
    }
  };

  const pathPreview = `/series/${formData.category_id}/${formData.series_id || formData.slug || '[id]'}/vol-${formData.episode_no}`;

  return (
    <div className="flex h-screen bg-[#020202] text-zinc-400 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* 1. Global Navigation */}
      <nav className="w-16 border-r border-white/5 bg-black flex flex-col items-center py-6 gap-8 shrink-0 z-50">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95 transition-transform cursor-pointer" onClick={createNew}>
          <Plus size={20} className="text-white" />
        </div>
        <div className="flex flex-col gap-6">
          <div onClick={() => setViewMode('edit')} className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'edit' ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}><FileText size={20}/></div>
          <div onClick={() => setViewMode('dashboard')} className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === 'dashboard' ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}><BarChart3 size={20}/></div>
          <div className="p-2 text-zinc-600 hover:text-zinc-400 cursor-pointer"><Database size={20}/></div>
          <div className="p-2 text-zinc-600 hover:text-zinc-400 cursor-pointer"><Settings size={20}/></div>
        </div>
        <div className="mt-auto p-2 text-zinc-800"><Zap size={18}/></div>
      </nav>

      {/* 2. Side Panel: Explorer */}
      <aside className="w-80 border-r border-white/5 bg-[#050505] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-10">
          
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <FolderTree size={14} className="text-blue-500" /> Resolution_Path
            </h3>
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-[10px] font-mono text-blue-400 break-all leading-relaxed tracking-tighter">
                {pathPreview}
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Layers size={14} className="text-emerald-500" /> Taxonomy_Logic
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Category</label>
              <select 
                value={formData.category_id} 
                onChange={(e) => setFormData(prev => ({...prev, category_id: e.target.value}))}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none appearance-none"
              >
                {MASTER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Series_Parent</label>
              <select 
                value={formData.series_id} 
                onChange={(e) => setFormData(prev => ({...prev, series_id: e.target.value}))}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none appearance-none"
              >
                <option value="">No Series (Single)</option>
                {MASTER_SERIES_PRESETS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <span>Sequence_Vol</span>
                <span className="text-blue-500 font-mono text-xs">#{formData.episode_no}</span>
              </div>
              <input type="range" min="1" max="100" value={formData.episode_no} onChange={(e) => setFormData(prev => ({...prev, episode_no: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex justify-between items-center">
              Active_Nodes
              <span className="bg-zinc-900 px-2 py-0.5 rounded text-blue-500">{history.length}</span>
            </h3>
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} onClick={() => loadDoc(item)} className={`p-3 border rounded-lg transition-all cursor-pointer group ${activeDocId === item.id ? 'bg-blue-600/10 border-blue-600/50' : 'bg-zinc-900/30 border-white/5 hover:border-white/10'}`}>
                  <p className={`text-[10px] font-bold truncate ${activeDocId === item.id ? 'text-blue-400' : 'text-zinc-400'}`}>{item.title || 'Untitled_Node'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter truncate w-32">{item.series_id || 'Standalone'}</span>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-black ${STATUS_LEVELS.find(s => s.id === item.status)?.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* 3. Main Workspace */}
      <main className="flex-1 flex flex-col bg-black relative overflow-hidden">
        
        {/* Toolbar */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1">
              <button onClick={() => setViewMode('edit')} className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'edit' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>EDITOR</button>
              <button onClick={() => setViewMode('preview')} className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>PREVIEW</button>
              <button onClick={() => setViewMode('dashboard')} className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>DASHBOARD</button>
            </div>

            {viewMode === 'preview' && (
              <div className="flex gap-1 animate-in zoom-in-95">
                <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg ${previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-zinc-600'}`}><Monitor size={14}/></button>
                <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg ${previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-zinc-600'}`}><Smartphone size={14}/></button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={formData.status} 
              onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
              className={`text-[10px] font-black px-4 py-2 rounded-full border-none outline-none cursor-pointer tracking-widest transition-colors ${
                formData.status === 'deployed' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {STATUS_LEVELS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2.5 shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest transition-all">
              {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} PUSH_UPDATE
            </button>
          </div>
        </header>

        {/* Content Flow */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top,_rgba(25,25,50,0.1)_0%,_transparent_50%)]">
          {viewMode === 'dashboard' ? (
            <div className="p-12 max-w-6xl mx-auto space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Series_Analytics</h2>
                  <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Structural Overview & Resource Management</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-blue-500 font-mono">{Math.round((history.filter(h => h.status === 'deployed').length / (history.length || 1)) * 100)}%</p>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total_Completion</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.sort((a,b) => a.episode_no - b.episode_no).map(node => (
                  <div key={node.id} onClick={() => loadDoc(node)} className="bg-[#080808] border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden">
                    {node.thumbnail && (
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-20 -mr-6 -mt-6 blur-xl scale-150">
                        <img src={node.thumbnail} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className="text-[9px] font-mono text-zinc-600 uppercase">VOL.{node.episode_no}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${STATUS_LEVELS.find(s => s.id === node.status)?.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>{node.status}</span>
                    </div>
                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-1 relative z-10">{node.title || 'Untitled'}</h4>
                    <p className="text-xs text-zinc-600 mt-4 line-clamp-2 h-8 italic border-l border-zinc-800 pl-3 relative z-10">{node.plot_md || 'No blueprint data available.'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`mx-auto px-8 py-20 transition-all duration-500 ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-5xl'} min-h-full`}>
              {viewMode === 'preview' ? (
                <MarkdownPreview content={formData.body_md} meta={formData} />
              ) : (
                <div className="flex flex-col gap-12">
                  {/* Metadata Input */}
                  <div className="space-y-8">
                    <input 
                      value={formData.title} 
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} 
                      placeholder="OBJECT_TITLE" 
                      className="w-full bg-transparent text-6xl md:text-7xl font-black italic uppercase text-white outline-none placeholder:text-zinc-900 tracking-tighter" 
                    />
                    <div className="flex flex-wrap gap-8 py-6 border-y border-white/5 items-center">
                      <div className="flex gap-2 items-center"><Terminal size={14}/><input value={formData.slug} onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))} className="bg-transparent text-xs font-bold text-blue-500 outline-none" placeholder="node-slug-id" /></div>
                      <div className="h-4 w-[1px] bg-white/5"></div>
                      <div className="flex gap-2 items-center"><Tag size={14}/><input value={formData.tags} onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))} className="bg-transparent text-xs font-bold text-zinc-500 outline-none" placeholder="Tags, separated, by, comma" /></div>
                    </div>
                  </div>

                  {/* Dual Workspace (Plot & Body) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <section className="lg:col-span-4 space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Flag size={12}/> Scenario_Blueprint</h4>
                        <span className="text-[8px] font-mono text-zinc-700">Structural_Design</span>
                      </div>
                      <textarea 
                        value={formData.plot_md}
                        onChange={(e) => setFormData(prev => ({...prev, plot_md: e.target.value}))}
                        placeholder="この章の目的、伏線、キーポイントを記述..."
                        className="w-full h-[400px] bg-zinc-900/30 border border-white/5 rounded-2xl p-5 text-sm leading-relaxed text-zinc-400 outline-none focus:ring-1 ring-blue-500/30 resize-none italic font-serif"
                      />
                      
                      {/* Thumbnail Preview in Editor */}
                      {formData.thumbnail && (
                        <div className="mt-6 space-y-2">
                           <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Active_Thumbnail</h4>
                           <div className="relative group aspect-video rounded-xl overflow-hidden border border-white/5">
                             <img src={formData.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Thumb" />
                             <button onClick={() => setFormData(prev => ({...prev, thumbnail: null}))} className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur text-white opacity-0 group-hover:opacity-100 rounded-md transition-opacity"><Trash2 size={12}/></button>
                           </div>
                        </div>
                      )}
                    </section>

                    <section className="lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Edit3 size={12}/> Production_Stream</h4>
                        <span className="text-[8px] font-mono text-zinc-700">Live_Writing</span>
                      </div>
                      <textarea 
                        value={formData.body_md}
                        onChange={(e) => setFormData(prev => ({...prev, body_md: e.target.value}))}
                        placeholder="本文のデータストリームを開始..."
                        className="w-full h-full min-h-[600px] bg-transparent text-xl leading-relaxed text-zinc-300 outline-none resize-none font-mono placeholder:text-zinc-900 focus:placeholder:opacity-0 transition-all"
                      />
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 4. Right Sidebar: AI Coprocessor */}
      <aside className="w-80 border-l border-white/5 bg-[#050505] flex flex-col shrink-0">
        <div className="p-1 border-b border-white/5 bg-black/40 flex">
          <button 
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all ${activeTab === 'text' ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-600'}`}
          >
            AI_WRITER
          </button>
          <button 
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-4 text-[10px] font-black tracking-widest transition-all ${activeTab === 'visual' ? 'text-purple-500 bg-purple-500/5' : 'text-zinc-600'}`}
          >
            AI_VISUAL
          </button>
        </div>
        
        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'text' ? (
            <>
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="relative group">
                  <textarea 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)} 
                    placeholder="Ask AI for structural logic..." 
                    className="w-full h-40 bg-zinc-900 border border-white/5 rounded-2xl p-4 text-xs outline-none focus:ring-2 ring-blue-500/20 resize-none text-zinc-300 font-mono transition-all" 
                  />
                  <div className="absolute bottom-3 right-3 text-[8px] font-mono text-zinc-700">GEMINI_FLASH_2.5</div>
                </div>
                <button 
                  onClick={() => askAi()} 
                  disabled={isAiProcessing || !aiPrompt} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.4em] transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  {isAiProcessing ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Commit_Logic'}
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1">Logic_Presets</p>
                {[
                  "設計図に基づいた導入部の執筆",
                  "この章の技術的ポイントを整理",
                  "目次の自動生成",
                  "前の章との整合性チェック"
                ].map(p => (
                  <button key={p} onClick={() => askAi(p)} className="w-full p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-xl text-[10px] text-zinc-500 font-bold text-left transition-all truncate">
                    {p}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="relative group">
                  <textarea 
                    value={imagePrompt} 
                    onChange={(e) => setImagePrompt(e.target.value)} 
                    placeholder="Visual prompt for cover image..." 
                    className="w-full h-32 bg-zinc-900 border border-white/5 rounded-2xl p-4 text-xs outline-none focus:ring-2 ring-purple-500/20 resize-none text-zinc-300 font-mono transition-all" 
                  />
                  <div className="absolute bottom-3 right-3 text-[8px] font-mono text-zinc-700 uppercase">Imagen_4.0_Core</div>
                </div>
                <button 
                  onClick={handleGenerateImage} 
                  disabled={isImageGenerating || !imagePrompt} 
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.4em] transition-all shadow-xl shadow-purple-600/20 active:scale-95"
                >
                  {isImageGenerating ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Render_Visual'}
                </button>
              </div>

              {formData.thumbnail && (
                <div className="space-y-4 border-t border-white/5 pt-8">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Active_Result</p>
                    <button className="text-zinc-600 hover:text-zinc-400 transition-colors"><Download size={12}/></button>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <img src={formData.thumbnail} className="w-full h-full object-cover" alt="Gen" />
                    {isImageGenerating && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-purple-500" size={24} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-white/5 pt-8">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest px-1 flex items-center justify-between">
                   Iteration_History
                   <History size={10} />
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(formData.imageHistory || []).map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setFormData(prev => ({...prev, thumbnail: img}))}
                      className={`aspect-video rounded-lg overflow-hidden border transition-all ${formData.thumbnail === img ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="Hist" />
                    </button>
                  ))}
                  {[...Array(Math.max(0, 4 - (formData.imageHistory || []).length))].map((_, i) => (
                    <div key={i} className="aspect-video rounded-lg border border-white/5 bg-zinc-900/20" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-blue-600/5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-zinc-500">Characters:</span>
              <span className="text-blue-400 font-black">{(formData.body_md || '').length}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-zinc-500">Node_ID:</span>
              <span className="text-zinc-600 uppercase truncate w-32 text-right">{activeDocId || 'PENDING'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Save Status Overlay */}
      {saveStatus !== 'idle' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-2xl transition-all ${
            saveStatus === 'success' ? 'bg-emerald-600/90 text-white' : 
            saveStatus === 'error' ? 'bg-rose-600/90 text-white' : 'bg-zinc-900/90 text-zinc-400'
          }`}>
            {saveStatus === 'success' ? <CheckCircle2 size={16} /> : saveStatus === 'error' ? <AlertCircle size={16} /> : <Loader2 size={16} className="animate-spin" />}
            <span className="text-xs font-black uppercase tracking-[0.2em] italic">
              {saveStatus === 'saving' ? 'UPLOADING_NODE...' : saveStatus === 'success' ? 'SYNC_COMPLETE' : 'ERROR_DETECTED'}
            </span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        input[type="range"] { -webkit-appearance: none; height: 4px; background: #18181b; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #2563eb; border-radius: 50%; cursor: pointer; border: 2px solid #000; transition: all 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 10px rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}