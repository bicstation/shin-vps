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
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        👑 迷ったらこれ一択(残りわずか・人気モデル)
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* 画像 */}
        <div style={{ textAlign: 'center' }}>
          <img 
            src={product.image_url}
            alt={product.name || 'おすすめPC'}
            style={{ width: '260px', borderRadius: '12px' }}
          />

          <p style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            ※公式ショップ取り扱い（安心して購入できます）
          </p>
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          
          {/* タイトル */}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: 1.4 }}>
            {product.name}
          </h2>

          {/* キャッチ（強化） */}
          <p style={{ color: '#22c55e', marginTop: '8px', fontWeight: 'bold' }}>
            初心者でも失敗しない・コスパ最強の1台
          </p>

          {/* スコア（意味付け） */}
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            🔥 AIスコア {product.score_ai}（独自検証） → 上位10%（今選ばれているモデル）
          </p>

          {/* 安心訴求 */}
          <ul style={{ marginTop: '12px', lineHeight: '1.8', fontSize: '14px' }}>
            <li>✔ 初心者が選んでも後悔しない性能</li>
            <li>✔ 動画編集・AI作業も余裕</li>
            <li>✔ 3年以上しっかり使える安定モデル</li>
            <li>✔ ※迷う必要がないレベルです</li>
          </ul>

          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '8px'
          }}>
            ✔ 今一番選ばれているモデル
          </p>

          {/* CTAエリア（最重要） */}
          <div style={{ marginTop: '10px' }}>

            {/* メインCTA */}
            <a 
              href={product.affiliate_url}
              target="_blank"
              style={{
                display: 'inline-block',
                background: '#22c55e',
                color: '#000',
                padding: '14px 22px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              👉 最安価格をチェック（在庫あり）
            </a>

            {/* サブCTA */}
            <div style={{ marginTop: '10px' }}>
              <Link 
                href={`/product/${product.id}`}
                style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  textDecoration: 'underline'
                }}
              >
                ※迷う人は詳細を確認する
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}