// app/product/[id]/page.tsx

import ProductDetail from '@/shared/components/organisms/ProductDetail';
import { fetchPCProductDetail } from '@/shared/lib/api/django/pc/stats';

export default async function Page({ params }: any) {
  const id = params.id;

  // 🔍 デバッグ
  console.log('=== DETAIL PAGE ID ===', id);

  const product = await fetchPCProductDetail(id);

  console.log('=== FETCH RESULT ===', product);

  // ❗ データなし対策
  if (!product) {
    return (
      <div style={{ padding: '16px', color: 'red' }}>
        ❌ 商品データが取得できていません
      </div>
    );
  }

  return <ProductDetail product={product} />;
}