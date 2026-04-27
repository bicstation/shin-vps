/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';

// ✅ siteConfig ライブラリ
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 各専門サイドバー
import PCSidebar from './PCSidebar';
import GeneralSidebar from './GeneralSidebar';
import Sidebar from './AdultSidebar';
import AdultSidebarAvFlash from './AdultSidebarAvFlash';

export default function SidebarWrapper() {
  const [siteTag, setSiteTag] = useState('bicstation');
  const [siteName, setSiteName] = useState('');
  const [isBicSaving, setIsBicSaving] = useState(false);

  useEffect(() => {
    const host = window.location.host;
    const metadata = getSiteMetadata(host);

    setSiteTag(metadata?.site_tag || 'bicstation');
    setSiteName(metadata?.site_name || '');
    setIsBicSaving(metadata?.site_tag === 'saving');
  }, []);

  const sidebarProps = {
    siteName,
    isBicSaving,
    host: typeof window !== 'undefined' ? window.location.host : ''
  };

  switch (siteTag) {
    case 'bicstation':
      return <PCSidebar {...sidebarProps} />;

    case 'saving':
      return <GeneralSidebar {...sidebarProps} />;

    case 'avflash':
      return <AdultSidebarAvFlash {...sidebarProps} />;

    case 'tiper':
      return <Sidebar {...sidebarProps} />;

    default:
      console.warn("⚠️ Unknown site_tag:", siteTag);
      return <GeneralSidebar {...sidebarProps} />;
  }
}