/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

// リンク先を環境変数 + パス で構成する
const basePath = process.env.NEXT_PUBLIC_BASE_BICSTATION || '/bicstation';

export default function ProductCard({ product }: any) {
  // 通常のURL用（ハッシュやパラメータを削除）
  const cleanUrl = (url: string) => url ? url.split('#')[0].split('?')[0] : '#';

  // 💡 アフィリエイトリンクを優先し、なければ通常のURLを使用
  // アフィリエイトリンクはパラメータが重要なので cleanUrl は通さない
  const buyLink = product.affiliate_url || product.url || '#';

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '14px', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      height: '100%' // カードの高さを揃える
    }}>
      {/* 商品画像エリア */}
      <div style={{ height: '180px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src={product.image_url || '/no-image.png'} 
          alt={product.name} 
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
        />
      </div>

      {/* メーカー・在庫ステータス */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7em', color: '#777', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>
          {product.maker}
        </span>
        <span style={{ fontSize: '0.7em', color: '#28a745', fontWeight: 'bold' }}>
          {product.stock_status}
        </span>
      </div>

      {/* 商品名 */}
      <h3 style={{ 
        fontSize: '0.95em', 
        margin: '0 0 15px 0', 
        height: '2.8em', 
        overflow: 'hidden', 
        lineHeight: '1.4', 
        color: '#222',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2
      }}>
        {product.name}
      </h3>

      {/* 価格表示 */}
      <p style={{ color: '#d9534f', fontSize: '1.3em', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        {product.price > 0 ? `¥${product.price.toLocaleString()}` : "価格不明"}
      </p>

      {/* アクションボタン */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
        {/* 詳細ページ（内部リンク） */}
        <Link 
          href={`/product/${product.unique_id}`} 
          style={{ 
            textAlign: 'center', 
            padding: '10px', 
            background: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px', 
            fontSize: '0.8em', 
            fontWeight: 'bold' 
          }}
        >
          詳細スペック
        </Link>

        {/* 💡 購入・公式サイト（アフィリエイトリンク） */}
        <a 
          href={buyLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            textAlign: 'center', 
            padding: '10px', 
            background: '#e41313', // アフィリエイトと分かりやすいよう赤系（または元の#333）
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px', 
            fontSize: '0.8em',
            fontWeight: 'bold'
          }}
        >
          公式サイト
        </a>
      </div>
    </div>
  );
}