"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link'; 
import { loginUser } from '@shared/lib/auth';
import { getSiteMetadata } from '@shared/lib/siteConfig';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMsg, setDebugMsg] = useState<string>(''); // 🚀 どこで止まったか表示する用

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDebugMsg('1. フォーム送信開始...');
    setLoading(true);

    try {
      console.log("Login sequence initiated...");
      
      setDebugMsg('2. API通信(auth.ts)を呼び出し中...');
      await loginUser(username, password);
      
      // 通常、成功すれば auth.ts 側でリダイレクトされるのでここには来ません
      setDebugMsg('3. 通信成功！リダイレクトを待機中...');

    } catch (err: any) {
      console.error("Login Error:", err);
      setDebugMsg(`❌ エラー発生: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  const { site_prefix } = getSiteMetadata();
  const registerHref = site_prefix ? `${site_prefix}/register` : '/register';

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">ログイン</h1>
        
        {/* ステータス表示（デバッグ用） */}
        {loading && (
          <div className="mb-4 text-xs text-blue-500 font-mono text-center bg-blue-50 p-2 rounded">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '処理中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link href={registerHref} className="text-blue-600 font-bold hover:underline text-sm">
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}