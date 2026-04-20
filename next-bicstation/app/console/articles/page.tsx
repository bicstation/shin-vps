import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  FileText, Sparkles, Save, Search, Clock, Trash2, 
  RefreshCw, Loader2, Database, Play, CheckCircle2,
  Cpu, ShieldCheck, Landmark, Info, AlertTriangle, ChevronRight
} from 'lucide-react';

/**
 * BICSTATION ARCHIVE SYSTEM V3.0
 * 修正版: 環境仕様に準拠したFirebase統合
 */

const GUIDE_STRUCTURE = {
  "bto-guide": {
    name: "BTOパソコン超入門",
    phases: [
      { episodes: [{ ep: 1, title: "なぜBTOパソコンなのか？既製品との決定的な違い" }, { ep: 2, title: "パーツ選びの優先順位：CPUとGPUの黄金比" }] }
    ]
  },
  "bto-maniacs": {
    name: "BTOマニアクス：深化の系譜",
    phases: [
      { episodes: [{ ep: 1, title: "VRMフェーズ数から見るマザーボードの真価" }, { ep: 2, title: "メモリタイミングの極限設定と安定性の境界線" }] }
    ]
  },
  "bto-fortress": {
    name: "BTO要塞：鉄壁の信頼性",
    phases: [
      { episodes: [{ ep: 1, title: "法人導入における冗長化電源の必要性" }, { ep: 2, title: "ECCメモリとWS用CPUがもたらす無停止環境" }] }
    ]
  }
};

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'next-bicstation';

