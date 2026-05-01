// /home/maya/shin-vps/shared/components/organisms/ProductDetail.tsx

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Product = {
  id: number;
  unique_id?: string;
  title?: string;
  image?: string;
  price?: number;
  url?: string;
};

export default function ProductDetail({ product }: { product?: Product }) {

  // 🔍 デバッグ（重要）
  useEffect(() => {
    console.log('=== PRODUCT DETAIL ===');
    console.log(product);
    console.log('======================');
  }, [product]);

  // ❗ データなし対策
  if (!product) {
    return (
      <div className="p-4 text-red-500">
        ❌ 商品データが取得できていません
      </div>
    );
  }

  const title = product.title || 'おすすめ商品';

  const price =
    typeof product.price === 'number'
      ? `¥${product.price.toLocaleString()}`
      : '---';

  const image = product.image || '/no-image.png';

  return (
    <div className="max-w-[720px] mx-auto p-4">

      {/* =====================
       * 🔍 デバッグ表示（あとで消す）
       * ===================== */}
      <div className="text-[10px] text-gray-500 mb-2 break-all">
        <div>ID: {product.id}</div>
        <div>UID: {product.unique_id}</div>
        <div>URL: {product.url}</div>
        <div>IMAGE: {product.image}</div>
      </div>

      {/* =====================
       * ① ファーストビュー
       * ===================== */}
      <section>

        {/* 🖼 画像 */}
        <img
          src={image}
          alt={title}
          className="w-full h-[260px] object-cover rounded-xl"
          onError={(e) => {
            e.currentTarget.src = '/no-image.png';
          }}
        />

        {/* 🏷 タイトル */}
        <h1 className="mt-3 text-lg font-bold leading-tight">
          {title}
        </h1>

        {/* 💰 価格 */}
        <div className="text-2xl font-extrabold text-orange-500 mt-1">
          {price}
        </div>

        {/* 💡 価値 */}
        <div className="text-xs text-orange-400 mt-1">
          この価格でこの性能はかなり優秀
        </div>

        {/* 🚀 CTA（最優先） */}
        <Link
          href={product.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mt-4 bg-orange-500 text-white text-center py-4 rounded-xl font-bold text-base shadow-lg"
        >
          👉 今すぐチェック（在庫あり）
        </Link>

        {/* 🛡 安心 */}
        <div className="text-[11px] text-gray-400 text-center mt-2">
          送料無料・返品OKで安心
        </div>

      </section>

      {/* =====================
       * ② 即決
       * ===================== */}
      <section className="mt-6 text-center">
        <p className="text-base font-semibold">
          これ選べば失敗しない
        </p>
      </section>

      {/* =====================
       * ③ 強み（3つ）
       * ===================== */}
      <section className="mt-5 space-y-2">
        <div className="text-sm">✔ 高性能でサクサク動く</div>
        <div className="text-sm">✔ コスパがかなり良い</div>
        <div className="text-sm">✔ 初心者でも安心して使える</div>
      </section>

      {/* =====================
       * ④ 不安排除
       * ===================== */}
      <section className="mt-5 text-sm text-gray-500 space-y-1">
        <div>在庫切れになることがあります</div>
        <div>公式サイトで最新情報を確認できます</div>
      </section>

      {/* =====================
       * ⑤ CTA再配置
       * ===================== */}
      <section className="mt-6">
        <Link
          href={product.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold text-base shadow-lg"
        >
          👉 これでOK（失敗回避）
        </Link>
      </section>

    </div>
  );
}