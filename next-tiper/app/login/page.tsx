"use client";
// 💡 【最強の回避策】Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link'; 
// ✅ 修正ポイント: shared の新構造に合わせたインポートパス
import { loginUser } from '@shared/lib/auth';
import { getSiteMetadata } from '@shared/lib/siteConfig';
import styles from './Login.module.css'; 

export default function LoginPage() {
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
      // 💡 lib/auth.ts 内で cookie セットやリダイレクト処理が行われる想定
      await loginUser(username, password);
      
      setDebugMsg('SEQUENCE: SUCCESS. REDIRECTING...');
      // 成功時は lib/auth 内で window.location.href 等による遷移が行われます
    } catch (err: any) {
      console.error("Login Error:", err);
      setDebugMsg(`ERROR: ${err.message}`);
      setError(err.message || 'ログインに失敗しました。');
      setLoading(false);
    }
  };

  const siteMetadata = getSiteMetadata();
  const sitePrefix = siteMetadata?.site_prefix || '';
  // 💡 サイト固有のプレフィックスがある場合に対応したリンク生成
  const registerHref = sitePrefix ? `${sitePrefix}/register` : '/register';

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Member Login</h1>
        
        {/* デバッグ用ステータス（開発・運用初期に便利） */}
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