export default function App() {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [articles, setArticles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    category: 'BTOパソコン',
    status: 'draft',
    seriesId: 'bto-guide',
    vol: 1
  });

  // 1. Authentication Lifecycle (Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setAuthStatus('error');
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setAuthStatus('connected');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Archive Sync (Rule 1 & 2)
  useEffect(() => {
    if (!user) return;

    // Rule 1: Fixed Path
    const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
    
    const unsubscribe = onSnapshot(articlesRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Rule 2: Memory-side Sorting
      setArticles(data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }));
    }, (err) => {
      console.error("Firestore error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. AI Engine Core (Gemini 2.5 Flash)
  const generateAI = async (targetTitle, seriesId) => {
    const apiKey = ""; // Runtime automatically provides this
    
    let toneInstruction = "親切で分かりやすい初心者向けのトーン。";
    if (seriesId === 'bto-maniacs') toneInstruction = "技術的でマニアックなトーン。深いこだわりを表現。";
    if (seriesId === 'bto-fortress') toneInstruction = "質実剛健でプロフェッショナルなトーン。信頼重視。";

    const systemPrompt = `あなたはBTOパソコンの専門家です。
シリーズ: ${seriesId}
トーン: ${toneInstruction}`;

    const userPrompt = `テーマ: "${targetTitle}" について、1500字程度のMarkdown形式でブログ記事を執筆してください。`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
      console.error("AI Generation Failed:", e);
      return null;
    }
  };

  const handleGenerateSingle = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    const text = await generateAI(formData.title, formData.seriesId);
    if (text) setFormData(prev => ({ ...prev, content: text }));
    setIsGenerating(false);
  };

  const startBulkGeneration = async () => {
    const allNodes = Object.entries(GUIDE_STRUCTURE).flatMap(([sId, config]) => 
      config.phases.flatMap((phase) => 
        phase.episodes.map((ep) => ({ seriesId: sId, ...ep }))
      )
    );

    if (!confirm(`${allNodes.length}件のエピソードをAIスキャンしますか？`)) return;
    
    setIsBulkProcessing(true);
    setBulkProgress({ current: 0, total: allNodes.length });

    const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');

    for (const node of allNodes) {
      const exists = articles.find(a => a.seriesId === node.seriesId && Number(a.vol) === Number(node.ep));
      if (!exists) {
        try {
          const content = await generateAI(node.title, node.seriesId);
          if (content) {
            await addDoc(articlesRef, {
              title: node.title,
              content: content,
              seriesId: node.seriesId,
              vol: node.ep,
              category: 'BTOパソコン',
              status: 'published',
              userId: user.uid,
              createdAt: serverTimestamp()
            });
          }
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error("Processing Failure:", node.title, e);
        }
      }
      setBulkProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }
    setIsBulkProcessing(false);
  };

  const handleSave = async () => {
    if (!user || !formData.title) return;
    try {
      const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
      const data = { 
        ...formData, 
        userId: user.uid, 
        updatedAt: serverTimestamp() 
      };
      
      if (formData.id) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'articles', formData.id);
        const { id, ...updateData } = data;
        await updateDoc(docRef, updateData);
      } else {
        await addDoc(articlesRef, { ...data, createdAt: serverTimestamp() });
      }
      
      setFormData({ id: '', title: '', content: '', category: 'BTOパソコン', status: 'draft', seriesId: 'bto-guide', vol: 1 });
    } catch (err) { console.error("Save Error:", err); }
  };

  const deleteArticle = async (id) => {
    if (confirm("このログを物理消去しますか？")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
    }
  };

  if (authStatus === 'loading') return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020408] text-white">
      <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mb-6" />
      <p className="text-[10px] font-mono tracking-[0.5em] text-slate-500 uppercase">Archive Core Initializing...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      
      {/* SYSTEM STATUS HUD */}
      <div className="max-w-[1600px] mx-auto mb-10 flex items-center justify-between bg-emerald-950/10 border border-emerald-500/10 rounded-2xl px-6 py-3 text-[10px] font-mono">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-500 uppercase tracking-widest">Master_Core:</span>
            <span className={user ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{user ? 'LINKED' : 'OFFLINE'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 border-l border-white/5 pl-8">
            <Cpu size={12} className="text-blue-400" />
            <span className="text-blue-300">ENGINES: 2.5_FLASH_OPT</span>
          </div>
        </div>
        
        {isBulkProcessing ? (
          <div className="flex items-center gap-4 text-emerald-400 animate-pulse">
            <RefreshCw className="animate-spin w-3 h-3" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-bold tracking-tighter">Sync_In_Progress</span>
              <span>{bulkProgress.current} / {bulkProgress.total} NODES</span>
            </div>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 size={12} className="text-emerald-500" />
            SYSTEM_READY_FOR_COMMITS
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* EDITOR AREA */}
        <div className="xl:col-span-9 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-4 text-white">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20">
                  <Database size={28} />
                </div>
                BICSTATION ARCHIVE <span className="text-emerald-500/50 not-italic font-mono text-sm tracking-widest ml-2">V3.0_MASTER</span>
              </h1>
              <p className="text-[10px] text-slate-600 mt-2 ml-16 font-mono uppercase tracking-[0.2em]">Comprehensive Centralized Knowledge Database</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={startBulkGeneration}
                disabled={isBulkProcessing}
                className="flex items-center gap-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-6 py-4 rounded-2xl text-xs font-black hover:bg-emerald-600/20 transition-all disabled:opacity-20"
              >
                {isBulkProcessing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play size={16} />}
                BULK_ARCHIVE_RUN
              </button>
              <button 
                onClick={handleGenerateSingle}
                disabled={isGenerating || !formData.title}
                className="flex items-center gap-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-4 rounded-2xl text-xs font-black hover:bg-blue-600/20 transition-all disabled:opacity-20"
              >
                {isGenerating ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                AI_UNIT_EXECUTE
              </button>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-4">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Log_Title_Entry</label>
              <input 
                type="text" 
                placeholder="タイトルを入力してください..."
                className="w-full bg-transparent text-5xl font-black outline-none border-b border-white/5 pb-8 focus:border-emerald-500/50 transition-all placeholder:text-slate-800 italic uppercase tracking-tighter text-white"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="flex flex-wrap gap-6 items-center font-mono">
              <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-slate-600 uppercase">Series_Node:</span>
                <select 
                  value={formData.seriesId}
                  onChange={(e) => setFormData({...formData, seriesId: e.target.value})}
                  className="bg-transparent text-[11px] font-black outline-none text-emerald-500 cursor-pointer appearance-none"
                >
                  <option value="bto-guide" className="bg-[#050810]">SERIES_10: GUIDE</option>
                  <option value="bto-maniacs" className="bg-[#050810]">SERIES_15: MANIACS</option>
                  <option value="bto-fortress" className="bg-[#050810]">SERIES_20: FORTRESS</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                <span className="text-[10px] text-slate-600 uppercase">Vol_ID:</span>
                <input 
                  type="number" 
                  className="bg-transparent w-16 text-[11px] font-black outline-none text-blue-400"
                  value={formData.vol}
                  onChange={(e) => setFormData({...formData, vol: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="flex bg-black/40 rounded-2xl border border-white/5 p-1.5 ml-auto shadow-inner">
                <button onClick={() => setFormData({...formData, status: 'draft'})} className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${formData.status === 'draft' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>DRAFT_LOG</button>
                <button onClick={() => setFormData({...formData, status: 'published'})} className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${formData.status === 'published' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-slate-600 hover:text-slate-400'}`}>COMMIT_LOG</button>
              </div>
            </div>

            <div className="relative">
              <textarea 
                className="w-full h-[600px] bg-black/20 border border-white/5 rounded-[32px] p-10 font-mono text-base leading-[1.8] outline-none focus:border-emerald-500/20 transition-all resize-none text-slate-300"
                placeholder="AI演算待機中。知見のストリームを開始してください..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
              <div className="absolute top-6 right-8 opacity-20 pointer-events-none">
                <FileText size={120} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ENCRYPTED_SYNC</div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> GEMINI_2.5_ENHANCED</div>
              </div>
              <button onClick={handleSave} className="group flex items-center gap-4 bg-white text-slate-950 px-16 py-5 rounded-[24px] font-black hover:bg-emerald-400 transition-all shadow-2xl active:scale-95">
                <Save size={20} className="group-hover:rotate-12 transition-transform" />
                COMMIT TO ARCHIVE
              </button>
            </div>
          </div>
        </div>

        {/* ARCHIVE LIBRARY */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900/30 border border-white/5 rounded-[40px] h-[1050px] flex flex-col backdrop-blur-3xl overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                  <Database size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black tracking-widest uppercase text-white">Archives</span>
                  <span className="text-[9px] font-mono text-slate-500">TOTAL_NODES: {articles.length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-black/40 border-b border-white/5">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH_NODES..." 
                  className="w-full bg-black/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-mono outline-none focus:border-emerald-500/30 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {articles
                .filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((art) => (
                <div 
                  key={art.id} 
                  onClick={() => setFormData(art)} 
                  className={`p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/50 cursor-pointer group transition-all duration-500 relative overflow-hidden ${formData.id === art.id ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20 uppercase tracking-tighter">VOL_{String(art.vol).padStart(2,'0')}</span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tighter ${
                        art.seriesId === 'bto-fortress' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                        art.seriesId === 'bto-maniacs' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 
                        'text-slate-400 bg-slate-400/10 border-slate-400/20'
                      }`}>
                        {art.seriesId?.split('-')[1]}
                      </span>
                    </div>
                    <button onClick={(e) => {e.stopPropagation(); deleteArticle(art.id);}} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all p-1.5"><Trash2 size={14}/></button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-300 group-hover:text-white leading-relaxed transition-colors line-clamp-2 uppercase italic tracking-tighter">{art.title}</h4>
                  
                  <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                    <span>{art.createdAt?.seconds ? new Date(art.createdAt.seconds * 1000).toLocaleDateString() : 'PENDING'}</span>
                    {art.status === 'published' && <CheckCircle2 size={10} className="text-emerald-500" />}
                  </div>
                </div>
              ))}
              
              {articles.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                  <Database size={48} className="opacity-10" />
                  <p className="text-[10px] font-mono uppercase">Archive_Empty_Wait_Sync</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-black/40 text-[9px] font-mono text-slate-700 flex justify-between items-center italic">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                CENTRAL_DATA_STABLE
              </div>
              <Clock size={12} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[200px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-1/2 h-1/2 bg-blue-600/5 blur-[200px] pointer-events-none -z-10" />
    </div>
  );
}