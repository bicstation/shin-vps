"use client"; // 🚀 クライアントサイドでの動作を指定

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../../lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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

    // 入力バリデーション（一般ユーザー向けに分かりやすく）
    if (password !== confirmPassword) {
      setError('入力されたパスワードが一致しません。もう一度ご確認ください。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください。');
      return;
    }

    setLoading(true);

    try {
      // 🚀 lib/auth.ts の registerUser を呼び出し（内部でAPIドメインを切り替え）
      await registerUser(username, email, password);

      alert('会員登録ありがとうございます！ログイン画面からログインしてください。');

      // 💡 ログイン画面へリダイレクト（環境に合わせて自動判別）
      const loginUrl = `${window.location.origin}${basePath}/login`;
      window.location.href = loginUrl;

    } catch (err: any) {
      // サーバーからのエラーメッセージを親切に表示
      setError(err.message || '登録処理中にエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

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
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ユーザー名 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            ユーザー名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="例: tanaka_taro"
          />
        </div>

        {/* メールアドレス */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="example@mail.com"
          />
        </div>

        {/* パスワード */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="8文字以上で入力"
          />
        </div>

        {/* パスワード（確認） */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
            パスワード（確認用）
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
            placeholder="もう一度入力してください"
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
            fontSize: '1rem',
            transition: 'background-color 0.2s ease'
          }}
        >
          {loading ? '処理中...' : '無料でお試しを開始する'}
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '24px' }}>
        すでにアカウントをお持ちの方は{' '}
        <Link href={loginHref} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          ログイン
        </Link>
      </div>
    </div>
  );
}