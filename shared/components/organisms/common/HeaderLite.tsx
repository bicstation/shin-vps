'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import MobileSidebarWrapper from '@/shared/layout/Sidebar/MobileSidebarWrapper';

export default function HeaderLite() {
  const [site, setSite] = useState<any>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const meta = getSiteMetadata(host);
    setSite(meta);
  }, []);

  if (!site) {
    return (
      <header style={{ height: '60px', background: '#000' }} />
    );
  }

  const themeColor = site.theme_color || '#333';
  const siteName = site.site_name || 'SITE';

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      borderBottom: `2px solid ${themeColor}`,
      background: '#020617'
    }}>
      
      {/* ☰ */}
      <MobileSidebarWrapper />

      {/* ロゴ */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: themeColor,
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}>
            {siteName.charAt(0)}
          </span>

          <span style={{ color: '#fff', fontSize: '14px' }}>
            {siteName}
          </span>
        </div>
      </Link>

      {/* 右側（超軽量） */}
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
        {/* 必要ならログインだけ */}
      </div>

    </header>
  );
}