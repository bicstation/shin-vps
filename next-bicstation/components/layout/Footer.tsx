import React from 'react';
import Link from 'next/link';
// ✅ 共通カラー設定をインポート
import { COLORS } from '@/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  return (
    <footer style={{ 
      background: '#1a1a1a', 
      color: '#bbb', 
      padding: '60px 20px', 
      borderTop: `4px solid ${siteColor}` 
    }}>
      <div style={{ 
        maxWidth: '1100px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // 3列表示
        gap: '40px'
      }}>
        
        {/* 1列目：サイト情報 */}
        <div>
          <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2em' }}>BICSTATION</h3>
          <p style={{ fontSize: '0.9em', lineHeight: '1.6', color: '#888' }}>
            最新のPCスペックと価格をリアルタイムに比較。
            メーカー直販サイトの情報を集約し、あなたに最適な1台を見つけるお手伝いをします。
          </p>
        </div>

        {/* 2列目：クイックリンク */}
        <div>
          <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1em' }}>コンテンツ</h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95em' }}>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>🏠 カタログトップ</Link>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/bicstation" style={{ color: 'inherit', textDecoration: 'none' }}>📝 特集記事・ブログ</Link>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>ℹ️ BICSTATIONについて</Link>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>📧 お問い合わせ</Link>
            </li>
          </ul>
        </div>

        {/* 3列目：法的情報・SNS */}
        <div>
          <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1em' }}>インフォメーション</h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95em' }}>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/privacy-policy" style={{ color: '#888', textDecoration: 'none' }}>プライバシーポリシー</Link>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <Link href="/terms" style={{ color: '#888', textDecoration: 'none' }}>利用規約</Link>
            </li>
            <li style={{ marginBottom: '12px', fontSize: '0.85em', color: '#666', lineHeight: '1.5' }}>
              ※掲載情報の正確性には万全を期していますが、最新情報は必ず各メーカー公式サイトをご確認ください。
            </li>
          </ul>
        </div>
      </div>

      {/* 下部コピーライト */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '40px auto 0', 
        paddingTop: '20px', 
        borderTop: '1px solid #333', 
        textAlign: 'center',
        fontSize: '0.85em',
        color: '#666'
      }}>
        <p>&copy; {currentYear} BICSTATION. All Rights Reserved.</p>
      </div>
    </footer>
  );
}