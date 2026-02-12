"use client";

// 💡 【最強の回避策】Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { useState, FormEvent, Suspense, useEffect } from 'react';
import Link from 'next/link'; 
import { loginUser } from '@shared/lib/auth';
import { getSiteMetadata } from '@shared/lib/siteConfig';
// ✅ 修正ポイント: クライアントサイドでのURLパラメータ取得に必須
import { useSearchParams } from 'next/navigation';

/**
 * 💡 ログインフォーム本体のコンポーネント
 */
function LoginForm() {
  // ✅ 修正ポイント: コンポーネントの最上部で呼び出すことで Suspense 境界を確定させる
  // これにより、ビルド時に「このコンポーネントはクライアントサイドでのみ動作する」と明示されます
  const searchParams = useSearchParams();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMsg, setDebugMsg] = useState<string>(''); 
  const [basePath, setBasePath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const prefix = currentPath.split('/')[1];
      if (prefix === 'bicstation' || prefix === 'avflash') {
        setBasePath(`/${prefix}`);
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDebugMsg('1. フォーム送信開始...');
    setLoading(true);

    try {
      setDebugMsg('2. API通信(auth.ts)を呼び出し中...');
      // 💡 lib/auth.ts 内で cookie セットやリダイレクト処理が行われる想定
      await loginUser(username, password);
      
      setDebugMsg('3. 通信成功！リダイレクトを待機中...');
      window.location.href = `${window.location.origin}${basePath}/`;
    } catch (err: any) {
      console.error("Login Error:", err);
      setDebugMsg(`❌ エラー発生: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  // ✅ getSiteMetadata が undefined の場合も考慮して安全に取得
  const metadata = getSiteMetadata() || {};
  const registerHref = metadata.site_prefix ? `${metadata.site_prefix}/register` : `${basePath}/register`;

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">ログイン</h1>
        
        {/* デバッグ用ステータス */}
        {loading && (
          <div className="mb-4 text-xs text-blue-500 font-mono text-center bg-blue-50 p-2 rounded">
            {debugMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <span className="font-bold mr-2">!</span>
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
              placeholder="ユーザー名を入力"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all"
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
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 active:transform active:scale-[0.98]' 
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                処理中...
              </span>
            ) : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link href={registerHref} className="text-orange-600 font-bold hover:underline text-sm">
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ ページエントリポイント
 * useSearchParams() を内部で実行する LoginForm コンポーネントを
 * 確実に Suspense 境界で保護します。
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-orange-500 rounded-full border-t-transparent"></div>
          <p className="text-gray-400 text-sm animate-pulse">Loading Authentication...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}