'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './HeaderLite.module.css';

/**
 * =========================================================
 * ✅ Safe Dynamic Sidebar Import
 * =========================================================
 */
const MobileSidebarWrapper = dynamic(
  () => import('@/shared/layout/Sidebar/MobileSidebarWrapper'),
  {
    ssr: false,

    loading: () => (
      <div
        style={{
          width: '36px',
          height: '36px',
        }}
      />
    ),
  }
);

export default function HeaderLite() {

  const [site, setSite] = useState<any>(null);

  useEffect(() => {

    if (typeof window === 'undefined') {
      return;
    }

    try {

      const host =
        window.location.hostname;

      const meta =
        getSiteMetadata(host);

      setSite(
        meta || {
          site_name: 'SITE',
          theme_color: '#333',
        }
      );

    } catch (error) {

      console.error(
        '❌ HeaderLite SiteMetadata Error:',
        error
      );

      setSite({
        site_name: 'SITE',
        theme_color: '#333',
      });
    }

  }, []);

  /**
   * =======================================================
   * ✅ Initial Skeleton
   * =======================================================
   */
  if (!site) {
    return (
      <header className={styles.skeleton} />
    );
  }

  const themeColor =
    site.theme_color || '#333';

  const siteName =
    site.site_name || 'SITE';

  return (

    <header
      className={styles.header}
      style={{
        borderBottom: `2px solid ${themeColor}`,
      }}
    >

      {/* ===================================================
          ☰ Mobile Sidebar
      ==================================================== */}
      <div className={styles.sidebarArea}>
        <MobileSidebarWrapper />
      </div>

      {/* ===================================================
          🛰️ Logo
      ==================================================== */}
      <Link
        href="/"
        className={styles.logoLink}
      >
        <div className={styles.logoWrapper}>

          <span
            className={styles.logoBadge}
            style={{
              background: themeColor,
            }}
          >
            {siteName.charAt(0)}
          </span>

          <span className={styles.logoText}>
            {siteName}
          </span>

        </div>
      </Link>

      {/* ===================================================
          🖥 Desktop Navigation
      ==================================================== */}
      <nav className={styles.desktopNav}>

        <Link
          href="/discover"
          className={styles.navLink}
        >
          Discover
        </Link>

        <Link
          href="/ranking"
          className={styles.navLink}
        >
          ランキング
        </Link>

        <Link
          href="/guide"
          className={styles.navLink}
        >
          ガイド
        </Link>

        <Link
          href="/contact"
          className={styles.navLink}
        >
          お問い合わせ
        </Link>

      </nav>

      {/* ===================================================
          🔍 Right Area
      ==================================================== */}
      <div className={styles.rightArea}>

        <Link
          href="/discover"
          className={styles.discoverButton}
        >
          Semantic Discover
        </Link>

      </div>

    </header>
  );
}