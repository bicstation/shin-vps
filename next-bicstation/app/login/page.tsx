"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link'; 
import { loginUser } from '../../lib/auth';
import { getSiteMetadata } from '../../utils/siteConfig';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(username, password);
      console.log("Login sequence initiated...");
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  const { site_prefix } = getSiteMetadata();
  const registerHref = site_prefix ? `${site_prefix}/register` : '/register';

  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">ログイン</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ユーザー名
          </label>
          <input 
            type="text" 
            placeholder="ユーザー名を入力" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
            autoComplete="username"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            パスワード
          </label>
          <input 
            type="password" 
            placeholder="パスワードを入力" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
          }`}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
        アカウントをお持ちでないですか？<br />
        <Link href={registerHref} className="inline-block mt-2 text-blue-600 font-bold hover:underline">
          新規会員登録はこちら
        </Link>
      </div>
    </div>
  );
}