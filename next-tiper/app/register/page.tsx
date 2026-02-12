"use client";

// 💡 Next.jsの静的解析を強制的にバイパスします
export const dynamic = "force-dynamic";

import React, { useState, useEffect, FormEvent, Suspense } from 'react';
import Link from 'next/link';
// ✅ 実際の利用がなくても、ビルド時の「Suspense境界エラー」を防ぐためにインポート
import { useSearchParams } from 'next/navigation';
// ✅ ディレクトリ構造に合わせたインポート
import { registerUser } from '@shared/lib/auth';

/**
 * 💡 フォーム本体のコンポーネント
 * Next.js 15 のビルドエラーを回避するため、ロジックをここに分離します。
 */
function RegisterFormInner() {
  // 💡 フックを呼び出しておくことで、Suspenseがこのコンポーネントを監視するようにします
  // Next.js 15 では、この呼び出しが含まれるコンポーネントが Suspense の「外側」にあるとビルドエラーになります
  const searchParams = useSearchParams();

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
    const prefix = currentPath.startsWith('/bicstation') ? '/bicstation' : 
                   currentPath.startsWith('/avflash') ? '/avflash' : '';
    setBasePath(prefix);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      await registerUser(username, email, password);
      alert('会員登録が完了しました！ログインしてください。');
      window.location.href = `${window.location.origin}${basePath}/login`;
    } catch (err: any) {
      setError(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const loginHref = `${basePath}/login`;
  const ACCENT_COLOR = '#ff4500'; // avflash用のアクセントカラー

  return (
    <div style={{ 
      maxWidth: '440px', 
      margin: '60px auto', 
      padding: '32px', 
      border: '1px solid #eaeaea', 
      borderRadius: '16px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
          新規会員登録
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          お気に入りの作品やレビューを保存しましょう。
        </p>
      </div>
      
      {error && (
        <div style={{ 
          color: '#e53e3e', backgroundColor: '#fff5f5', padding: '12px 16px', 
          marginBottom: '24px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #feb2b2'
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
            placeholder="例: av_taro"
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
            width: '100%', padding: '14px', backgroundColor: loading ? '#cbd5e0' : ACCENT_COLOR,
            color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '1rem'
          }}
        >
          {loading ? '登録処理中...' : '会員登録を完了する'}
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '24px' }}>
        すでにアカウントをお持ちですか？{' '}
        <Link href={loginHref} style={{ color: ACCENT_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>
          ログイン
        </Link>
      </div>
    </div>
  );
}

/**
 * ✅ Next.js 15 用のエントリポイント
 * Suspense境界を作ることで、ビルド時のエラーを解消します。
 * 💡 内部コンポーネントを確実に Suspense で包む形式を維持します。
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#666', animatePulse: 'true' } as any}>読み込み中...</p>
      </div>
    }>
      <RegisterFormInner />
    </Suspense>
  );
}