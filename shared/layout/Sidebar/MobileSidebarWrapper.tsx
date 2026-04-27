'use client';

import { useState } from 'react';
import SidebarWrapper from './SidebarWrapper';

export default function MobileSidebarWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ☰ */}
      <button onClick={() => setOpen(true)}>
        ☰
      </button>

      {/* オーバーレイ */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 40
        }} />
      )}

      {/* 中身 */}
      <div style={{
        position: 'fixed',
        left: open ? 0 : '-280px',
        top: 0,
        width: '280px',
        height: '100%',
        background: '#020617',
        transition: '0.3s',
        zIndex: 50,
        overflowY: 'auto'
      }}>
        <SidebarWrapper />
      </div>
    </>
  );
}