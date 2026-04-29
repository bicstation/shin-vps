'use client';

import Link from 'next/link';

type Product = {
  id: number;
  unique_id: string;
  title?: string;
  shortTitle?: string;
  image?: string;
  price?: number;
  mainTag?: string;
};

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title = product.shortTitle || product.title || 'おすすめ商品';
  const price = typeof product.price === 'number'
    ? product.price.toLocaleString()
    : '---';

  return (
    <section className="bg-slate-950 p-4 md:p-6 rounded-2xl border-2 border-orange-500 shadow-xl">

      {/* 🔥 タイトル */}
      <div className="text-center mb-3">
        <h2 className="text-base md:text-lg font-bold leading-tight">
          迷ってる時間が一番ムダ
        </h2>

        <div className="mt-1 text-xs md:text-sm">
          <div className="font-bold text-orange-400">
            これ選べばOK（万人向け最適構成）
          </div>
          <div className="text-gray-400">
            ゲームも仕事もこれ1台で問題なし
          </div>
        </div>
      </div>

      {/* 🚀 CTA */}
      <Link
        href={`/product/${product.unique_id}`}
        aria-label={`${title}の詳細を見る`}
        className="block w-full bg-orange-500 text-white text-center py-3 rounded-xl font-bold text-sm md:text-base shadow-lg hover:opacity-90 transition"
      >
        👉 詳細を見る（失敗しない理由を確認）
      </Link>

      {/* ⚠ 不安トリガー */}
      <div className="mt-1 text-[11px] text-red-400 text-center font-semibold">
        安いだけで選ぶと後悔します
      </div>

      {/* 🖼 画像 */}
      <div className="mt-3 flex justify-center">
        <img
          src={product.image || '/no-image.png'}
          alt={title}
          className="w-full max-w-[240px] md:max-w-[320px] rounded-xl"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/no-image.png';
          }}
        />
      </div>

      {/* 🏷 タグ */}
      {product.mainTag && (
        <div className="text-center text-xs text-gray-400 mt-2">
          {product.mainTag}
        </div>
      )}

      {/* 💰 価格 */}
      <div className="text-center text-lg md:text-xl font-bold mt-1">
        ¥{price}
      </div>

      {/* 🔥 意味付け */}
      <div className="text-center text-xs text-orange-400 font-semibold mt-1">
        この性能でこの価格はかなりお得
      </div>

      {/* ✅ 理由 */}
      <div className="mt-2 text-[11px] text-gray-400 text-center leading-tight">
        <div>性能・価格・用途のバランスが最も良い</div>
        <div>在庫切れになることがあります</div>
      </div>

      {/* 🔁 CTA再提示 */}
      <div className="mt-3 text-center">
        <Link
          href={`/product/${product.unique_id}`}
          aria-label={`${title}の詳細を見る`}
          className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
        >
          👉 迷ったらこれでOK
        </Link>
      </div>

    </section>
  );
}