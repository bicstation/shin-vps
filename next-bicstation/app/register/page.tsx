"use client"; // 🚀 1行目に追加

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';
import { getSiteMetadata } from '../../utils/siteConfig'; // 🚀 プレフィックス取得用に追加

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // パスワード一致チェック
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    setLoading(true);

    try {
      // 🚀 lib/auth.ts の registerUser を呼び出す
      await registerUser(username, email, password);

      // 🚀 登録成功後のリダイレクト先を動的に決定
      // window.location.pathname から "/bicstation" などを抽出
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const sitePrefix = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';
      const loginPath = `${sitePrefix}/login`;

      alert('会員登録が完了しました！ログインしてください。');

      // 登録後はログイン不要で自動遷移させる場合も多いですが、
      // 一旦ログイン画面へ飛ばす場合は href を使ってリフレッシュさせるのが確実です。
      window.location.href = loginPath;

    } catch (err: any) {
      setError(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 表示用のログインリンクもプレフィックスを考慮
  const { site_prefix } = getSiteMetadata();
  const loginHref = site_prefix ? `${site_prefix}/login` : '/login';

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>会員登録</h1>
      
      {error && (
        <div style={{ color: '#d9534f', backgroundColor: '#f2dede', padding: '10px', marginBottom: '20px', borderRadius: '4px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ユーザー名</label>
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="例: bic_taro"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="example@mail.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="8文字以上"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>パスワード（確認）</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? '登録中...' : 'アカウントを作成する'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        すでにアカウントをお持ちですか？{' '}
        <Link href={loginHref} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          ログイン
        </Link>
      </p>
    </div>
  );
}