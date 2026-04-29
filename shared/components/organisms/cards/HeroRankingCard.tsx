'use client';

type Product = {
  id: number;
  title?: string;
  image?: string | null;
  price?: number;
  url?: string | null;
  label?: string;
  tags?: string[];
};

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  // 🔒 安全処理
  const title = product.title || 'おすすめ商品';
  const image = product.image || '/no-image.png';
  const price = product.price ?? 0;
  const url = product.url || '';
  const label = product.label || 'おすすめ';
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

  console.log(product);
  
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #020617, #0f172a)',
        padding: '36px',
        borderRadius: '24px',
        border: '2px solid #f97316',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* 👑 ラベル */}
      <div
        style={{
          position: 'absolute',
          top: '-14px',
          left: '24px',
          background: '#f97316',
          color: '#fff',
          padding: '6px 16px',
          borderRadius: '999px',
          fontWeight: 'bold',
          fontSize: '12px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '28px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* 🖼 画像 */}
        <div style={{ textAlign: 'center' }}>
          <img
            src={image}
            alt={title}
            onError={(e) => {
              e.currentTarget.src = '/no-image.png';
            }}
            style={{
              width: '280px',
              borderRadius: '14px',
            }}
          />

          <p
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#94a3b8',
            }}
          >
            ※公式ショップで安心購入
          </p>
        </div>

        {/* 🧠 コンテンツ */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          
          {/* タイトル */}
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              lineHeight: 1.5,
            }}
          >
            {title}
          </h2>

          {/* タグ */}
          {tags.length > 0 && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '14px',
                color: '#94a3b8',
              }}
            >
              {tags.join(' / ')}
            </div>
          )}

          {/* 🔥 信頼ブロック */}
          <div
            style={{
              marginTop: '14px',
              fontSize: '14px',
              lineHeight: 1.8,
            }}
          >
            ✔ 今一番選ばれているモデル<br />
            ✔ 初心者でも失敗しない構成<br />
            ✔ 長く使える安定スペック
          </div>

          {/* 💰 価格 */}
          <div
            style={{
              fontSize: '26px',
              fontWeight: 'bold',
              marginTop: '18px',
            }}
          >
            ¥{price.toLocaleString()}
          </div>

          {/* 🚀 CTA */}
          <div style={{ marginTop: '18px' }}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: '#f97316',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: 'bold',
                  fontSize: '17px',
                  textAlign: 'center',
                  boxShadow: '0 6px 16px rgba(249,115,22,0.4)',
                }}
              >
                👉 今すぐチェック（在庫残りわずか）
              </a>
            ) : (
              <div style={{ color: '#94a3b8' }}>
                現在リンク準備中
              </div>
            )}

            {/* ▼スクロール誘導（重要） */}
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              ▼ 他の人気モデルも見る
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
