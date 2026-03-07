"use client";

// 💡 【最強の回避策】Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link'; 
// ✅ 共通ライブラリのパスをプロジェクトの設定に合わせて最適化
import { loginUser } from '@shared/lib/utils/auth';
import { getSiteMetadata } from '@shared/lib/utils/siteConfig';

/**
 * ログインページ
 * 💡 開発効率を上げるデバッグステータス表示機能付き
 */
export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMsg, setDebugMsg] = useState<string>(''); // 🚀 進行状況の可視化

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDebugMsg('1. 認証プロセスを開始しました...');
    setLoading(true);

    try {
      console.log("Login sequence initiated for:", username);
      
      setDebugMsg('2. 認証サーバーにリクエスト送信中...');
      // 成功時は auth.ts 内のロジックによりリダイレクトされます
      await loginUser(username, password);
      
      setDebugMsg('3. 認証成功。マイページへ移動します...');

    } catch (err: any) {
      console.error("Login Error:", err);
      // どこで失敗したかをユーザーにわかりやすく表示
      setDebugMsg(`❌ プロセス停止: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。');
      setLoading(false);
    }
  };

  // サイトごとのプレフィックス（/bicstation 等）を取得してリンクを調整
  const { site_prefix } = getSiteMetadata();
  const registerHref = site_prefix ? `${site_prefix}/register` : '/register';

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4 bg-gray-50/50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ログイン</h1>
          <p className="text-gray-500 text-sm">BICSTATION アカウントにサインイン</p>
        </div>
        
        {/* プロセスデバッグ表示（ローディング中のみ表示） */}
        {loading && (
          <div className="mb-6 overflow-hidden rounded-lg bg-blue-50 border border-blue-100">
            <div className="px-4 py-2 text-[10px] font-mono text-blue-600 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {debugMsg}
            </div>
            <div className="h-1 bg-blue-100 w-full">
              <div className="h-1 bg-blue-500 animate-progress-indefinite"></div>
            </div>
          </div>
        )}

        {/* エラーフィードバック */}
        {error && (
          <div 
            role="alert" 
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm flex gap-3 items-start"
          >
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">ユーザー名</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              autoComplete="username"
              placeholder="Username"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">パスワード</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-[0.98] ${
              loading ? 'bg-gray-400 shadow-none' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                認証中...
              </span>
            ) : 'ログイン'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-2">まだアカウントをお持ちではありませんか？</p>
          <Link href={registerHref} className="text-blue-600 font-extrabold hover:text-blue-800 transition-colors">
            新規会員登録（無料） ➔
          </Link>
        </div>
      </div>
    </div>
  );
}