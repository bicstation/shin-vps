/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// ✅ siteConfig ライブラリ
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

/**
 * =====================================================================
 * ✅ Safe Dynamic Sidebar Imports
 * SSR完全遮断
 * =====================================================================
 */

const PCSidebar = dynamic(
  () => import('./PCSidebar'),
  {
    ssr: false,

    loading: () => null,
  }
);

const GeneralSidebar = dynamic(
  () => import('./GeneralSidebar'),
  {
    ssr: false,

    loading: () => null,
  }
);

const AdultSidebar = dynamic(
  () => import('./AdultSidebar'),
  {
    ssr: false,

    loading: () => null,
  }
);

const AdultSidebarAvFlash = dynamic(
  () => import('./AdultSidebarAvFlash'),
  {
    ssr: false,

    loading: () => null,
  }
);

export default function SidebarWrapper() {

  const [siteTag, setSiteTag] =
    useState('bicstation');

  const [siteName, setSiteName] =
    useState('');

  const [isBicSaving, setIsBicSaving] =
    useState(false);

  /**
   * ===================================================================
   * ✅ Runtime Safe Detection
   * ===================================================================
   */
  useEffect(() => {

    if (typeof window === 'undefined') {
      return;
    }

    try {

      const host =
        window.location.host;

      const metadata =
        getSiteMetadata(host);

      setSiteTag(
        metadata?.site_tag || 'bicstation'
      );

      setSiteName(
        metadata?.site_name || ''
      );

      setIsBicSaving(
        metadata?.site_tag === 'saving'
      );

    } catch (error) {

      console.error(
        '❌ SidebarWrapper Runtime Error:',
        error
      );

      setSiteTag('bicstation');
    }

  }, []);

  /**
   * ===================================================================
   * ✅ Shared Props
   * ===================================================================
   */
  const sidebarProps = {

    siteName,

    isBicSaving,

    host:
      typeof window !== 'undefined'
        ? window.location.host
        : '',
  };

  /**
   * ===================================================================
   * ✅ Site Router
   * ===================================================================
   */
  switch (siteTag) {

    case 'bicstation':

      return (
        <PCSidebar {...sidebarProps} />
      );

    case 'saving':

      return (
        <GeneralSidebar {...sidebarProps} />
      );

    case 'avflash':

      return (
        <AdultSidebarAvFlash {...sidebarProps} />
      );

    case 'tiper':

      return (
        <AdultSidebar {...sidebarProps} />
      );

    default:

      console.warn(
        '⚠️ Unknown site_tag:',
        siteTag
      );

      return (
        <GeneralSidebar {...sidebarProps} />
      );
  }
}