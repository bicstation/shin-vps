"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';
import styles from './Register.module.css'; // 🚀 CSSをインポート

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sitePrefix, setSitePrefix] = useState<string>('');

  // 1. 環境判別 & デバッグ開始
  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const prefix = segments.length > 0 ? `/${segments[0]}` : '';
    
    setSitePrefix(prefix);

    console.group("🔍 Debug: Environment Check");
    console.log("Current Pathname:", path);
    console.log("Detected Site Prefix:", prefix || "(Root /)");
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
      console.log("Calling registerUser with prefix-aware API...");
      const result = await registerUser(username, email, password);
      
      console.log("✅ Success:", result);
      alert('会員登録が完了しました！ログインしてください。');
      
      const loginPath = `${sitePrefix}/login`;
      window.location.href = loginPath;

    } catch (err: any) {
      console.error("❌ Registration Failed:", err);
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