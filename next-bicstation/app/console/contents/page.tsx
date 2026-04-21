import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Send, Save, Eye, Edit3, Wand2, Settings, Layout, ChevronRight, 
  AlertCircle, CheckCircle2, Terminal, Database, Cpu, Loader2,
  Layers, Hash, Type, Plus, ListOrdered, Tag, Bookmark,
  Globe, Lock, Zap, History, FileText, Share2, Trash2,
  MoreVertical, ChevronDown, Monitor, Smartphone, Tablet,
  FolderTree, Link2, ExternalLink, Flag, BarChart3, Search,
  Image as ImageIcon, Sparkles, Download, RefreshCw, ShoppingCart,
  Target, Info, MessageSquare, Clipboard, Menu, X, Rocket,
  Calendar, ShieldCheck, ZapOff, MousePointer2, Link as LinkIcon,
  ArrowRightLeft, EyeOff, LayoutPanelLeft, FileEdit, HardDrive,
  UserCheck, Activity, LayoutGrid, FileSearch, Boxes, Cpu as CpuIcon,
  Code2, Braces, Binary, Workflow, Gauge, Fingerprint, Layers3,
  Key, Shield, Zap as ZapIcon, Radio, Command
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, serverTimestamp, deleteDoc, orderBy, where, limit } from "firebase/firestore";

// --- Global Constants & Config ---
const apiKey = ""; 
const appId = typeof __app_id !== 'undefined' ? __app_id : 'shinvps-v4-master-core';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;

