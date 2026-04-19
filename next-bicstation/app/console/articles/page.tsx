'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Search, 
  Clock, 
  Trash2, 
  Plus,
  RefreshCw,
  User as UserIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// --- Environment Values ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'next-bicstation';

export default function ArticlesPage() {
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [articles, setArticles] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Firebase references (window object)
  const dbRef = useRef<any>(null);
  const authRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'BTOパソコン',
    status: 'draft'
  });

  // 1. Dynamic SDK Loading (Avoids "Module not found" build errors)
  useEffect(() => {
    const loadScript = (url: string) => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.type = 'module';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    const initFirebase = async () => {
      try {
        // Load Firebase compat SDKs via CDN
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');

        const firebase = (window as any).firebase;
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }

        dbRef.current = firebase.firestore();
        authRef.current = firebase.auth();
        setIsSdkLoaded(true);

        // Auth Logic
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await authRef.current.signInWithCustomToken(__initial_auth_token);
        } else {
          await authRef.current.signInAnonymously();
        }

        authRef.current.onAuthStateChanged((u: any) => {
          if (u) {
            setUser(u);
            setAuthStatus('connected');
          }
        });
      } catch (err) {
        console.error("Firebase SDK Load Error:", err);
        setAuthStatus('error');
      }
    };

    initFirebase();
  }, []);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!user || !isSdkLoaded) return;

    const path = `artifacts/${appId}/public/data/articles`;
    const unsubscribe = dbRef.current.collection(path)
      .onSnapshot((snapshot: any) => {
        const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        const sorted = data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setArticles(sorted);
      }, (err: any) => console.error("Firestore Error:", err));

    return () => unsubscribe();
  }, [user, isSdkLoaded]);

  const generateAI = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    try {
      const apiKey = ""; 
      const prompt = `テーマ: "${formData.title}" について、BTOパソコン専門店として魅力的なブログ記事を1500字程度で執筆してください。`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setFormData(prev => ({ ...prev, content: text }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.title) return;
    try {
      const firebase = (window as any).firebase;
      const path = `artifacts/${appId}/public/data/articles`;
      await dbRef.current.collection(path).add({
        ...formData,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setFormData(prev => ({ ...prev, title: '', content: '' }));
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const path = `artifacts/${appId}/public/data/articles`;
      await dbRef.current.collection(path).doc(id).delete();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  if (authStatus === 'loading' && !isSdkLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050810] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
        <p className="text-xs font-mono tracking-widest text-slate-500 animate-pulse">INITIALIZING SECURE GATEWAY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 p-4 md:p-8 font-sans">
      {/* Status Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-500 uppercase">Status:</span>
            <span className={user ? 'text-emerald-400' : 'text-rose-400'}>{user ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          {user && <span className="text-slate-500 border-l border-slate-800 pl-4">UID: {user.uid}</span>}
        </div>
        <div className="text-slate-600 hidden sm:block">ENDPOINT: {appId}</div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Editor Area */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black flex items-center gap-3">
              <div className="bg-cyan-500 p-2 rounded-lg text-slate-950"><FileText size={20} /></div>
              ARTICLE LAB
            </h1>
            <div className="flex gap-2">
              <button 
                onClick={generateAI}
                disabled={isGenerating || !formData.title}
                className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-600/30 disabled:opacity-30 transition-all"
              >
                {isGenerating ? <RefreshCw className="animate-spin w-3 h-3" /> : <Sparkles size={14} />}
                AI GENERATE
              </button>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <input 
              type="text" 
              placeholder="文章のタイトルを入力..."
              className="w-full bg-transparent text-3xl font-black outline-none placeholder:text-slate-800 border-b border-slate-800 pb-4 focus:border-cyan-500/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            
            <div className="flex flex-wrap gap-4">
               <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs font-bold outline-none"
               >
                 <option>BTOパソコン</option>
                 <option>パーツレビュー</option>
                 <option>ゲーミング</option>
               </select>
               <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-1">
                 <button onClick={() => setFormData({...formData, status: 'draft'})} className={`px-4 py-1 text-[10px] font-black rounded-md ${formData.status === 'draft' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>DRAFT</button>
                 <button onClick={() => setFormData({...formData, status: 'published'})} className={`px-4 py-1 text-[10px] font-black rounded-md ${formData.status === 'published' ? 'bg-cyan-500 text-slate-950' : 'text-slate-600'}`}>PUBLISHED</button>
               </div>
            </div>

            <textarea 
              className="w-full h-[600px] bg-slate-950/50 border border-slate-800/50 rounded-xl p-6 outline-none font-mono text-sm leading-relaxed resize-none focus:border-cyan-500/30"
              placeholder="本文がここに表示されます..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />

            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={!formData.title || !user}
                className="flex items-center gap-2 bg-white text-slate-950 px-8 py-3 rounded-xl font-black hover:bg-cyan-400 transition-all shadow-xl disabled:opacity-20"
              >
                <Save size={18} />
                SAVE TO CLOUD
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl h-[850px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
              <Clock size={14} className="text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
            </div>
            
            <div className="p-4 border-b border-slate-800 bg-slate-950">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-[10px] outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {articles
                .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((article) => (
                <div 
                  key={article.id}
                  onClick={() => setFormData(article)}
                  className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg hover:border-cyan-500/30 cursor-pointer group transition-all"
                >
                  <div className="flex justify-between gap-2">
                    <h4 className="text-[11px] font-bold text-slate-300 line-clamp-2 leading-snug group-hover:text-cyan-400">{article.title || 'Untitled'}</h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-slate-600">
                    <span className="uppercase">{article.category}</span>
                    <span>{article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString() : '---'}</span>
                  </div>
                </div>
              ))}
              
              {!user && <div className="text-[10px] text-center py-10 text-slate-600">Waiting for Auth...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}