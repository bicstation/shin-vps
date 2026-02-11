import React from 'react';

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { source?: string };
}) {
  const { id } = params;
  const source = searchParams.source;

  // 1. 環境変数の取得
  const apiInternalUrl = process.env.API_INTERNAL_URL || "http://django-v2:8000/api";
  
  // 💡 重要修正: 'products' ではなく 'adult-products' に変更
  // また、DjangoのURL末尾にはスラッシュが必要です
  const targetUrl = `${apiInternalUrl}/adult-products/${id}/?api_source=${source}`;

  let data = null;
  let errorMsg = null;

  // 2. サーバーサイドでのフェッチ実行
  try {
    const res = await fetch(targetUrl, { 
      cache: 'no-store',
      // Traefikを通さないコンテナ間直接通信の場合、Hostヘッダーは不要ですが
      // 念のため Django が驚かないよう設定しておくと安全です
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      errorMsg = `APIエラー: ステータス ${res.status} (URL: ${targetUrl})`;
    } else {
      data = await res.json();
    }
  } catch (e: any) {
    errorMsg = `通信失敗: ${e.message} (ターゲット: ${targetUrl})`;
  }

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', color: '#00ff41', fontFamily: 'monospace', lineHeight: '1.6' }}>
      <h1 style={{ borderBottom: '2px solid #00ff41', paddingBottom: '10px' }}>🛸 SYSTEM DIAGNOSTIC (Ver. 2.0)</h1>
      
      <section style={{ marginBottom: '30px', border: '1px solid #333', padding: '15px' }}>
        <h3 style={{ marginTop: 0 }}>[1] Route Parameters</h3>
        <ul>
          <li>Node ID: <strong style={{ color: '#fff' }}>{id}</strong></li>
          <li>Source API: <strong style={{ color: '#fff' }}>{source || 'None'}</strong></li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px', color: errorMsg ? '#ff4d4d' : '#00ff41' }}>
        <h3>[2] Connection Test</h3>
        <p>Target Endpoint: <code>{targetUrl}</code></p>
        {errorMsg ? (
          <div style={{ padding: '20px', border: '1px dotted #ff4d4d', background: '#2a1010' }}>
            ❌ <strong>ERROR:</strong> {errorMsg}
            <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
              ※ DjangoのURL設定とNext.jsのリクエストURLがまだズレている可能性があります。
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px', border: '1px solid #00ff41', background: '#0a2a0a' }}>
            ✅ <strong>CONNECTION ESTABLISHED!</strong><br />
            Djangoからのデータ受信に成功しました。
          </div>
        )}
      </section>

      {data && (
        <section style={{ border: '1px solid #00ff41', padding: '15px' }}>
          <h3>[3] Response Data Payload (Success)</h3>
          <p style={{ color: '#aaa' }}>作品タイトル: <span style={{ color: '#fff' }}>{data.title}</span></p>
          <pre style={{ background: '#111', padding: '15px', overflowX: 'auto', borderLeft: '4px solid #00ff41', fontSize: '13px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      )}

      <footer style={{ marginTop: '50px', fontSize: '0.8rem', opacity: 0.5, borderTop: '1px solid #333', paddingTop: '10px' }}>
        INTERNAL_API_URL: {apiInternalUrl} | NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}
      </footer>
    </div>
  );
}