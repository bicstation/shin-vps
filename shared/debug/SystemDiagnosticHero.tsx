'use client';

import React, { useState, useEffect } from 'react';
import styles from './SystemDiagnosticHero.module.css';

export default function SystemDiagnosticHero({
  id, source, data, sidebarData, fetchError, relatedError, params
}: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className={styles.wrapper}>
      {/* 🟢 HEADER: SYSTEM STATUS */}
      <div className={styles.topBar}>
        <div className={styles.statusGroup}>
          <span style={{ color: '#7efaff' }} className={styles.glowText}>🛰️ CORE_ONLINE</span>
          <span style={{ color: source ? '#e94560' : '#555' }}>PLATFORM: {source || '---'}</span>
          <span style={{ color: id ? '#f39c12' : '#555' }}>NODE: {id || 'NULL'}</span>
        </div>
        <div style={{ color: '#58a6ff', fontSize: '11px' }}>{new Date().toLocaleTimeString()} // READY</div>
      </div>

      <div className={styles.grid}>
        
        {/* 🟦 [01] MAIN PAYLOAD */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span style={{ color: '#e94560' }}>[01] MAIN_PRODUCT_DATA</span>
            <span className={styles.badge} style={{ background: data ? '#e9456033' : '#333', color: '#e94560' }}>
              {data ? 'LOADED' : 'EMPTY'}
            </span>
          </div>
          <div className={styles.container}>
            {fetchError ? (
              <div style={{ color: '#ff7b72' }}>⚠️ {fetchError}</div>
            ) : (
              <>
                <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                   {data?.title || 'No Title Detected'}
                </div>
                <pre className={styles.scrollBox}>{JSON.stringify(data, null, 2)}</pre>
              </>
            )}
          </div>
        </section>

        {/* 🟩 [02] SIDEBAR STREAM */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span style={{ color: '#00d1b2' }}>[02] RELATED_SIDEBAR_STREAM</span>
            <span className={styles.badge} style={{ background: '#00d1b233', color: '#00d1b2' }}>
              {Array.isArray(sidebarData) ? sidebarData.length : 0} ITEMS
            </span>
          </div>
          <div className={styles.container}>
            {relatedError ? (
              <div style={{ color: '#ff7b72' }}>⚠️ {relatedError}</div>
            ) : (
              <pre className={styles.scrollBox}>
                {sidebarData ? JSON.stringify(sidebarData, null, 2) : '// NO_DATA_STREAM'}
              </pre>
            )}
          </div>
        </section>

        {/* 🟨 [03] ROUTE CONTEXT */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span style={{ color: '#f39c12' }}>[03] NAVIGATION_CONTEXT</span>
            <span style={{ color: '#8b949e' }}>LOC: {typeof window !== 'undefined' ? window.location.hostname : '---'}</span>
          </div>
          <div className={styles.container}>
            <pre className={styles.scrollBox}>
              {JSON.stringify({
                pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
                params: params,
                viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'
              }, null, 2)}
            </pre>
          </div>
        </section>

      </div>
      
      <div className={styles.footerBar}>
        <span>STATUS: ACTIVE</span>
        <span>TI-PER_DIAGNOSTIC_PROTOCOL_V4.5_STABLE</span>
      </div>
    </div>
  );
}