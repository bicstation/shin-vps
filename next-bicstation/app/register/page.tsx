"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';
import styles from './Register.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sitePrefix, setSitePrefix] = useState<string>('');

  // 1. 【修正ポイント】環境判別ロジックの改善
  useEffect(() => {
    const path = window.location.pathname;
    
    // パスを / で分割し、空要素を除去
    const segments = path.split('/').filter(Boolean);
    
    // 'register' や 'login' はページ名であり、プレフィックスではないので除外する
    const prefixSegments = segments.filter(s => s !== 'register' && s !== 'login');
    
    // 最初のセグメントが残っていればそれがプレフィックス (例: /bicstation)
    const prefix = prefixSegments.length > 0 ? `/${prefixSegments[0]}` : '';
    
    setSitePrefix(prefix);

    console.group("🔍 Debug: Environment Check");
    console.log("Current Pathname:", path);
    console.log("Detected Site Prefix (Corrected):", prefix || "(Root /)");
    console.groupEnd();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.group("🚀 Debug: Registration Process Started");

    if (password !== confirmPassword) {
      const msg = "パスワードが一致しません。";
      console.error("Validation Error:", msg);
      setError(msg);
      setLoading(false);
      console.groupEnd();
      return;
    }

    try {
      // lib/auth.ts の修正版 registerUser を呼び出し
      // (email も確実に送信されるようになっています)
      console.log("Calling registerUser...");
      const result = await registerUser(username, email, password);
      
      console.log("✅ Success:", result);
      alert('会員登録が完了しました！ログインしてください。');
      
      // 正しいプレフィックスを使用してログイン画面へ
      const loginPath = `${sitePrefix}/login`;
      console.log("🔄 Redirecting to:", loginPath);
      window.location.href = loginPath;

    } catch (err: any) {
      console.error("❌ Registration Failed:", err);
      // Django側から詳細なエラー（email重複など）が返ればそれを表示
      setError(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const loginHref = `${sitePrefix}/login`;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>会員登録</h1>
      
      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>ユーザー名</label>
          <input
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="例: bic_taro"
            autoComplete="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>メールアドレス</label>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@mail.com"
            autoComplete="email"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード</label>
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="8文字以上"
            autoComplete="new-password"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード（確認）</label>
          <input
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
          style={{ backgroundColor: loading ? '#ccc' : '#0070f3' }}
        >
          {loading ? '登録中...' : 'アカウントを作成する'}
        </button>
      </form>

      <p className={styles.footerText}>
        すでにアカウントをお持ちですか？{' '}
        <Link href={loginHref} className={styles.link}>
          ログイン
        </Link>
      </p>
    </div>
  );
}