import React from 'react';
import Link from 'next/link';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';
import styles from './Dashboard.module.css'; // 必要に応じて作成してください

export default async function VideoGlobalPortalPage() {
  // 本来はここで各統計APIを叩きます
  const stats = {
    total_products: "1,240,582",
    active_makers: "45,802",
    categories: "128",
    sync_rate: "99.8%"
  };

  const debugData = {
    mode: 'AGGREGATED_DASHBOARD',
    node_id: 'GLOBAL_VIDEO_CORE',
    auth_status: 'AUTHORIZED',
    timestamp: new Date().toISOString()
  };

  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#0a0a0c', minHeight: '100vh' }}>
      
      {/* 🚀 ページトップにシステムの「健康状態」をスキャン */}
      <SystemDiagnosticHero 
        title="CENTRAL_DATA_DISTRIBUTION_CENTER"
        data={debugData}
      />

      <div style={{ marginTop: '3rem' }}>
        {/* --- 📟 SECTION 1: SYSTEM METRICS --- */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem', 
          marginBottom: '3rem' 
        }}>
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} style={{ 
              border: '1px solid #1a1a1e', 
              background: 'rgba(255,255,255,0.02)', 
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>{key}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00ffcc', fontFamily: 'monospace' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* --- 📡 SECTION 2: PLATFORM CONNECTORS --- */}
        <h2 style={{ fontSize: '0.8rem', color: '#e94560', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>
          SELECT_DATA_SOURCE_NODE
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem', 
          marginBottom: '4rem' 
        }}>
          {['FANZA', 'DMM', 'DUGA'].map((p) => (
            <Link key={p} href={`/brand/${p.toLowerCase()}`} style={{
              height: '180px',
              border: '1px solid #333',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0f0f12 0%, #1a1a1e 100%)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.5rem', color: '#444' }}>NODE_ID: {p}_01</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '0.1em' }}>{p}</div>
              <div style={{ fontSize: '0.6rem', color: '#00ffcc', marginTop: '10px' }}>● ONLINE_ACCESS_READY</div>
            </Link>
          ))}
        </div>

        {/* --- 📁 SECTION 3: MASTER_REGISTRY_ENTRIES --- */}
        <h2 style={{ fontSize: '0.8rem', color: '#e94560', marginBottom: '1.5rem', letterSpacing: '0.3em' }}>
          GLOBAL_MASTER_REGISTRY
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '1rem' 
        }}>
          {[
            { label: 'GENRES', icon: '🏷️', path: 'genre' },
            { label: 'MAKERS', icon: '🏢', path: 'maker' },
            { label: 'ACTRESSES', icon: '💃', path: 'actress' },
            { label: 'SERIES', icon: '🎞️', path: 'series' },
            { label: 'DIRECTORS', icon: '🎬', path: 'director' },
            { label: 'AUTHORS', icon: '✍️', path: 'author' },
          ].map((cat) => (
            <Link key={cat.label} href={`/brand/video/cat/${cat.path}`} style={{
              padding: '1.5rem',
              background: '#16161a',
              border: '1px solid #222',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#eee' }}>{cat.label}</div>
              <div style={{ fontSize: '0.5rem', color: '#444', marginTop: '0.5rem' }}>BROWSE_REGISTRY</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ダッシュボード感のあるデコレーション（最下部） */}
      <div style={{ marginTop: '5rem', borderTop: '1px dashed #222', paddingTop: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: '#333', letterSpacing: '0.5em' }}>
          TERMINAL_ENCRYPTED_CONNECTION_SECURED
        </span>
      </div>
    </main>
  );
}