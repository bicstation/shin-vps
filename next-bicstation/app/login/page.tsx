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

  /**
   * 💡 フォーム送信処理
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Login sequence initiated...");
      
      // auth.ts の loginUser を呼び出します。
      // 成功すれば auth.ts 側の getBasePath() ロジックにより
      // 自動的に適切なトップページへリダイレクトされます。
      await loginUser(username, password);

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  // リンク用メタデータ取得
  const { site_prefix } = getSiteMetadata();
  const registerHref = site_prefix ? `${site_prefix}/register` : '/register';

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          ログイン
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ユーザー名入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              ユーザー名
            </label>
            <input 
              type="text" 
              placeholder="ユーザー名" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
            />
          </div>

          {/* パスワード入力 */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              パスワード
            </label>
            <input 
              type="password" 
              placeholder="パスワード" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
            />
          </div>

          {/* 送信ボタン */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] mt-4 shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {loading ? '通信中...' : 'ログイン'}
          </button>
        </form>

        {/* 新規登録への案内 */}
        <div className="mt-10 pt-6 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-500 mb-2">
            アカウントをお持ちでないですか？
          </p>
          <Link 
            href={registerHref} 
            className="text-blue-600 font-bold hover:underline"
          >
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}