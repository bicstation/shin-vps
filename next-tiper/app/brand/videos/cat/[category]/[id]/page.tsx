import { notFound } from 'next/navigation';
import Link from 'next/link';

// 対応するカテゴリ一覧
const VALID_CATEGORIES = ['actress', 'genre', 'series', 'maker', 'director', 'author'];

export default async function CategoryListPage({ 
  params 
}: { 
  params: { category: string, brand?: string } 
}) {
  const { category, brand } = params;

  // 無効なカテゴリ名の場合は404
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // APIエンドポイントの決定 (sを付けて複数形にする簡易的な例)
  const apiEndpoint = `${category}es`.replace('ssess', 'sses'); // actress -> actresses
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://tiper-host:8083/api';
  
  // ブランド指定がある場合はクエリに追加
  const sourceQuery = brand ? `?api_source=${brand}` : '';

  const res = await fetch(`${apiBase}/${apiEndpoint}/${sourceQuery}`, { cache: 'no-store' });
  
  if (!res.ok) return <div>データの取得に失敗しました</div>;
  
  const data = await res.json();
  const items = data.results || [];

  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#0a0a0c' }}>
      <h1 style={{ textTransform: 'uppercase', borderLeft: '4px solid #e94560', paddingLeft: '1rem' }}>
        {brand ? `${brand} : ` : ''}{category} LIST
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {items.map((item: any) => (
          <Link 
            key={item.id} 
            href={brand ? `/brand/${brand}/${category}/${item.slug || item.id}` : `/${category}/${item.slug || item.id}`}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
              textDecoration: 'none',
              color: '#ccc',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#e94560' }}>{item.product_count} products</div>
          </Link>
        ))}
      </div>
    </main>
  );
}