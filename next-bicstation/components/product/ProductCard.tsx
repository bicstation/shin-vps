/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
// リンク先を環境変数 + パス で構成する
const basePath = process.env.NEXT_PUBLIC_BASE_BICSTATION || '/bicstation';
console.log("Current BasePath:", basePath); // ビルドログ、またはブラウザのコンソールで確認

export default function ProductCard({ product }: any) {
  const cleanUrl = (url: string) => url ? url.split('#')[0].split('?')[0] : '#';

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ height: '180px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={product.image_url} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.7em', color: '#777', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>{product.maker}</span>
        <span style={{ fontSize: '0.7em', color: '#28a745', fontWeight: 'bold' }}>{product.stock_status}</span>
      </div>
      <h3 style={{ fontSize: '0.95em', margin: '0 0 15px 0', height: '2.8em', overflow: 'hidden', lineHeight: '1.4', color: '#222' }}>{product.name}</h3>
      <p style={{ color: '#d9534f', fontSize: '1.3em', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        {product.price > 0 ? `¥${product.price.toLocaleString()}` : "価格不明"}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
        <Link href={`product/${product.unique_id}`} style={{ textAlign: 'center', padding: '10px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '0.8em', fontWeight: 'bold' }}>
          詳細スペック
        </Link>
        <a href={cleanUrl(product.url)} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', padding: '10px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '0.8em' }}>
          公式サイト
        </a>
      </div>
    </div>
  );
}