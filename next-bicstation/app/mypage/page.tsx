"use client"; // 🚀 1行目に追加

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../lib/auth';
import { getSiteMetadata } from '../../utils/siteConfig'; // 🚀 リダイレクト用にインポート

// 🚀 ユーザー情報の型定義
interface UserProfile {
  id: number;
  username: string;
  email: string;
  site_group: 'general' | 'adult' | string;
  origin_domain: string;
  profile_image?: string;
  bio?: string;
}

export default function MyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      // サーバーサイドレンダリング時は実行しない
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('access_token');
      
      // 🚀 トークンがない場合、正しいログインページへ飛ばす
      if (!token) {
        const { site_prefix } = getSiteMetadata();
        const loginPath = site_prefix ? `${site_prefix}/login` : '/login';
        window.location.href = loginPath; // リロードを伴う遷移でヘッダーをリセット
        return;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';

      try {
        const res = await fetch(`${API_BASE}/auth/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            logoutUser(); // トークン期限切れならログアウト
            return;
          }
          throw new Error('プロフィールの取得に失敗しました。');
        }

        const data: UserProfile = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // router への依存を外し初回のみ実行

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #0070f3', paddingBottom: '10px', fontSize: '1.5rem' }}>マイページ</h1>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0070f3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user.username}</h2>
            <p style={{ color: '#666', margin: '5px 0' }}>{user.email}</p>
          </div>
        </div>

        <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>🌐 システム連携ステータス</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#555' }}>現在の属性:</span>
            <span>
              <span style={{ 
                backgroundColor: user.site_group === 'adult' ? '#ff4d4f' : '#52c41a', 
                color: 'white', 
                padding: '3px 10px', 
                borderRadius: '12px', 
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                {user.site_group === 'adult' ? 'ADULT' : 'GENERAL'}
              </span>
            </span>

            <span style={{ fontWeight: 'bold', color: '#555' }}>最終同期URL:</span>
            <span style={{ color: '#0070f3', wordBreak: 'break-all' }}>{user.origin_domain || '未同期'}</span>

            <span style={{ fontWeight: 'bold', color: '#555' }}>ユーザーID:</span>
            <span style={{ color: '#888' }}>#{user.id}</span>
          </div>
        </section>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => alert('プロフィール編集は開発中です')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            設定変更
          </button>
          
          <button 
            onClick={logoutUser}
            style={{ flex: 1, padding: '12px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}