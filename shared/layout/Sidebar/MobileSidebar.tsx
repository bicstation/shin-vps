'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ☰ ボタン */}
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: '22px',
          padding: '8px',
          background: 'none',
          border: 'none',
          color: '#fff'
        }}
      >
        ☰
      </button>

      {/* オーバーレイ */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40
          }}
        />
      )}

      {/* サイドバー */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: open ? 0 : '-260px',
          width: '260px',
          height: '100%',
          background: '#020617',
          padding: '20px',
          transition: '0.3s',
          zIndex: 50,
          overflowY: 'auto'
        }}
      >
        {/* 閉じる */}
        <button
          onClick={() => setOpen(false)}
          style={{
            marginBottom: '20px',
            fontSize: '18px',
            background: 'none',
            border: 'none',
            color: '#fff'
          }}
        >
          ×
        </button>

        {/* 🔥 メイン導線 */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/ranking" style={linkPrimary}>
            👉 おすすめを見る
          </Link>
        </div>

        {/* 📘 ガイド */}
        <div style={section}>
          <p style={sectionTitle}>ガイド</p>
          <Link href="/guide/pc-select" style={link}>PCの選び方</Link>
          <Link href="/guide/cpu" style={link}>CPU</Link>
          <Link href="/guide/laptop-vs-desktop" style={link}>ノート vs デスクトップ</Link>
        </div>

        {/* 🎯 用途 */}
        <div style={section}>
          <p style={sectionTitle}>用途別</p>
          <Link href="/ranking?type=gaming" style={link}>ゲーミング</Link>
          <Link href="/ranking?type=business" style={link}>仕事用</Link>
          <Link href="/ranking?type=cost" style={link}>コスパ重視</Link>
        </div>

        {/* 🏢 メーカー */}
        <div style={section}>
          <p style={sectionTitle}>メーカー</p>
          <Link href="/ranking?maker=dell" style={link}>Dell</Link>
          <Link href="/ranking?maker=hp" style={link}>HP</Link>
          <Link href="/ranking?maker=lenovo" style={link}>Lenovo</Link>
        </div>
      </div>
    </>
  );
}

const linkPrimary = {
  display: 'block',
  padding: '12px',
  background: '#22c55e',
  color: '#000',
  borderRadius: '8px',
  fontWeight: 'bold',
  textAlign: 'center'
};

const link = {
  display: 'block',
  padding: '10px 0',
  fontSize: '14px',
  color: '#cbd5f5'
};

const section = {
  marginBottom: '20px'
};

const sectionTitle = {
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '8px'
};