"use client"; // ログイン状態を扱うため client component にします

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSiteMetadata } from '../utils/siteConfig'; // 先ほど確認したパス判定ユーティリティ
import { getAuthUser, logoutUser } from '../lib/auth'; // 認証用ライブラリ

export default function Header({ title }: { title: string }) {
  const [user, setUser] = useState<any>(null);
  const { site_prefix } = getSiteMetadata(); // "/tiper" または "" が返る

  useEffect(() => {
    // ログインユーザーの情報を取得
    const authUser = getAuthUser();
    setUser(authUser);
  }, []);

  // リンクのベースURLを組み立てる関数
  const getPath = (path: string) => `${site_prefix}${path}`;

  return (
    <header style={{
      background: '#1f1f3a', color: '#e94560', padding: '15px 20px',
      borderBottom: '3px solid #e94560', boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: '1.8em' }}>
          <Link href={getPath('/')} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</Link>
        </h1>
        
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <Link href={getPath('/')} style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>TOP</Link>
          <Link href={getPath('/adults')} style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>商品一覧</Link>
          
          {/* --- ログイン状態による分岐 --- */}
          {user ? (
            <>
              <Link href={getPath('/mypage')} style={{ color: '#ffcc00', margin: '0 10px', textDecoration: 'none', fontWeight: 'bold' }}>
                👤 {user.username}
              </Link>
              <button 
                onClick={() => logoutUser()} 
                style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', margin: '0 10px' }}
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href={getPath('/login')} style={{ 
              background: '#e94560', color: '#fff', padding: '5px 15px', 
              borderRadius: '5px', margin: '0 10px', textDecoration: 'none' 
            }}>
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}