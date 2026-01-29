"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../lib/auth';

/**
 * 🚀 ユーザー情報の型定義
 */
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
      const storedUser = localStorage.getItem('user');
      
      // 🚀 トークンもユーザー情報も無い場合は未ログインと判断
      if (!token && !storedUser) {
        console.warn("🚩 ログイン情報が見つかりません。ログインページへ移動します。");
        router.push('/login'); // 相対パスで安全に遷移
        return;
      }

      // 環境変数からAPIのベースURLを取得（ローカルなら localhost:8083, VPSならドメイン）
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      try {
        console.log("📡 プロフィール取得リクエスト:", `${API_BASE}/auth/me/`);
        
        const res = await fetch(`${API_BASE}/auth/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // トークンがある場合のみAuthorizationヘッダーを付与
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          // 💡 重要: Cookie（sessionid）をVPS環境でも正しく送受信するために必要
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.error("❌ 認証エラー。再ログインが必要です。");
            logoutUser(); 
            return;
          }
          throw new Error(`エラーが発生しました (Status: ${res.status})`);
        }

        const data = await res.json();
        
        // 💡 レスポンスが { isSuccess: true, user: {...} } の場合と {...} 直接の場合の両方に対応
        const userData = data.user || data;
        setUser(userData);

        // localStorage のユーザー情報を最新に更新
        localStorage.setItem('user', JSON.stringify(userData));

      } catch (err: any) {
        console.error("🔥 Fetch Error:", err);
        setError(err.message || 'プロフィールの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // -----------------------------------------------------------
  // レンダリングロジック
  // -----------------------------------------------------------
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #0070f3', paddingBottom: '10px', fontSize: '1.5rem' }}>マイページ</h1>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: '#0070f3', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2rem', fontWeight: 'bold' 
          }}>
            {(user.username || 'U').charAt(0).toUpperCase()}
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
                {user.site_group?.toUpperCase() || 'GENERAL'}
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
            onClick={() => alert('プロフィール編集は現在準備中です')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            設定変更
          </button>
          
          <button 
            onClick={() => { if(confirm('ログアウトしますか？')) logoutUser(); }}
            style={{ flex: 1, padding: '12px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}