"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../lib/auth';
import styles from './MyPage.module.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  site_group: 'general' | 'adult' | string;
  origin_domain: string;
  is_staff: boolean;
  is_superuser: boolean;
  profile_image?: string;
  status_message?: string;
  bio?: string;
}

export default function MyPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window === 'undefined') return;

      // 💡 判定を修正: JWTトークン、またはセッション用のuser情報の有無を確認
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      // 両方とも無い場合は未ログインとみなす
      if (!token && !storedUser) {
        console.warn("⚠️ 認証情報が見つからないためログイン画面へリダイレクトします");
        router.push('/login');
        return;
      }

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // トークンがある場合のみAuthorizationヘッダーを付与
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/auth/me/`, {
          method: 'GET',
          headers: headers,
          // 💡 セッションCookieを送信するために必須
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.error("❌ 認証エラーが発生しました");
            logoutUser();
            return;
          }
          throw new Error(`サーバーエラー (${res.status})`);
        }

        const data = await res.json();
        // Djangoのレスポンスが { user: {...} } か直接 {...} かに対応
        const userData = data.user || data;
        setUser(userData);
        
        // 最新のユーザー情報をキャッシュとして保存
        localStorage.setItem('user', JSON.stringify(userData));

      } catch (err: any) {
        console.error("🔥 プロフィール取得失敗:", err);
        setError(err.message);
        
        // 通信エラー等で取得できないが、ローカルにデータがある場合はそれを使う（予備）
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setError(''); // エラー表示をクリア
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className={styles.centerMsg}>読み込み中...</div>;
  if (error && !user) return <div className={styles.centerMsg} style={{color: 'red'}}>{error}</div>;
  if (!user) return null;

  return (
    <div className={styles.container}>
      {/* サイドバー */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>
            {(user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <button 
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? styles.activeNavItem : styles.navItem}
          >
            👤 プロフィール
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={activeTab === 'settings' ? styles.activeNavItem : styles.navItem}
          >
            ⚙️ アカウント設定
          </button>

          <hr className={styles.divider} />

          {user.is_staff && (
            <div style={{ padding: '10px 0' }}>
              <p className={styles.label}>ADMIN ONLY</p>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL}/admin/`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.adminLink}
              >
                🛠 Django 管理画面
              </a>
            </div>
          )}
        </nav>

        <button 
          onClick={() => confirm('ログアウトしますか？') && logoutUser()} 
          className={styles.logoutButton}
        >
          🚪 ログアウト
        </button>
      </aside>

      {/* メインコンテンツ */}
      <main className={styles.mainContent}>
        <header className={styles.contentHeader}>
          <h1 style={{ fontSize: '1.4rem' }}>
            {activeTab === 'profile' ? 'プロフィール情報' : 'アカウント設定'}
          </h1>
          <span 
            className={styles.statusBadge}
            style={{ backgroundColor: user.site_group === 'adult' ? '#ff4d4f' : '#52c41a' }}
          >
            {user.site_group?.toUpperCase() || 'GENERAL'} MODE
          </span>
        </header>

        {activeTab === 'profile' ? (
          <div className={styles.card}>
            <section style={{ marginBottom: '40px' }}>
              <h3 className={styles.sectionTitle}>🌐 システム連携ステータス</h3>
              <div className={styles.grid}>
                <span className={styles.gridKey}>ユーザーID</span>
                <span className={styles.gridValue}>#{user.id}</span>
                <span className={styles.gridKey}>スタッフ権限</span>
                <span className={styles.gridValue}>{user.is_staff ? '✅ あり' : '❌ なし'}</span>
                <span className={styles.gridKey}>同期ドメイン</span>
                <span className={styles.gridValue}>{user.origin_domain || '未設定'}</span>
              </div>
            </section>

            <section>
              <h3 className={styles.sectionTitle}>📝 自己紹介</h3>
              <div className={styles.bioBox}>
                <p>{user.bio || '自己紹介文が設定されていません。'}</p>
              </div>
            </section>
          </div>
        ) : (
          <div className={styles.card}>
            <p>設定変更機能は開発中です。</p>
          </div>
        )}
      </main>
    </div>
  );
}