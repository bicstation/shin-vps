/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

/**
 * 🛰️ SYSTEM DIAGNOSTIC FOOTER (Ver. 3.5)
 * [MAIN_NODE + RELATED_SIDEBAR_STREAM] 統合デバッグ
 */
export default function SystemDiagnostic({
  id,
  source,
  data,          // メイン商品のRAWデータ
  sidebarData,   // ⬅️ サイドバー（関連商品）のRAWデータ
  fetchError,
  relatedError   // ⬅️ 関連商品取得時のエラー
}: any) {
  return (
    <footer style={{ 
      marginTop: '100px',
      background: '#050505',
      color: '#00ff41',
      fontFamily: '"Fira Code", monospace',
      fontSize: '12px',
      borderTop: '4px solid #e94560', // TIPERカラーでアクセント
      padding: '0 0 50px 0'
    }}>
      {/* ターミナルヘッダー */}
      <div style={{ background: '#111', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
        <span>📡 DATA_STREAM_MONITOR // NODE: {id}</span>
        <span style={{ color: sidebarData ? '#00ff41' : '#ff4d4d' }}>
          SIDEBAR_STATUS: {sidebarData ? 'CONNECTED' : 'STANDBY/ERROR'}
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* 左側：メイン商品のAPI結果 */}
          <section>
            <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase' }}>
              [01] Main_Product_Payload
            </h4>
            <div style={containerStyle}>
              {fetchError ? (
                <div style={{ color: '#ff4d4d' }}>ERROR: {fetchError}</div>
              ) : (
                <pre style={preStyle}>{JSON.stringify(data, null, 2)}</pre>
              )}
            </div>
          </section>

          {/* 右側：関連商品のAPI結果（ここが別枠） */}
          <section>
            <h4 style={{ color: '#00d1b2', marginBottom: '10px', fontSize: '11px', textTransform: 'uppercase' }}>
              [02] Sidebar_Related_API_Result
            </h4>
            <div style={{ ...containerStyle, borderColor: '#00d1b244' }}>
              <div style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #222', fontSize: '10px', color: '#00d1b2' }}>
                FOUND: {sidebarData?.length || 0} ITEMS // KEY: related_to_id
              </div>
              {relatedError ? (
                <div style={{ color: '#ff4d4d' }}>ERROR: {relatedError}</div>
              ) : (
                <pre style={preStyle}>
                  {sidebarData ? JSON.stringify(sidebarData, null, 2) : '// No data received from endpoint'}
                </pre>
              )}
            </div>
          </section>

        </div>
      </div>
      
      <div style={{ textAlign: 'center', opacity: 0.2, fontSize: '9px' }}>
        CRITICAL_INFRASTRUCTURE_MONITOR_SYSTEM_V3.5
      </div>
    </footer>
  );
}

const containerStyle: React.CSSProperties = {
  background: '#000',
  border: '1px solid #222',
  padding: '10px',
  borderRadius: '2px'
};

const preStyle: React.CSSProperties = {
  maxHeight: '450px',
  overflowY: 'auto',
  lineHeight: '1.4',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all'
};