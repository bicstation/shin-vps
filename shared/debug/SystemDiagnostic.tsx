/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

/**
 * 🛰️ SYSTEM DIAGNOSTIC FOOTER (Ver. 2.2)
 * 全ドメイン共通・最下部埋め込み型デバッグターミナル
 */
export default function SystemDiagnostic({
  id,
  source,
  targetUrl,
  data,
  errorMsg,
  apiInternalUrl
}: any) {
  return (
    <footer style={{ 
      marginTop: '100px', // コンテンツとの余白
      background: '#050505',
      color: '#00ff41',
      fontFamily: '"Fira Code", "Courier New", monospace',
      fontSize: '13px',
      borderTop: '5px solid #333',
      paddingBottom: '50px'
    }}>
      {/* ターミナルヘッダー */}
      <div style={{ 
        background: '#1a1a1a', 
        padding: '10px 20px', 
        display: 'flex', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #00ff41'
      }}>
        <span>SYSTEM_DIAGNOSTIC_REPORT // {source?.toUpperCase() || 'GENERAL'}</span>
        <span style={{ color: errorMsg ? '#ff4d4d' : '#00ff41' }}>
          ● {errorMsg ? 'CONNECTION_FAILED' : 'NODE_ATTACHED'}
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* 基本情報グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #222', padding: '15px', background: '#0a0a0a' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>[ PARAMETERS ]</h4>
            <div>IDENTIFIER: <span style={{ color: '#fff' }}>{id || 'NULL'}</span></div>
            <div>API_SOURCE: <span style={{ color: '#fff' }}>{source || 'AUTO'}</span></div>
            <div>INTERNAL_URL: <span style={{ opacity: 0.6 }}>{apiInternalUrl}</span></div>
          </div>

          <div style={{ border: '1px solid #222', padding: '15px', background: '#0a0a0a' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>[ ENDPOINT_TEST ]</h4>
            <div style={{ wordBreak: 'break-all', fontSize: '11px', color: '#888' }}>{targetUrl}</div>
            <div style={{ marginTop: '10px' }}>
              {errorMsg ? (
                <span style={{ background: '#300', color: '#f00', padding: '2px 5px' }}>ERROR: {errorMsg}</span>
              ) : (
                <span style={{ background: '#030', color: '#0f0', padding: '2px 5px' }}>FETCH_SUCCESSFUL</span>
              )}
            </div>
          </div>
        </div>

        {/* ペイロード表示 */}
        {data && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>[ RAW_DATA_STREAM ]</h4>
            <pre style={{ 
              background: '#000', 
              padding: '15px', 
              border: '1px solid #1a1a1a', 
              overflowX: 'auto',
              maxHeight: '300px',
              fontSize: '12px'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '10px', padding: '10px' }}>
        TIPER_CORE_ARCHIVE_DEBUGGER_SYSTEM // (C) 2026
      </div>
    </footer>
  );
}