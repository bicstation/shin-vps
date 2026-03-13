"use client";

// 💡 【最強の回避策】Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link'; 

/**
 * ✅ 修正ポイント: 
 * 1. loginUser のパスを utils/auth へ。
 * 2. getSiteMetadata のインポートに 'from' を追加し、パスを utils/siteConfig へ。
 */
import { loginUser } from '@/shared/lib/utils/auth';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// ✅ useSearchParams を明示的にインポート
import { useSearchParams } from 'next/navigation';
import styles from './Login.module.css'; 

/**
 * 💡 フォーム本体のコンポーネント
 * Next.js 15 の「Missing Suspense Boundary」エラーを回避するために分離。
 */
function LoginFormInner() {
  // 💡 クライアントサイドでのフック呼び出し
  const searchParams = useSearchParams();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMsg, setDebugMsg] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setDebugMsg('SEQUENCE: STARTING AUTH...');
    setLoading(true);

    try {
      console.log("Login sequence initiated...");
      setDebugMsg('SEQUENCE: CALLING AUTH API...');
      
      // 💡 lib/utils/auth.ts 内で cookie セットやリダイレクト処理が行われる想定
      await loginUser(username, password);
      
      setDebugMsg('SEQUENCE: SUCCESS. REDIRECTING...');
    } catch (err: any) {
      console.error("Login Error:", err);
      setDebugMsg(`ERROR: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  /**
   * ✅ siteConfig からメタデータを取得
   * getSiteMetadata は通常ホスト名を引数に取りますが、
   * クライアントサイドでは window.location.host を参照する実装になっているか確認が必要です。
   */
  const siteMetadata = getSiteMetadata(typeof window !== 'undefined' ? window.location.host : '');
  const sitePrefix = siteMetadata?.site_prefix || '';
  const registerHref = sitePrefix ? `${sitePrefix}/register` : '/register';

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Member Login</h1>
        
        {loading && (
          <div className={styles.debugBox}>
            {debugMsg}
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <span className="font-bold mr-2">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <div>
            <label className={styles.label}>USER NAME</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              autoComplete="username"
              placeholder="ユーザー名を入力"
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>PASSWORD</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`${styles.submitBtn} ${
              loading ? styles.submitBtnLoading : styles.submitBtnActive
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : 'Login to Tiper'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href={registerHref} className={styles.registerLink}>
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ Next.js 15 用のエントリポイント
 * ビルド時の強制エラーを防ぐために Suspense でラップします。
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#06060a' }}>
        <p style={{ color: '#e94560', fontFamily: 'monospace' }}>SYNCING_AUTH_GATEWAY...</p>
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}