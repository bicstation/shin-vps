'use client';

import Link from 'next/link';

export default function HeroRankingCard({ product }: any) {
  if (!product) return null;

  return (
    <section style={{
      background: 'linear-gradient(135deg, #0f172a, #020617)',
      padding: '32px',
      borderRadius: '20px',
      border: '2px solid #22c55e',
      position: 'relative'
    }}>
      
      {/* 👑 バッジ */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '20px',
        background: '#22c55e',
        color: '#000',
        padding: '6px 14px',
        borderRadius: '999px',
        fontWeight: 'bold'
      }}>
        👑 迷ったらこれ一択
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        
        {/* 画像 */}
        <img 
          src={product.image_url}
          style={{ width: '260px', borderRadius: '12px' }}
        />

        <div style={{ flex: 1 }}>
          
          {/* タイトル */}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {product.name}
          </h2>

          {/* キャッチ */}
          <p style={{ color: '#22c55e', marginTop: '8px' }}>
            初心者OK・コスパ最強・失敗しない
          </p>

          {/* スコア */}
          <p style={{ marginTop: '8px' }}>
            AI SCORE: {product.score_ai}（上位モデル）
          </p>

          {/* 短い理由 */}
          <ul style={{ marginTop: '12px', lineHeight: '1.8' }}>
            <li>✔ 高性能CPUでサクサク</li>
            <li>✔ 動画編集・AI作業OK</li>
            <li>✔ 長く使える安定モデル</li>
          </ul>

          {/* CTA（最重要） */}
          <a 
            href={product.affiliate_url}
            target="_blank"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              background: '#22c55e',
              color: '#000',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}
          >
            👉 今すぐチェック（失敗しない）
          </a>

        </div>
      </div>
    </section>
  );
}