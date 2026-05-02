// app/product/[unique_id]/page.tsx

import ProductDetail from '@/shared/components/organisms/ProductDetail';
import { fetchPCProductDetailByUid } from '@/shared/lib/api/django/pc/stats';

export default async function Page({ params }: any) {
  const unique_id = params.unique_id;

  console.log('=== UID ===', unique_id);

  const product = await fetchPCProductDetailByUid(unique_id);

  console.log('=== FETCH RESULT ===', product);

  if (!product) {
    return (
      <div style={{ padding: '16px', color: 'red' }}>
        ❌ 商品データが取得できていません
      </div>
    );
  }

  return <ProductDetail product={product} />;
}