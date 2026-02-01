"use client";

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@shared/components/lib/auth';
import { getSiteMetadata } from '@shared/components/lib/siteConfig';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // サイト設定の取得（リンク用）
  const { site_prefix } = getSiteMetadata();
  const loginHref = site_prefix ? `${site_prefix}/login` : '/login';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワード（確認用）が一致しません。');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります。');
      setLoading(false);
      return;
    }

    try {
      // 🚀 lib/auth.ts の registerUser を呼び出し
      await registerUser(username, email, password);
      
      alert('会員登録が完了しました！ログインページへ移動します。');
      
      // ログイン画面へ遷移
      router.push(loginHref);
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || '登録に失敗しました。ユーザー名やメールアドレスが既に使用されている可能性があります。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Join Tiper Live</h1>
          <p className={styles.subtitle}>
            最高のアダルト体験を。今すぐ無料登録。
          </p>
        </div>
        
        {error && (
          <div className={styles.errorBox}>
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <div>
            <label className={styles.label}>User Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="例: tip_master"
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="mail@example.com"
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8文字以上の英数字"
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="パスワードを再入力"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitBtn} ${
              loading ? styles.btnLoading : styles.btnActive
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : '無料でお試しを開始する'}
          </button>
        </form>

        <div className={styles.footer}>
          すでにアカウントをお持ちですか？{' '}
          <Link href={loginHref} className={styles.loginLink}>
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}