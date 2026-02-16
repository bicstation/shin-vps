'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import styles from './SystemDiagnostic.module.css';

interface DiagnosticProps {
  id: string;
  source?: string;
  data: any;
  sidebarData: any;
  fetchError?: any;
  relatedError?: any;
}

export default function SystemDiagnostic({
  id,
  source = 'UNKNOWN',
  data,
  sidebarData,
  fetchError,
  relatedError
}: DiagnosticProps) {
  const [clientMetrics, setClientMetrics] = useState<any>({});

  useEffect(() => {
    setClientMetrics({
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      language: navigator.language,
      platform: (navigator as any).platform,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      renderMode: typeof window !== 'undefined' ? 'CLIENT_HYDRATED' : 'SSR'
    });
  }, []);

  return (
    <footer className={styles.debugFooter}>
      {/* 📡 ターミナルヘッダー */}
      <div className={styles.terminalHeader}>
        <div>
          <span style={{ marginRight: '20px' }}>📡 DATA_STREAM_MONITOR // NODE: {id}</span>
          <span className={fetchError || relatedError ? styles.statusError : styles.statusActive}>
            STATUS: {fetchError || relatedError ? 'CRITICAL_ERROR' : 'SYSTEM_HEALTHY'}
          </span>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.6 }}>
          SOURCE_NODE: {source}
        </div>
      </div>

      <div className={styles.gridContainer}>
        
        {/* [01] MAIN PRODUCT PAYLOAD */}
        <div className={styles.column}>
          <div className={styles.columnLabel}>
            <span>[01] MAIN_PRODUCT_PAYLOAD</span>
            <span style={{ color: fetchError ? '#ff4d4d' : '#00ffcc' }}>
              {fetchError ? 'ERROR' : 'VALID'}
            </span>
          </div>
          <pre className={styles.preArea}>
            {fetchError 
              ? `!! ERROR_DETECTED !!\n${JSON.stringify(fetchError, null, 2)}` 
              : JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {/* [02] SIDEBAR RELATED PAYLOAD */}
        <div className={styles.column}>
          <div className={styles.columnLabel}>
            <span>[02] SIDEBAR_RELATED_STREAM</span>
            <span>COUNT: {sidebarData?.length || 0}</span>
          </div>
          <pre className={styles.preArea}>
            {relatedError 
              ? `!! SIDEBAR_FETCH_FAILED !!\n${JSON.stringify(relatedError, null, 2)}` 
              : sidebarData 
                ? JSON.stringify(sidebarData, null, 2) 
                : '// NO_RELATED_DATA_RECEIVED'}
          </pre>
        </div>

        {/* [03] CLIENT & NETWORK ANALYTICS */}
        <div className={styles.column}>
          <div className={styles.columnLabel}>
            <span>[03] SYSTEM_METRICS</span>
            <span style={{ animation: 'blink 1s infinite' }}>● REC</span>
          </div>
          <div className={styles.metricsGrid}>
            <MetricItem label="ENVIRONMENT" value={process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'} />
            <MetricItem label="RENDER_MODE" value={clientMetrics.renderMode} />
            <MetricItem label="VIEWPORT" value={clientMetrics.screen} />
            <MetricItem label="LOCALE" value={clientMetrics.language} />
            <MetricItem label="BROWSER" value={clientMetrics.userAgent} />
            
            <div className={styles.radarWrapper}>
              <div className={styles.radarSweep} />
              <div style={{ position: 'absolute', bottom: '5px', left: '10px', fontSize: '8px', opacity: 0.5 }}>
                PACKET_LOSS: 0% / LATENCY: 12ms
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '9px', lineHeight: '1.6', color: '#e94560' }}>
              {`> _DIAGNOSIS_LOG`} <br />
              {fetchError ? `- API_MAIN: CONNECTION_REFUSED\n` : `- API_MAIN: 200_OK\n`}
              {sidebarData ? `- API_SIDEBAR: SYNC_COMPLETE\n` : `- API_SIDEBAR: IDLE\n`}
            </div>
          </div>
        </div>

      </div>

      <div className={styles.footerNote}>
        TERMINAL_INTERFACE_V3.5_SECURED_CONNECTION
      </div>
    </footer>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metricItem}>
      <span className={styles.mLabel}>{label}:</span>
      <span className={styles.mValue}>{value}</span>
    </div>
  );
}