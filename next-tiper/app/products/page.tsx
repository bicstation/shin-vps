// E:\shin-vps\next-tiper\app\products\page.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdultProducts } from '../../lib/api'; // libへのパスを調整
import ProductCard from '../components/ProductCard'; // app/components/ProductCard を参照

export default async function ProductsPage() {
  // 💡 API呼び出しに失敗しても画面が真っ白にならないようデフォルト値を設定
  const data = await getAdultProducts({ limit: 20 }).catch(() => ({ results: [], next: null }));
  const products = data?.results || [];

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#111122', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          marginBottom: '24px', 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          borderLeft: '4px solid #ec4899', 
          paddingLeft: '16px' 
        }}>
          新着作品一覧
        </h1>
        
        {/* 商品グリッド */}
        {products.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #3d3d66' }}>
            <p>作品データを取得できませんでした。Django APIの稼働状況を確認してください。</p>
          </div>
        )}
        
        {/* ページネーション */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          {data.next && (
            <button style={{ 
              backgroundColor: '#ec4899', 
              color: 'white', 
              padding: '8px 24px', 
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              もっと見る
            </button>
          )}
        </div>
      </div>
    </div>
  );
}