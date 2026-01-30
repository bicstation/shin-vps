<<<<<<< HEAD
"use client"; // 🚀 クライアントサイドでの動作を指定

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';
=======
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';
import styles from './Register.module.css';
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc

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

  // 💡 サブパス（/bicstationなど）を管理
  const [basePath, setBasePath] = useState("");

  useEffect(() => {
    // 実行環境のURLからサブパスがあるか判定
    const currentPath = window.location.pathname;
    const hasSubPath = currentPath.startsWith('/bicstation');
    setBasePath(hasSubPath ? '/bicstation' : '');
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.group("🚀 Debug: Registration Process Started");

<<<<<<< HEAD
    // 入力バリデーション（一般ユーザー向けに分かりやすく）
    if (password !== confirmPassword) {
      setError('入力されたパスワードが一致しません。もう一度ご確認ください。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください。');
=======
    if (password !== confirmPassword) {
      const msg = "パスワードが一致しません。";
      console.error("Validation Error:", msg);
      setError(msg);
      setLoading(false);
      console.groupEnd();
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
      return;
    }

    try {
<<<<<<< HEAD
      // 🚀 lib/auth.ts の registerUser を呼び出し（内部でAPIドメインを切り替え）
      await registerUser(username, email, password);

      alert('会員登録ありがとうございます！ログイン画面からログインしてください。');

      // 💡 ログイン画面へリダイレクト（環境に合わせて自動判別）
      const loginUrl = `${window.location.origin}${basePath}/login`;
      window.location.href = loginUrl;

    } catch (err: any) {
      // サーバーからのエラーメッセージを親切に表示
      setError(err.message || '登録処理中にエラーが発生しました。時間を置いて再度お試しください。');
=======
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
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

<<<<<<< HEAD
  // 💡 ログインページへのリンクを動的に生成
  const loginHref = `${basePath}/login`;

  return (
    <div style={{ 
      maxWidth: '440px', 
      margin: '60px auto', 
      padding: '32px', 
      border: '1px solid #eaeaea', 
      borderRadius: '16px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      backgroundColor: '#fff'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
          新規会員登録
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          アカウントを作成してサービスを開始しましょう。
        </p>
      </div>
      
      {error && (
        <div style={{ 
          color: '#e53e3e', 
          backgroundColor: '#fff5f5', 
          padding: '12px 16px', 
          marginBottom: '24px', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          border: '1px solid #feb2b2',
          lineHeight: '1.5'
        }}>
          {error}
=======
  const loginHref = `${sitePrefix}/login`;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>会員登録</h1>
      
      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
        </div>
      )}

      <form onSubmit={handleSubmit}>
<<<<<<< HEAD
        {/* ユーザー名 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            ユーザー名
          </label>
=======
        <div className={styles.formGroup}>
          <label className={styles.label}>ユーザー名</label>
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          <input
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
<<<<<<< HEAD
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="例: tanaka_taro"
          />
        </div>

        {/* メールアドレス */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            メールアドレス
          </label>
=======
            placeholder="例: bic_taro"
            autoComplete="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>メールアドレス</label>
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
<<<<<<< HEAD
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
=======
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
            placeholder="example@mail.com"
            autoComplete="email"
          />
        </div>

<<<<<<< HEAD
        {/* パスワード */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード
          </label>
=======
        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード</label>
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
<<<<<<< HEAD
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="8文字以上で入力"
          />
        </div>

        {/* パスワード（確認） */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード（確認用）
          </label>
=======
            placeholder="8文字以上"
            autoComplete="new-password"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード（確認）</label>
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          <input
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
<<<<<<< HEAD
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="もう一度入力してください"
=======
            autoComplete="new-password"
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          />
        </div>

        <button
          type="submit"
          disabled={loading}
<<<<<<< HEAD
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#a0aec0' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background-color 0.2s ease'
          }}
=======
          className={styles.submitButton}
          style={{ backgroundColor: loading ? '#ccc' : '#0070f3' }}
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
        >
          {loading ? '処理中...' : '無料でお試しを開始する'}
        </button>
      </form>

<<<<<<< HEAD
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '24px' }}>
        すでにアカウントをお持ちの方は{' '}
        <Link href={loginHref} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
=======
      <p className={styles.footerText}>
        すでにアカウントをお持ちですか？{' '}
        <Link href={loginHref} className={styles.link}>
>>>>>>> 9acac766cbeb8f8e33c3fafebc8b06c24535c7fc
          ログイン
        </Link>
      </div>
    </div>
  );
}