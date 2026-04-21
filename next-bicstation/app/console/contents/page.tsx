'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Save, Eye, Edit3, Wand2, 
  Settings, Layout, Image as ImageIcon, 
  ChevronRight, AlertCircle, CheckCircle2,
  Terminal, Database, Cpu, Loader2
} from 'lucide-react';

// APIキーは環境変数から取得（ここでは空文字に設定）
const apiKey = "";

export default function ContentEditor() {
  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body_md: '',
    site: 'bicstation',
    content_type: 'post',
    is_pub: false,
    is_adult: false,
    series_slug: '',
    episode_no: 0,
    category: '',
    tags: ''
  });

  // UI状態
  const [viewMode, setViewMode] = useState('edit'); 
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); 
  const [aiPrompt, setAiPrompt] = useState('');

  // タイトルからスラグを自動生成
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- Gemini API 連携 ---
  const askAi = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    
    const systemPrompt = `
      あなたはSHIN-VPSのコンテンツHub専門の編集アシスタントです。
      ユーザーが執筆中のMarkdownドキュメントに対して、指示に基づいた追記、修正、または構成案の提示を行ってください。
      出力はMarkdown形式で行い、余計な挨拶は不要です。
      現在の記事タイトル: ${formData.title}
      現在の本文の長さ: ${formData.body_md.length}文字
    `;

    const userQuery = `
      指示: ${aiPrompt}
      
      現在の本文:
      ${formData.body_md}
    `;

    try {
      let retryCount = 0;
      const maxRetries = 5;
      let resultText = "";

      const callGemini = async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      };

      // 指数バックオフ付きリトライ
      while (retryCount < maxRetries) {
        try {
          resultText = await callGemini();
          break;
        } catch (e) {
          retryCount++;
          await new Promise(res => setTimeout(res, Math.pow(2, retryCount) * 1000));
        }
      }

      if (resultText) {
        setFormData(prev => ({ 
          ...prev, 
          body_md: prev.body_md + "\n\n--- AI_ASSIST_RESULT ---\n\n" + resultText 
        }));
        setAiPrompt('');
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 保存処理 (Django API) ---
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 実際のエンドポイントに合わせて調整してください
      const response = await fetch('http://localhost:8000/api/content-hub/items/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans">
      <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="font-black italic uppercase tracking-tighter text-white">
            SHIN-VPS <span className="text-blue-500">Core_Editor</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 rounded-lg p-1 mr-4">
            <button 
              onClick={() => setViewMode('edit')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Edit3 size={14} /> WRITE
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Eye size={14} /> PREVIEW
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saveStatus === 'saving' ? 'SAVING...' : 'PUBLISH'}
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* 左サイドパネル */}
        <aside className="w-80 border-r border-white/5 bg-[#0f0f0f] overflow-y-auto p-6 hidden xl:block">
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-blue-500">
                <Settings size={12} /> Target_Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] block mb-1.5 text-zinc-400">DISTRIBUTION_SITE</label>
                  <select name="site" value={formData.site} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none">
                    <option value="bicstation">BicStation</option>
                    <option value="saving">Bic Saving</option>
                    <option value="tiper">Tiper (Adult)</option>
                    <option value="avflash">AV Flash</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-medium">Adult_Content</span>
                  <input type="checkbox" name="is_adult" checked={formData.is_adult} onChange={handleChange} className="w-4 h-4 accent-blue-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-medium">Public_Release</span>
                  <input type="checkbox" name="is_pub" checked={formData.is_pub} onChange={handleChange} className="w-4 h-4 accent-emerald-500" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Layout size={12} /> Series_Structure
              </h3>
              <div className="space-y-3">
                <input name="series_slug" placeholder="Series Slug" value={formData.series_slug} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm outline-none" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Vol_No</span>
                  <input type="number" name="episode_no" value={formData.episode_no} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm outline-none" />
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* 執筆エリア */}
        <section className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          <div className="max-w-4xl mx-auto p-12 space-y-6">
            <div className="space-y-4 border-b border-white/5 pb-8">
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="UNTITLED_ARTICLE"
                className="w-full bg-transparent text-4xl md:text-5xl font-black italic uppercase text-white outline-none placeholder:text-zinc-800"
              />
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1"><Terminal size={12}/> SLUG:</span>
                <input name="slug" value={formData.slug} onChange={handleChange} className="bg-transparent border-b border-white/10 outline-none focus:border-blue-500 text-blue-400 w-full" />
              </div>
            </div>

            {viewMode === 'edit' ? (
              <textarea 
                name="body_md"
                value={formData.body_md}
                onChange={handleChange}
                placeholder="AIと共に、新しい知識のアーカイブを構築しましょう..."
                className="w-full min-h-[60vh] bg-transparent resize-none outline-none text-lg leading-relaxed text-zinc-300 placeholder:text-zinc-800 font-mono focus:ring-0"
              />
            ) : (
              <div className="prose prose-invert prose-zinc max-w-none pb-20">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.body_md}</ReactMarkdown>
              </div>
            )}
          </div>
        </section>

        {/* AIサイドパネル */}
        <aside className="w-96 border-l border-white/5 bg-[#0f0f0f] flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Wand2 size={12} className={isAiLoading ? "animate-spin" : "animate-pulse"} /> AI_Assistant
            </h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <textarea 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="指示を入力してください..."
              className="w-full h-40 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-blue-500 resize-none text-white"
            />
            <button 
              onClick={askAi}
              disabled={isAiLoading || !aiPrompt}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10"
            >
              {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              GENERATE_CONTENT
            </button>

            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Presets</div>
              <div className="grid grid-cols-2 gap-2">
                {['構成案作成', '結論を執筆', '専門的に修正', '誤字脱字'].map(t => (
                  <button key={t} onClick={() => setAiPrompt(t)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-zinc-400">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-black border-t border-white/5 text-[10px] font-mono text-zinc-600 text-center">
            {isAiLoading ? "AI IS THINKING..." : "SYSTEM_READY"}
          </div>
        </aside>
      </main>

      {/* 通知 */}
      {saveStatus === 'success' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-300 z-[100]">
          <CheckCircle2 size={20} />
          <span className="font-bold tracking-widest">CONTENT_PUBLISHED_SUCCESSFULLY</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-[100]">
          <AlertCircle size={20} />
          <span className="font-bold tracking-widest">SAVE_FAILED: CHECK_CONSOLE</span>
        </div>
      )}
    </div>
  );
}