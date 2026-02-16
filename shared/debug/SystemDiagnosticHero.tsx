'use client';

import React, { useState, useEffect } from 'react';
import styles from './SystemDiagnosticHero.module.css';

interface DiagnosticProps {
  id: string;
  source?: string;
  data?: any;          // 昨日作成：メインデータ
  rawJson?: any;       // スクリプト側：生JSON
  sidebarData?: any;   // 昨日作成：サイドバーデータ
  fetchError?: string;
  relatedError?: string;
  params?: any;        // 昨日作成：ルートパラメータ
  componentPath?: string; 
}

export default function SystemDiagnosticHero({
  id, 
  source = 'UNKNOWN', 
  data, 
  rawJson, 
  sidebarData, 
  fetchError, 
  relatedError, 
  params,
  componentPath = '/app/adults/[id]/page.tsx'
}: DiagnosticProps) {
  const [mounted, setMounted] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    ua: 'LOADING...',
    lang: '---',
    res: '0x0',
    activePath: '---'
  });

  useEffect(() => {
    setMounted(true);
    setClientInfo({
      ua: navigator.userAgent.split(') ')[1] || navigator.userAgent,
      lang: navigator.language.toUpperCase(),
      res: `${window.innerWidth}x${window.innerHeight}`,
      activePath: window.location.pathname
    });
  }, []);

  if (!mounted) return null;

  // 表示するメインデータの選択（data があれば優先、なければ rawJson）
  const mainPayload = data || rawJson;

  return (
    <div className={styles.debugContainer}>
      <div className={styles.scanline} />
      <div className={styles.gridOverlay} />

      <div className={styles.content}>
        {/* 🟢 HEADER: SYSTEM STATUS & ROUTE */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.blink}>[ SYSTEM_DIAGNOSTIC_STABLE ]</span>
            <span className={styles.nodeId}>NODE: {id || 'NULL'}</span>
            <span className={styles.pathBadge}>FILE: {componentPath}</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.timestamp}>PLATFORM: {source}</span>
            <span className={styles.timestamp}>ROUTE: {clientInfo.activePath}</span>
          </div>
        </div>

        <div className={styles.threeColumnGrid}>
          
          {/* 🟦 COLUMN 1: MAIN PAYLOAD (昨日作成のメインデータ検証) */}
          <div className={styles.column}>
            <div className={styles.columnLabel}>// [01] MAIN_DATA_STREAM</div>
            <div className={styles.jsonTerminal}>
              <div className={styles.terminalHeader}>
                {mainPayload?.title ? mainPayload.title.substring(0, 30) + '...' : 'RAW_INPUT'}
                <span className={styles.statusBadge} style={{ color: mainPayload ? '#7efaff' : '#ff7b72' }}>
                  {mainPayload ? 'LOADED' : 'EMPTY'}
                </span>
              </div>
              {fetchError ? (
                <div className={styles.errorText}>⚠️ {fetchError}</div>
              ) : (
                <pre className={styles.jsonContent}>
                  {JSON.stringify(mainPayload, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* 🟩 COLUMN 2: SIDEBAR & NAVIGATION (昨日作成のサイドバー検証 + ルート解析) */}
          <div className={styles.column}>
            <div className={styles.columnLabel}>// [02] SIDEBAR_&_CONTEXT</div>
            <div className={styles.metricsBox}>
              <div className={styles.terminalHeader} style={{ color: '#00d1b2' }}>
                RELATED_STREAM 
                <span className={styles.statusBadge}>
                  {Array.isArray(sidebarData) ? sidebarData.length : 0} ITEMS
                </span>
              </div>
              <div className={styles.jsonTerminal} style={{ height: '180px', marginBottom: '15px' }}>
                {relatedError ? (
                  <div className={styles.errorText}>⚠️ {relatedError}</div>
                ) : (
                  <pre className={styles.jsonContent} style={{ fontSize: '10px' }}>
                    {sidebarData ? JSON.stringify(sidebarData, null, 2) : '// NO_SIDEBAR_DATA'}
                  </pre>
                )}
              </div>

              <div className={styles.visualDivider} />
              
              <div className={styles.pathVisualizer}>
                <div className={styles.pathLabel}>NAVIGATION_PARAMS:</div>
                <pre className={styles.jsonContent} style={{ height: '80px', background: 'transparent' }}>
                  {JSON.stringify(params || { status: 'NO_PARAMS' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* 🟨 COLUMN 3: CLIENT & SYSTEM STATUS (スクリプト側の解析機能) */}
          <div className={styles.column}>
            <div className={styles.columnLabel}>// [03] SYSTEM_ANALYSIS</div>
            <div className={styles.statusBox}>
              <div className={styles.metricLine}>
                <span className={styles.mLabel}>BROWSER:</span>
                <span className={styles.mValue}>{clientInfo.ua}</span>
              </div>
              <div className={styles.metricLine}>
                <span className={styles.mLabel}>LOCALE:</span>
                <span className={styles.mValue}>{clientInfo.lang}</span>
              </div>
              <div className={styles.metricLine}>
                <span className={styles.mLabel}>RES:</span>
                <span className={styles.mValue}>{clientInfo.res}</span>
              </div>
              
              <div className={styles.visualDivider} />

              <div className={styles.terminalLine}>
                <span className={styles.label}>CORE_STATUS:</span>
                <span className={styles.value} style={{ color: '#7efaff' }}>OPERATIONAL</span>
              </div>
              <div className={styles.terminalLine}>
                <span className={styles.label}>SYNC_STATE:</span>
                <span className={styles.value}>STABLE</span>
              </div>

              <div className={styles.radarArea}>
                <div className={styles.radarLine} />
                <span className={styles.radarText}>SCANNING_NODES...</span>
              </div>
            </div>
          </div>

        </div>

        {/* 🏁 FOOTER BAR */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>STATUS: ACTIVE</span>
            <span className={styles.separator}>|</span>
            <span>DIAGNOSTIC_PROTOCOL_V4.8_HYBRID</span>
          </div>
          <div className={styles.footerRight}>
            {new Date().toLocaleTimeString()} // SYSTEM_READY
          </div>
        </div>
      </div>
    </div>
  );
}