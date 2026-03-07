"use client";
/**
 * ファイルパス: /home/maya/dev/shin-vps/next-bic-saving/app/login/page.tsx
 * * 💡 Next.jsの静的解析を回避し、ランタイムでの動作を保証します
 */
export const dynamic = "force-dynamic";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link'; 

/**
 * ✅ インポートパスの修正
 * 物理構造 (/shared/lib/utils/...) に基づき、
 * Webpackの Module not found エラーを回避するために正確なエイリアスパスを指定します。
 */
import { loginUser } from '@shared/lib/utils/auth';
import { getSiteMetadata } from '@shared/lib/utils/siteConfig';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMsg, setDebugMsg] = useState<string>(''); // 🚀 進行状況の可視化

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDebugMsg('1. 認証プロセスを開始...');
    setLoading(true);

    try {
      console.log("Login sequence initiated for:", username);
      
      setDebugMsg('2. 認証サーバー(Django/Auth)に問い合わせ中...');
      /**
       * 💡 auth.tsx 内で実際の fetch やクッキーセット、リダイレクトが行われます。
       * 物理パス: shared/lib/utils/auth.tsx
       */
      await loginUser(username, password);
      
      setDebugMsg('3. 認証成功。ダッシュボードへ移動します...');

    } catch (err: any) {
      console.error("Login Error:", err);
      setDebugMsg(`❌ エラー: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。');
      setLoading(false);
    }
  };

  // ✅ サイト設定から情報を取得（ホスト名に応じた接頭辞など）
  // 物理パス: shared/lib/utils/siteConfig.ts
  const site = getSiteMetadata();
  const registerHref = site?.site_prefix ? `${site.site_prefix}/register` : '/register';

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">ログイン</h1>
        
        {/* ステータス表示（デバッグ・進捗用） */}
        {loading && (
          <div className="mb-4 text-xs text-blue-500 font-mono text-center bg-blue-50 p-2 rounded animate-pulse">
            {debugMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">ユーザー名</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">パスワード</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {loading ? '認証中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link href={registerHref} className="text-blue-600 font-bold hover:underline text-sm transition-all">
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}