"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { loginUser } from '../../lib/auth';
import { getSiteMetadata } from '../../utils/siteConfig';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(username, password);

      // 🚀 現在のURLパスから、確実にプレフィックスを特定する
      const currentPath = window.location.pathname; // 例: "/bicstation/login"
      
      // "/bicstation/login" から "/bicstation" を抽出
      // スラッシュで分割して、最初の要素を再構成する
      const pathSegments = currentPath.split('/').filter(Boolean);
      const sitePrefix = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';

      // 🚀 遷移先を "/bicstation" (または "/") に設定
      const destination = sitePrefix || '/';

      console.log("Login success! Current path:", currentPath);
      console.log("Determined destination:", destination);
      
      // 強制リロード遷移
      window.location.href = destination;

    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // リンク用のパス（表示用）
  const { site_prefix } = getSiteMetadata();
  const registerHref = site_prefix ? `${site_prefix}/register` : '/register';

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>ログイン</h1>
      
      {error && (
        <p style={{ color: '#d9534f', backgroundColor: '#f2dede', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ユーザー名</label>
          <input 
            type="text" 
            placeholder="ユーザー名を入力" 
            value={username} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} 
            required
            style={{ display: 'block', width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>パスワード</label>
          <input 
            type="password" 
            placeholder="パスワードを入力" 
            value={password} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
            required
            style={{ display: 'block', width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        アカウントをお持ちでないですか？<br />
        <Link href={registerHref} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          新規会員登録はこちら
        </Link>
      </div>
    </div>
  );
}