// Initialize Firebase Logic (Rule 3 Implementation)
let db, auth;
if (firebaseConfigStr) {
  const firebaseConfig = JSON.parse(firebaseConfigStr);
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

// Master Definitions (Fully Restored)
const MASTER_CATEGORIES = [
  { id: '10-bto-masters', name: '10-BTO Masters', color: 'blue', description: '核となる技術マニュアル / アーキテクチャ', icon: <CpuIcon size={16}/> },
  { id: '20-tech-vortex', name: '20-Tech Vortex', color: 'purple', description: '最新技術の解析ログ / 実装実験', icon: <ZapIcon size={16}/> },
  { id: '30-fortress-log', name: '30-Fortress Log', color: 'emerald', description: '運用・防衛記録 / セキュリティ', icon: <ShieldCheck size={16}/> },
  { id: '40-gear-archive', name: '40-Gear Archive', color: 'amber', description: '装備・デバイス選定 / 物理構成', icon: <Boxes size={16}/> },
  { id: '50-logic-engine', name: '50-Logic Engine', color: 'rose', description: '戦略思考 / ビジネスロジック', icon: <Workflow size={16}/> }
];

const PRESET_TAGS = ["ARCHITECTURE", "PRODUCTION", "CRITICAL", "EXPERIMENTAL", "DEPRECATED", "DRAFT", "INTERNAL"];

// --- Root Component ---
export default function App() {
  // Authentication & Global State
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('editor'); // editor | gallery | analytics | labs
  const [activeTab, setActiveTab] = useState('logic'); // logic | styling | tags
  const [previewDevice, setPreviewDevice] = useState('desktop');
  
  // UI Control State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [showSettings, setShowSettings] = useState(false);
  const [showLogics, setShowLogics] = useState(false);
  
  // Content & Logic Data Matrix
  const [documentId, setDocumentId] = useState(null);
  const [content, setContent] = useState("");
  const [formData, setFormData] = useState({
    title: "NODE_INITIAL_SEQUENCE",
    categoryId: "10-bto-masters",
    logic: {
      target: "",
      benefit: "",
      outline: "",
      keywords: "",
      tone: "professional"
    },
    meta: {
      tags: ["DRAFT"],
      authorId: "",
      visibility: "public",
      encryption: false
    },
    settings: {
      aiCreativity: 75,
      autoSync: true,
      darkMode: true,
      lineNumbers: true,
      fontSize: 16
    }
  });

  // Data Collections
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), msg: "SYSTEM_INITIALIZED", type: "system" }
  ]);

  // Refs
  const editorRef = useRef(null);

  // --- 1. Authentication Layer (Rule 3) ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
        addLog("SYSTEM_AUTHENTICATION_ESTABLISHED", "success");
      } catch (err) {
        addLog("AUTH_SECURITY_BREACH: " + err.message, "error");
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setFormData(prev => ({ ...prev, meta: { ...prev.meta, authorId: u.uid } }));
        addLog(`USER_CONNECTED: ${u.uid}`, "system");
      }
    });
  }, []);

  // --- 2. Firestore Sync Engine (Rule 1 & 2) ---
  useEffect(() => {
    if (!db || !user) return;
    
    // Fetch Public Data
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'documents'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocuments(docs);
      addLog(`DATABASE_SYNCED: ${docs.length}_NODES_FOUND`, "system");
    }, (err) => {
      addLog("SYNC_INTERRUPTED: " + err.message, "error");
    });

    return () => unsubscribe();
  }, [user]);

  // --- 3. Neural Generation Core (Gemini API) ---
  const generateAIContent = async () => {
    if (!formData.logic.target || !formData.logic.outline) {
      addLog("LOGIC_PARAMETER_INCOMPLETE", "error");
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    setIsGenerating(true);
    setSaveStatus('saving');
    addLog("EXECUTING_NEURAL_CONSTRUCTION", "ai");

    const systemPrompt = `You are "SHIN-ARCHITECT: CORE", a supreme AI writing system.
    Follow the logic matrix: Target persona, expected benefit, and detailed outline.
    Output must be in high-quality Japanese Markdown. 
    Tone: ${formData.logic.tone === 'professional' ? 'Highly professional, technical, authoritative.' : 'Creative, engaging, and innovative.'}
    Use advanced structure (H1, H2, H3), tables for comparison, and blockquotes for critical insights.`;

    const userPrompt = `
    【TARGET】: ${formData.logic.target}
    【BENEFIT】: ${formData.logic.benefit}
    【OUTLINE】: ${formData.logic.outline}
    【KEYWORDS】: ${formData.logic.keywords}
    【CATEGORY】: ${formData.categoryId}

    上記のロジックマトリックスに基づき、圧倒的なクオリティの技術文書を生成してください。
    内容の密度を最大化し、読者が即座にアクションプランを理解できる構成にすること。`;

    const executeFetchWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        if (!response.ok) throw new Error("API_GATEWAY_TIMEOUT");
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, delay));
          return executeFetchWithRetry(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    try {
      const result = await executeFetchWithRetry();
      if (result) {
        setContent(result);
        setSaveStatus('success');
        addLog("NEURAL_SEQUENCE_STABILIZED", "success");
      }
    } catch (err) {
      addLog("NEURAL_CRASH: " + err.message, "error");
      setSaveStatus('error');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // --- 4. Persistence Management ---
  const saveDocument = async () => {
    if (!db || !user) return;
    setSaveStatus('saving');
    addLog("PERSISTING_TO_CLOUD_NODES", "system");

    try {
      const id = documentId || `node-${Date.now()}`;
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'documents', id);
      const payload = {
        ...formData,
        content,
        updatedAt: serverTimestamp(),
        author: user.uid,
        status: 'synced',
        version: '4.0.0'
      };
      await setDoc(docRef, payload);
      setDocumentId(id);
      setSaveStatus('success');
      addLog("NODE_SYNCHRONIZATION_COMPLETE", "success");
    } catch (err) {
      setSaveStatus('error');
      addLog("SAVE_CRITICAL_FAILURE: " + err.message, "error");
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const deleteDocument = async (id) => {
    if (!db || !user) return;
    if (!confirm("警告: このノードは永久に抹消されます。続行しますか？")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'documents', id));
      if (documentId === id) resetEditor();
      addLog("NODE_DELETED", "system");
    } catch (err) {
      addLog("DELETE_ERROR", "error");
    }
  };

  const loadDocument = (docData) => {
    setDocumentId(docData.id);
    setFormData({
      ...docData,
      logic: docData.logic || { target: "", benefit: "", outline: "", keywords: "", tone: "professional" },
      meta: docData.meta || { tags: [], authorId: user?.uid, visibility: "public" }
    });
    setContent(docData.content || "");
    setActiveView('editor');
    addLog(`NODE_LOADED: ${docData.id}`, "system");
  };

  const resetEditor = () => {
    setDocumentId(null);
    setContent("");
    setFormData(prev => ({ 
      ...prev, 
      title: "NEW_SEQUENCE_" + Math.floor(Math.random()*1000),
      logic: { target: "", benefit: "", outline: "", keywords: "", tone: "professional" }
    }));
    addLog("EDITOR_READY_FOR_NEW_SEQUENCE", "system");
  };

  // --- Helpers ---
  const addLog = (msg, type) => {
    setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: msg.toUpperCase(), type }, ...prev].slice(0, 50));
  };

  const currentCategory = useMemo(() => 
    MASTER_CATEGORIES.find(c => c.id === formData.categoryId) || MASTER_CATEGORIES[0], 
  [formData.categoryId]);

  // --- Sub-Components ---
  const StatusOverlay = () => {
    if (saveStatus === 'idle') return null;
    return (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className={`px-8 py-4 rounded-3xl backdrop-blur-3xl border flex items-center gap-4 shadow-2xl shadow-black/50 ${
          saveStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
          saveStatus === 'error' ? 'bg-rose-500/10 border-rose-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        }`}>
          {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin text-blue-500" /> : 
           saveStatus === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : 
           <AlertCircle size={18} className="text-rose-500" />}
          <div className="flex flex-col">
            <span className={`text-[11px] font-black tracking-widest uppercase ${
              saveStatus === 'success' ? 'text-emerald-400' :
              saveStatus === 'error' ? 'text-rose-400' :
              'text-blue-400'
            }`}>
              {saveStatus === 'saving' ? 'Encryption_Sequence_Running...' :
               saveStatus === 'success' ? 'All_Systems_Synchronized' :
               'Security_Interference_Detected'}
            </span>
            <span className="text-[9px] font-bold text-zinc-500 tracking-tighter">
              {saveStatus === 'saving' ? 'クラウド同期およびAI演算実行中' :
               saveStatus === 'success' ? 'データは完全に保護されました' :
               '接続状態または権限を確認してください'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const NavItem = ({ active, icon, label, onClick }) => (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl transition-all relative group flex items-center justify-center ${active ? 'bg-zinc-800 text-blue-400 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'hover:bg-zinc-900 text-zinc-600'}`}
    >
      {icon}
      <span className="absolute left-20 bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 font-black tracking-widest shadow-2xl">
        {label}
      </span>
      {active && <div className="absolute right-[-1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
    </button>
  );

  return (
    <div className={`flex h-screen w-full bg-[#020202] text-zinc-300 font-sans selection:bg-blue-600/30 overflow-hidden ${formData.settings.darkMode ? 'dark' : ''}`}>
      
      {/* 1. PRIMARY_DOCK (Left) */}
      <nav className="w-20 border-r border-zinc-900 bg-zinc-950/40 backdrop-blur-3xl flex flex-col items-center py-8 gap-10 z-[60]">
        <div className="relative group cursor-pointer" onClick={() => setActiveView('editor')}>
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20 group-active:scale-90 transition-all">
            <Fingerprint className="text-white group-hover:scale-110 transition-transform" size={26} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#020202] rounded-full" />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <NavItem active={activeView === 'editor'} icon={<Edit3 size={20}/>} label="CORE_EDITOR" onClick={() => setActiveView('editor')} />
          <NavItem active={activeView === 'gallery'} icon={<LayoutGrid size={20}/>} label="NODE_INDEX" onClick={() => setActiveView('gallery')} />
          <NavItem active={activeView === 'analytics'} icon={<Gauge size={20}/>} label="SYSTEM_STATS" onClick={() => setActiveView('analytics')} />
          <NavItem active={activeView === 'labs'} icon={<Binary size={20}/>} label="NEURAL_LABS" onClick={() => setActiveView('labs')} />
        </div>

        <div className="flex flex-col gap-6 pb-2">
          <button onClick={() => setShowSettings(true)} className="p-4 rounded-2xl hover:bg-zinc-900 transition-all text-zinc-600 hover:text-white">
            <Settings size={22} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-600 border border-zinc-800 shadow-inner">
            {user?.uid.slice(0, 2).toUpperCase() || "??"}
          </div>
        </div>
      </nav>

      {/* 2. COMMAND_CENTER (Main) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header - Advanced Control Hub */}
        <header className="h-24 border-b border-zinc-900/50 flex items-center justify-between px-10 bg-zinc-950/20 backdrop-blur-md z-50">
          <div className="flex items-center gap-8 overflow-hidden">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-4">
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value.toUpperCase()})}
                  className="bg-transparent text-2xl font-black text-white outline-none border-b-2 border-transparent focus:border-blue-500/50 transition-all w-80 uppercase truncate tracking-tight"
                  placeholder="INPUT_NODE_IDENTIFIER"
                />
                <div className={`px-3 py-1 rounded-xl text-[10px] font-black border border-${currentCategory.color}-500/30 bg-${currentCategory.color}-500/10 text-${currentCategory.color}-400 uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg`}>
                  {currentCategory.icon}
                  {currentCategory.name}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 tracking-widest uppercase">
                  <Terminal size={12} className="text-zinc-700"/> 
                  USR:{user?.uid.slice(0, 8) || "ANON"} // PTH:artifacts/{appId.slice(0,4)}/{documentId?.slice(0,4) || "DRAFT"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900/40 rounded-2xl p-1 border border-zinc-800/50 mr-2 shadow-inner">
              <button onClick={() => setPreviewDevice('mobile')} className={`p-2.5 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-zinc-800 text-blue-400 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}><Smartphone size={18}/></button>
              <button onClick={() => setPreviewDevice('desktop')} className={`p-2.5 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-zinc-800 text-blue-400 shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}><Monitor size={18}/></button>
            </div>
            
            <button onClick={resetEditor} className="p-3 text-zinc-600 hover:text-white transition-all hover:bg-zinc-900 rounded-2xl" title="New Document">
              <Plus size={24} />
            </button>
            
            <button 
              onClick={saveDocument} 
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-3 px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl text-[11px] font-black tracking-[0.3em] border border-zinc-800 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={16} className="text-blue-500" />
              PERSIST_NODE
            </button>
            
            <button className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-[11px] font-black tracking-[0.3em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 group">
              <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
              EXPORT_LOGIC
            </button>
          </div>
        </header>

        {/* Workspace - Content Logic Flow */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Main Workspace (Editor / Gallery / Stats) */}
          <section className="flex-1 flex flex-col bg-[#050505] relative min-w-0">
            {activeView === 'editor' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor Surface */}
                <div className="flex-1 flex flex-col relative border-r border-zinc-900/50">
                  <div className="absolute top-6 left-10 z-20 flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl text-[10px] font-black text-zinc-500 tracking-widest shadow-2xl">
                      <Code2 size={12} className="text-blue-500"/> BUFFER_01_RAW
                    </div>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="ENTER_SEQUENCE_OR_USE_LOGIC_MATRIX_ON_THE_RIGHT..."
                    className="flex-1 w-full p-24 bg-transparent text-zinc-200 focus:outline-none resize-none font-mono leading-relaxed text-lg custom-scrollbar placeholder:text-zinc-900"
                    style={{ fontSize: `${formData.settings.fontSize}px` }}
                  />
                  {/* Floating Toolbar */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-900/90 backdrop-blur-3xl border border-zinc-800/50 rounded-[2rem] flex items-center gap-6 shadow-2xl z-30">
                    <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-white" onClick={() => setContent(c => c + "**BOLD**")}><Type size={18}/></button>
                    <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-white" onClick={() => setContent(c => c + "\n- ITEM")}><ListOrdered size={18}/></button>
                    <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-white" onClick={() => setContent(c => c + "```\nCODE\n```")}><Braces size={18}/></button>
                    <div className="w-px h-6 bg-zinc-800 mx-2" />
                    <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-white"><ImageIcon size={18}/></button>
                    <button className="p-3 hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 hover:text-white"><LinkIcon size={18}/></button>
                  </div>
                </div>

                {/* Real-time Rendering Engine */}
                <div className="hidden xl:flex w-[45%] bg-[#080808] overflow-hidden flex-col">
                  <div className="flex-1 overflow-auto p-16 custom-scrollbar flex justify-center items-start">
                    <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${previewDevice === 'mobile' ? 'w-[375px] h-[750px] rounded-[3.5rem] border-[12px] border-zinc-900 mt-4' : 'w-full max-w-4xl rounded-3xl h-fit min-h-[90vh]'}`}>
                      <div className="h-16 bg-zinc-50 border-b border-zinc-100 flex items-center px-10 gap-4">
                        <div className="flex gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-inner" />
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-inner" />
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-inner" />
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black text-zinc-400 tracking-[0.3em] uppercase">RENDER_STABLE_V4</span>
                        </div>
                      </div>
                      <article className="flex-1 p-20 prose prose-zinc max-w-none font-serif leading-relaxed overflow-y-auto selection:bg-blue-100">
                        {content ? (
                           <div dangerouslySetInnerHTML={{ __html: content
                             .replace(/\n/g, '<br/>')
                             .replace(/# (.*)/g, '<h1 class="text-4xl font-black mb-8">$1</h1>')
                             .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-12 border-l-4 border-blue-600 pl-4 mb-6">$1</h2>')
                             .replace(/### (.*)/g, '<h3 class="text-xl font-bold text-blue-700 mt-8 mb-4">$1</h3>') 
                           }} />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-40 opacity-5 grayscale">
                            <Rocket size={160} />
                            <p className="mt-12 font-black uppercase tracking-[0.8em] text-lg">AWAITING_NEURAL_INPUT</p>
                          </div>
                        )}
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'gallery' && (
              <div className="flex-1 p-20 overflow-y-auto custom-scrollbar flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-end justify-between">
                   <div className="flex flex-col">
                      <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Node_Repository</h2>
                      <p className="text-zinc-600 text-sm font-black mt-4 tracking-[0.4em] uppercase">Status: {documents.length} NODES_STABILIZED // CLOUD:ONLINE</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="relative group">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                         <input className="bg-zinc-950 border border-zinc-900 rounded-2xl pl-14 pr-8 py-4 text-sm focus:border-blue-500/50 outline-none transition-all w-[400px] shadow-2xl" placeholder="FILTER_NODES_BY_IDENTIFIER..." />
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                  {documents.length > 0 ? documents.map(doc => {
                    const cat = MASTER_CATEGORIES.find(c => c.id === doc.categoryId) || MASTER_CATEGORIES[0];
                    return (
                      <div key={doc.id} onClick={() => loadDocument(doc)} className="group bg-zinc-950/40 border border-zinc-900 rounded-[2.5rem] p-10 hover:bg-zinc-900/30 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-95 shadow-2xl">
                        <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => {e.stopPropagation(); deleteDocument(doc.id)}} className="p-3 bg-zinc-900 rounded-xl text-zinc-600 hover:text-rose-500 border border-zinc-800 transition-all"><Trash2 size={18}/></button>
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-${cat.color}-500/30 bg-${cat.color}-500/10 text-${cat.color}-400 shadow-2xl`}>
                            {cat.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-${cat.color}-500`}>{cat.name}</span>
                            <span className="text-[11px] text-zinc-700 font-bold uppercase tracking-widest mt-1">
                              {doc.updatedAt?.toDate()?.toLocaleString() || 'RECENT_ENTRY'}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 uppercase truncate tracking-tight">{doc.title}</h3>
                        <p className="text-sm text-zinc-600 line-clamp-3 mb-10 font-mono leading-relaxed h-16">{doc.content || 'DATA_BUFFER_NULL'}</p>
                        <div className="flex items-center justify-between pt-8 border-t border-zinc-900/50">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-800">{doc.author?.slice(0,2).toUpperCase()}</div>
                             <span className="text-[10px] font-black tracking-widest text-zinc-700 uppercase">USR_REF_{doc.author?.slice(0,6)}</span>
                          </div>
                          <div className="flex gap-2">
                             {doc.meta?.tags?.slice(0,2).map(t => (
                               <span key={t} className="px-2 py-1 bg-zinc-900 rounded-md text-[8px] font-black text-zinc-600 border border-zinc-800 uppercase tracking-tighter">{t}</span>
                             ))}
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-full py-48 flex flex-col items-center justify-center opacity-10">
                       <Database size={120} className="mb-10 animate-pulse" />
                       <p className="font-black tracking-[1em] text-xl">EMPTY_REPOSITORY_DETECTED</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="flex-1 p-24 flex flex-col gap-16 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none border-l-8 border-blue-600 pl-8">System_Deep_Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {[
                    { label: 'NODES_TOTAL', val: documents.length, icon: <Database className="text-blue-500" />, trend: '+12%' },
                    { label: 'AI_SEQUENCES', val: logs.filter(l => l.type === 'ai').length, icon: <Sparkles className="text-purple-500" />, trend: 'OPTIMAL' },
                    { label: 'SYNC_UPTIME', val: '99.98%', icon: <Activity className="text-emerald-500" />, trend: 'STABLE' },
                    { label: 'BUFFER_LOAD', val: `${(content.length / 1024).toFixed(1)} KB`, icon: <Binary className="text-amber-500" />, trend: 'SECURE' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl relative group hover:border-blue-500/20 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">{stat.label}</span>
                        <div className="p-3 bg-zinc-900 rounded-2xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="text-5xl font-black text-white tracking-tighter">{stat.val}</div>
                        <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{stat.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 flex flex-col overflow-hidden shadow-2xl relative">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none" />
                   <div className="flex items-center justify-between mb-10 relative z-10">
                      <h3 className="text-[14px] font-black tracking-[0.5em] text-zinc-500 uppercase flex items-center gap-4">
                         <Terminal size={18} className="text-blue-500"/> SYSTEM_KERNEL_LOGS
                      </h3>
                      <button onClick={() => setLogs([{ id: 0, time: "---", msg: "BUFFER_CLEARED", type: "system" }])} className="px-6 py-2 bg-zinc-900 rounded-xl text-[10px] font-black text-zinc-600 hover:text-white transition-all border border-zinc-800 uppercase tracking-widest shadow-xl">PURGE_SEQUENCE</button>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar font-mono text-xs relative z-10 px-2">
                      {logs.map(log => (
                        <div key={log.id} className="flex gap-10 py-3 border-b border-zinc-900/50 group hover:bg-zinc-900/10 px-4 rounded-xl transition-all">
                           <span className="text-zinc-700 w-24 flex-shrink-0 font-bold">[{log.time}]</span>
                           <div className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border flex-shrink-0 ${
                             log.type === 'system' ? 'text-zinc-500 border-zinc-800 bg-zinc-900' :
                             log.type === 'success' ? 'text-emerald-500 border-emerald-900 bg-emerald-900/10' :
                             log.type === 'ai' ? 'text-blue-400 border-blue-900 bg-blue-900/10' :
                             'text-rose-500 border-rose-900 bg-rose-900/10'
                           }`}>
                             {log.type}
                           </div>
                           <span className={`flex-1 transition-colors font-bold ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-200'}`}>
                             {log.msg}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </section>

          {/* 3. LOGIC_MATRIX_ENGINE (Right Sidebar) */}
          <aside className={`w-[500px] border-l border-zinc-900 bg-zinc-950/40 backdrop-blur-3xl flex flex-col transition-all duration-500 ${isSidebarOpen ? '' : 'mr-[-500px]'}`}>
            {/* Logic Tab Selection */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/20">
              <button onClick={() => setActiveTab('logic')} className={`flex-1 py-7 text-[11px] font-black tracking-[0.4em] transition-all relative ${activeTab === 'logic' ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                LOGIC_MATRIX
                {activeTab === 'logic' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />}
              </button>
              <button onClick={() => setActiveTab('styling')} className={`flex-1 py-7 text-[11px] font-black tracking-[0.4em] transition-all relative ${activeTab === 'styling' ? 'text-rose-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                NODE_ARCHIVE
                {activeTab === 'styling' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)]" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
              {activeTab === 'logic' ? (
                <>
                  <section className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <label className="flex items-center gap-4 text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">
                        <Target size={16} className="text-blue-500" />
                        Target_Persona
                      </label>
                      <Info size={14} className="text-zinc-800" />
                    </div>
                    <input 
                      value={formData.logic.target}
                      onChange={(e) => setFormData({...formData, logic: {...formData.logic, target: e.target.value}})}
                      placeholder="e.g. 技術選定に悩むシニアエンジニア"
                      className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-[1.5rem] p-6 text-sm focus:border-blue-500 outline-none shadow-inner transition-all placeholder:text-zinc-800 font-bold text-white"
                    />
                  </section>

                  <section className="space-y-4">
                    <label className="flex items-center gap-4 text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">
                      <ZapIcon size={16} className="text-amber-500" />
                      Core_Benefit
                    </label>
                    <input 
                      value={formData.logic.benefit}
                      onChange={(e) => setFormData({...formData, logic: {...formData.logic, benefit: e.target.value}})}
                      placeholder="e.g. 開発スピードの3倍化と保守性の向上"
                      className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-[1.5rem] p-6 text-sm focus:border-amber-500 outline-none shadow-inner transition-all placeholder:text-zinc-800 font-bold text-white"
                    />
                  </section>

                  <section className="space-y-4">
                    <label className="flex items-center gap-4 text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">
                      <LayoutPanelLeft size={16} className="text-emerald-500" />
                      Logical_Outline
                    </label>
                    <textarea 
                      value={formData.logic.outline}
                      onChange={(e) => setFormData({...formData, logic: {...formData.logic, outline: e.target.value}})}
                      rows={10}
                      placeholder="1. 現状分析: レガシーコードの課題&#10;2. 解決策: マイクロフロントエンドの導入&#10;3. 実装計画: フェーズごとの移行手順&#10;4. 期待効果: ROIの最大化"
                      className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-[1.5rem] p-8 text-sm focus:border-emerald-500 outline-none shadow-inner transition-all resize-none font-mono placeholder:text-zinc-800 leading-loose text-white"
                    />
                  </section>

                  {/* PROMPT ACTION CENTER */}
                  <div className="pt-6 flex flex-col gap-8">
                    <div className="flex items-center justify-between px-4">
                       <span className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase">NEURAL_DENSITY_ESTIMATE</span>
                       <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-md">{formData.settings.aiCreativity}%</span>
                         <span className="text-[10px] font-black text-zinc-700">LVL_04</span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className={`group relative w-full py-10 rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-[0.97] ${isGenerating ? 'bg-zinc-900 cursor-wait' : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 hover:shadow-blue-600/40 hover:border-blue-400/30 border border-white/5'}`}
                    >
                      {isGenerating ? (
                        <div className="relative">
                          <Loader2 className="animate-spin text-blue-400" size={56} />
                          <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
                        </div>
                      ) : (
                        <div className="relative">
                          <Sparkles className="text-white group-hover:rotate-12 group-hover:scale-125 transition-all duration-700" size={56} />
                          <div className="absolute inset-0 blur-2xl bg-white/10 group-hover:bg-white/20 transition-all" />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2 z-10">
                        <span className="text-[18px] font-black tracking-[0.6em] text-white italic drop-shadow-lg">NEURAL_EXECUTE</span>
                        <span className="text-[10px] font-bold text-blue-200/50 uppercase tracking-[0.3em]">Neural_Engine_Protocol_v4.5</span>
                      </div>
                      
                      {/* Interactive Visual Effects */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <div className={`absolute -inset-x-40 top-0 h-full w-[300%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[3000ms] ease-in-out ${isGenerating ? 'animate-[shimmer_3s_infinite]' : 'translate-x-[-100%] group-hover:translate-x-[50%]'}`} />
                    </button>
                    
                    <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex flex-col items-center text-center gap-4 shadow-inner">
                       <p className="text-[10px] font-black text-zinc-600 tracking-[0.2em] leading-relaxed">
                         生成された内容はBUFFER_01に格納されます。不適切な結果は<span className="text-rose-500">PURGE</span>機能でリセットしてください。
                       </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                   <section>
                    <label className="text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase mb-8 block border-b-2 border-zinc-900 pb-4">Master_Classification</label>
                    <div className="grid grid-cols-1 gap-5">
                      {MASTER_CATEGORIES.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setFormData({...formData, categoryId: cat.id})}
                          className={`p-7 rounded-[2rem] border-2 text-left transition-all group flex gap-6 items-center ${formData.categoryId === cat.id ? `border-${cat.color}-500/50 bg-${cat.color}-500/10 shadow-2xl` : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900'}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${formData.categoryId === cat.id ? `border-${cat.color}-500/30 bg-${cat.color}-500/20 text-${cat.color}-400` : 'border-zinc-800 bg-zinc-900 text-zinc-700 group-hover:text-zinc-500'} transition-all shadow-inner`}>
                            {cat.icon}
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-3">
                              <span className={`text-[12px] font-black tracking-[0.3em] uppercase ${formData.categoryId === cat.id ? `text-${cat.color}-400` : 'text-zinc-500'}`}>{cat.name}</span>
                              {formData.categoryId === cat.id && <div className={`w-2 h-2 rounded-full bg-${cat.color}-500 shadow-[0_0_10px_#3b82f6]`}/>}
                            </div>
                            <p className="text-[10px] text-zinc-700 font-black mt-2 leading-tight uppercase tracking-widest">{cat.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                   </section>

                   <section>
                      <label className="text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase mb-8 block border-b-2 border-zinc-900 pb-4">Node_Attributes</label>
                      <div className="space-y-10">
                        <div>
                          <p className="text-[10px] font-black text-zinc-700 mb-5 uppercase tracking-[0.4em] flex items-center gap-3">
                             <Radio size={14} className="text-zinc-800"/> Visibility_Protocol
                          </p>
                          <div className="flex gap-3 p-1.5 bg-zinc-950 rounded-[1.5rem] border border-zinc-900 shadow-inner">
                             {['public', 'private', 'encrypted'].map(v => (
                               <button 
                                key={v}
                                onClick={() => setFormData({...formData, meta: {...formData.meta, visibility: v}})}
                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${formData.meta.visibility === v ? 'bg-zinc-800 text-white shadow-2xl border border-zinc-700' : 'text-zinc-700 hover:text-zinc-500'}`}>
                                 {v}
                               </button>
                             ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-black text-zinc-700 mb-5 uppercase tracking-[0.4em] flex items-center gap-3">
                            <Tag size={14} className="text-zinc-800"/> Identification_Tags
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {PRESET_TAGS.map(tag => (
                              <button 
                                key={tag} 
                                onClick={() => {
                                  const tags = formData.meta.tags.includes(tag) ? formData.meta.tags.filter(t => t !== tag) : [...formData.meta.tags, tag];
                                  setFormData({...formData, meta: {...formData.meta, tags}});
                                }}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all ${formData.meta.tags.includes(tag) ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30' : 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:border-zinc-600'}`}>
                                {tag}
                              </button>
                            ))}
                            <button className="px-4 py-2.5 rounded-xl text-[10px] font-black border border-dashed border-zinc-800 text-zinc-800 hover:text-zinc-600 hover:border-zinc-700 transition-all group">
                              <Plus size={12} className="inline mr-2 group-hover:rotate-90 transition-transform" /> ADD_FIELD
                            </button>
                          </div>
                        </div>
                      </div>
                   </section>
                   
                   <section className="pt-10 border-t border-zinc-900">
                      <div className="p-10 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-indigo-500/20 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-[60px] group-hover:scale-150 transition-all" />
                        <Rocket size={48} className="text-indigo-400 mb-6 group-hover:-translate-y-2 transition-transform duration-700" />
                        <h4 className="text-[12px] font-black text-white tracking-[0.4em] uppercase mb-3">Enterprise_Scale</h4>
                        <p className="text-[11px] text-zinc-600 font-bold mb-8 leading-relaxed">外部連携およびGitHubノードへの自動デプロイを構成します。</p>
                        <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95">ESTABLISH_BRIDGE</button>
                      </div>
                   </section>
                </div>
              )}
            </div>
            
            {/* System Status Footer */}
            <div className="h-20 border-t border-zinc-900 flex items-center px-12 justify-between bg-zinc-950/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                <span className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase">LINK_STABLE</span>
              </div>
              <div className="flex items-center gap-6">
                 <span className="text-[10px] font-black text-zinc-800 tracking-tighter uppercase">V4.9.2_CORE_ULTIMATE</span>
                 <div className="w-px h-4 bg-zinc-900" />
                 <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">ENCR:AES-256</span>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* 4. SYSTEM_OVERLAYS */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-[100px] bg-black/80 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[4rem] overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,1)] relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="p-12 border-b border-zinc-900 flex items-center justify-between relative bg-zinc-950/50 backdrop-blur-md">
                 <div className="flex flex-col">
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">System_Configuration</h2>
                   <p className="text-[10px] font-black text-zinc-600 tracking-[0.5em] mt-3">INSTANCE_NODE: {appId.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setShowSettings(false)} className="p-5 hover:bg-zinc-900 rounded-3xl transition-all border border-zinc-900 text-zinc-600 hover:text-white shadow-2xl active:scale-90"><X size={32}/></button>
              </div>
              <div className="p-16 space-y-12">
                 {[
                   { id: 'autoSync', label: 'Neural_Cloud_Sync', desc: '変更を自動的にFirestoreノードへ同期・保存。', icon: <RefreshCw size={24}/> },
                   { id: 'encryption', label: 'End_to_End_Encryption', desc: 'すべてのノードデータをAES-256で暗号化して保存。', icon: <Shield size={24}/> },
                   { id: 'lineNumbers', label: 'Structural_Line_Guide', desc: 'エディタに行番号を表示し、構造化を助けます。', icon: <ListOrdered size={24}/> },
                 ].map(opt => (
                   <div key={opt.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-8">
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all shadow-inner ${formData.settings[opt.id] ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-blue-500/10' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}>
                           {opt.icon}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-lg font-black uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">{opt.label}</span>
                            <span className="text-[11px] text-zinc-700 font-bold mt-2 tracking-tighter uppercase">{opt.desc}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, settings: {...formData.settings, [opt.id]: !formData.settings[opt.id]}})}
                        className={`w-18 h-10 rounded-full transition-all relative border-2 ${formData.settings[opt.id] ? 'bg-blue-600 border-blue-500' : 'bg-zinc-900 border-zinc-800'}`}
                        style={{ width: '70px' }}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-2xl transition-all ${formData.settings[opt.id] ? 'left-9' : 'left-1'}`} />
                      </button>
                   </div>
                 ))}
                 
                 <div className="pt-10 border-t border-zinc-900 space-y-8">
                    <div className="flex justify-between items-center px-4">
                       <span className="text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase">System_Neural_Creativity</span>
                       <span className="text-[12px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20">{formData.settings.aiCreativity}%</span>
                    </div>
                    <div className="relative h-3 bg-zinc-900 rounded-full overflow-hidden border-2 border-zinc-900 shadow-inner">
                       <div className="absolute h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full" style={{ width: `${formData.settings.aiCreativity}%` }} />
                       <input 
                         type="range" min="0" max="100" 
                         value={formData.settings.aiCreativity}
                         onChange={(e) => setFormData({...formData, settings: {...formData.settings, aiCreativity: parseInt(e.target.value)}})}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                    </div>
                 </div>

                 <button onClick={() => setShowSettings(false)} className="w-full py-8 bg-white hover:bg-zinc-200 text-black rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.8em] transition-all shadow-2xl active:scale-95 mt-4">Commit_Changes</button>
              </div>
           </div>
        </div>
      )}

      {/* Global Status Overlay */}
      <StatusOverlay />

      {/* Global CSS Injector (High Density UI) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.04); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background-color: #020202; }
        textarea, .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-serif { font-family: 'Playfair Display', serif; }
        
        textarea::placeholder { color: #111111; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }
        input::placeholder { color: #1a1a1a; font-weight: 700; }
        
        .prose h1 { color: #000; letter-spacing: -0.06em; line-height: 1.1; }
        .prose h2 { color: #111; letter-spacing: -0.04em; }
        .prose p { color: #444; line-height: 1.9; margin-bottom: 2em; }
        .prose strong { color: #000; font-weight: 900; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Color Utility Mapping */
        .text-blue-500 { color: #3b82f6; } .bg-blue-500\/10 { background-color: rgba(59,130,246,0.1); } .border-blue-500\/30 { border-color: rgba(59,130,246,0.3); }
        .text-purple-500 { color: #a855f7; } .bg-purple-500\/10 { background-color: rgba(168,85,247,0.1); } .border-purple-500\/30 { border-color: rgba(168,85,247,0.3); }
        .text-emerald-500 { color: #10b981; } .bg-emerald-500\/10 { background-color: rgba(16,185,129,0.1); } .border-emerald-500\/30 { border-color: rgba(16,185,129,0.3); }
        .text-amber-500 { color: #f59e0b; } .bg-amber-500\/10 { background-color: rgba(245,158,11,0.1); } .border-amber-500\/30 { border-color: rgba(245,158,11,0.3); }
        .text-rose-500 { color: #f43f5e; } .bg-rose-500\/10 { background-color: rgba(244,63,94,0.1); } .border-rose-500\/30 { border-color: rgba(244,63,94,0.3); }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Smooth UI Transitions */
        button, input, textarea { transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
      `}} />
    </div>
  );
}