"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [basePath, setBasePath] = useState("");

  // 環境判別（サブパス対応）
  useEffect(() => {
    const currentPath = window.location.pathname;
    const prefix = currentPath.startsWith('/bicstation') ? '/bicstation' : '';
    setBasePath(prefix);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      setLoading(false);
      return;
    }

    try {
      // 🚀 lib/auth.ts の registerUser を呼び出し
      await registerUser(username, email, password);
      
      alert('会員登録が完了しました！ログインしてください。');
      
      // ログイン画面へ遷移
      window.location.href = `${window.location.origin}${basePath}/login`;
    } catch (err: any) {
      setError(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

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
          border: '1px solid #feb2b2'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            ユーザー名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="例: bic_taro"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="example@mail.com"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="8文字以上"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード（確認用）
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#a0aec0' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? '処理中...' : '無料でお試しを開始する'}
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '24px' }}>
        すでにアカウントをお持ちですか？{' '}
        <Link href={loginHref} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          ログイン
        </Link>
      </div>
    </div>
  );
}